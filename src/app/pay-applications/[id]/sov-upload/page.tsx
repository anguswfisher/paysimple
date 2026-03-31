'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { generateLineItemId } from '@/app/pay-applications/calculations'
import { UploadCloud, AlertTriangle, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import * as Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { LineItem } from '@/app/pay-applications/types'

const parseNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0
  const normalized = String(value).replace(/[^0-9.-]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeKey = (key: string) => key.trim().toLowerCase().replace(/[_\s]/g, '')

const findHeader = (keys: string[], patterns: string[]) =>
  keys.find(key => patterns.some(p => key.includes(p)))

const buildLineItems = (rows: Record<string, unknown>[]): LineItem[] => {
  const headers = Object.keys(rows[0] ?? {})
  const normalizedHeaders = headers.map(normalizeKey)

  const descriptionKey       = findHeader(normalizedHeaders, ['desc', 'description', 'item'])
  const scheduledKey         = findHeader(normalizedHeaders, ['scheduled', 'amount', 'value', 'price', 'total'])
  const previousWorkKey      = findHeader(normalizedHeaders, ['previouswork', 'worktodate', 'completed'])
  const previousMaterialsKey = findHeader(normalizedHeaders, ['previousmaterials', 'materialstodate', 'stored'])
  const thisPeriodWorkKey    = findHeader(normalizedHeaders, ['thisperiodwork', 'periodwork', 'currentwork'])
  const thisPeriodMatsKey    = findHeader(normalizedHeaders, ['thisperiodmaterials', 'materialsstored', 'currentmaterials'])

  return rows.map((rawRow, index) => {
    const row = Object.fromEntries(Object.entries(rawRow).map(([k, v]) => [normalizeKey(k), v]))
    return {
      id: generateLineItemId(),
      lineNumber: String(index + 1),
      description: String(row[descriptionKey ?? ''] ?? '').trim(),
      scheduledValue: parseNumber(row[scheduledKey ?? ''] ?? 0),
      previousWork: parseNumber(row[previousWorkKey ?? ''] ?? 0),
      thisPeriodWork: parseNumber(row[thisPeriodWorkKey ?? ''] ?? 0),
      previousMaterialsStored: parseNumber(row[previousMaterialsKey ?? ''] ?? 0),
      thisPeriodMaterialsStored: parseNumber(row[thisPeriodMatsKey ?? ''] ?? 0),
    }
  })
}

const parseSpreadsheetText = (text: string): LineItem[] => {
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true, skipEmptyLines: true,
    transformHeader: header => normalizeKey(header),
  })
  if (result.errors.length) throw new Error(result.errors.map(e => e.message).join(', '))
  if (result.data.length === 0) throw new Error('No rows were found in the uploaded file.')
  const items = buildLineItems(result.data)
  if (items.every(i => !i.description && i.scheduledValue === 0))
    throw new Error('File did not contain recognizable Schedule of Values rows.')
  return items
}

export default function SOVUploadPage() {
  const router = useRouter()
  const { currentPayApp, setLineItems } = usePayAppStore()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewItems, setPreviewItems] = useState<LineItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setPreviewItems([])
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const fileName = file.name.toLowerCase()
    try {
      let text: string
      if (fileName.endsWith('.xlsx')) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        if (!sheet) throw new Error('Unable to read the first sheet in the Excel file.')
        text = XLSX.utils.sheet_to_csv(sheet)
      } else if (fileName.endsWith('.csv')) {
        text = await file.text()
      } else {
        throw new Error('Please upload a CSV or XLSX file.')
      }
      setPreviewItems(parseSpreadsheetText(text))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to parse the uploaded file.')
    }
  }

  const handleContinue = async () => {
    if (!currentPayApp || previewItems.length === 0) return
    setIsLoading(true)
    try {
      await setLineItems(previewItems)
      router.push(`/pay-applications/${currentPayApp.id}/workspace`)
    } catch {
      setError('Failed to import spreadsheet. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentPayApp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate/50">Pay application not found.</div>
      </div>
    )
  }

  const guide = (
    <StepGuide
      title="Upload Spreadsheet"
      subtitle="Import your SOV from a CSV or Excel file you've already prepared."
      blocks={[
        {
          type: 'intro',
          text: 'Upload a CSV (.csv) or Excel (.xlsx) file containing your Schedule of Values. The system reads the first sheet and maps columns by header name.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
          heading: 'Required Columns',
          body: [
            'Description — the name of each work item',
            'Scheduled Value — the contract amount for the item',
          ],
        },
        {
          type: 'section',
          heading: 'Optional Columns',
          body: [
            'Previous Work — work completed in prior applications',
            'This Period Work — work completed this period',
            'Previous Materials Stored',
            'This Period Materials Stored',
          ],
        },
        {
          type: 'tip',
          text: 'Header names are flexible — "Sched. Value", "Amount", and "scheduled_value" all map to the Scheduled Value column. The parser normalizes casing and spacing.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          heading: 'File Preparation Tips',
          body: [
            'Use row 1 as the header row — no blank rows above it.',
            'Remove sub-total and grand total rows before uploading.',
            'Remove any merged cells (they break CSV parsing).',
            'Dollar signs and commas in numbers are fine — the parser strips them.',
          ],
        },
        {
          type: 'warning',
          text: 'Excel files with multiple sheets: only the first sheet is imported. Move your SOV data to Sheet 1 before uploading.',
        },
        {
          type: 'checklist',
          heading: 'Before uploading',
          items: [
            'File is .csv or .xlsx format',
            'Row 1 contains column headers',
            'No merged cells or sub-total rows',
            'Scheduled values sum to your contract amount',
          ],
        },
      ]}
    />
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-8 pt-7 pb-5 border-b border-slate/10">
        <div className="flex items-center gap-2 text-xs font-medium text-slate/40 uppercase tracking-widest mb-2">
          <span>Step 3</span>
          <span className="text-slate/20">·</span>
          <span>SOV</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Spreadsheet</h1>
        <p className="text-sm text-slate/55 mt-1">Import line items from a CSV or Excel file.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-4">
          <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm space-y-4">
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="hidden" />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate/20 rounded-xl py-10 px-6 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-teal-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">Click to choose a file</p>
                <p className="text-xs text-slate/45 mt-1">CSV or XLSX — max 10 MB</p>
              </div>
              <Button type="button" variant="outline" className="text-sm border-slate/20">
                Browse files
              </Button>
            </div>

            {selectedFile && !error && (
              <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                {selectedFile.name}
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {previewItems.length > 0 && (
            <div className="bg-white border border-slate/15 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate/50">
                  Preview — {previewItems.length} rows imported
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate/8 bg-slate/3">
                    <th className="text-left py-2 px-4 text-xs text-slate/40 font-medium">#</th>
                    <th className="text-left py-2 px-4 text-xs text-slate/40 font-medium">Description</th>
                    <th className="text-right py-2 px-4 text-xs text-slate/40 font-medium">Scheduled Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate/5">
                  {previewItems.slice(0, 5).map(item => (
                    <tr key={item.id}>
                      <td className="py-2 px-4 text-xs tabular-nums text-slate/50">{item.lineNumber}</td>
                      <td className="py-2 px-4 text-sm text-slate-700">{item.description}</td>
                      <td className="py-2 px-4 text-sm text-right tabular-nums text-slate-700">${item.scheduledValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewItems.length > 5 && (
                <div className="px-4 py-2 text-xs text-slate/40 text-center border-t border-slate/5">
                  Showing first 5 of {previewItems.length} rows
                </div>
              )}
            </div>
          )}
        </div>

        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push(`/pay-applications/${currentPayApp.id}/sov-method`)}
          onContinue={handleContinue}
          continueLabel="Import & Continue"
          continueDisabled={previewItems.length === 0 || isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}

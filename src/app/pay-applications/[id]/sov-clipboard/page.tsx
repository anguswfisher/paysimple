'use client'

import { useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { generateLineItemId } from '@/app/pay-applications/calculations'
import { ClipboardCopy, AlertTriangle, Table2, Columns } from 'lucide-react'
import * as Papa from 'papaparse'
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

  const descriptionKey = findHeader(normalizedHeaders, ['desc', 'description', 'item'])
  const scheduledKey   = findHeader(normalizedHeaders, ['scheduled', 'amount', 'value', 'total', 'price'])
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

const parseClipboardText = (text: string): LineItem[] => {
  const headerResult = Papa.parse<Record<string, unknown>>(text, {
    header: true, skipEmptyLines: true,
    transformHeader: header => normalizeKey(header),
  })

  if (headerResult.errors.length) throw new Error(headerResult.errors.map(e => e.message).join(', '))

  if (headerResult.data.length > 0 && Object.keys(headerResult.data[0]).length > 1) {
    const items = buildLineItems(headerResult.data)
    if (items.some(i => i.description || i.scheduledValue)) return items
  }

  const fallback = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true })
  if (fallback.errors.length) throw new Error(fallback.errors.map(e => e.message).join(', '))

  return buildLineItems(fallback.data.map(row => ({
    description: row[0] ?? '',
    scheduledValue: row[1] ?? 0,
    previousWork: row[2] ?? 0,
    thisPeriodWork: row[3] ?? 0,
    previousMaterialsStored: row[4] ?? 0,
    thisPeriodMaterialsStored: row[5] ?? 0,
  })))
}

export default function SOVClipboardPage() {
  const router = useRouter()
  const { currentPayApp, setLineItems } = usePayAppStore()
  const [clipboardText, setClipboardText] = useState('')
  const [previewItems, setPreviewItems] = useState<LineItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePasteText = async () => {
    setError(null)
    try {
      const text = await navigator.clipboard.readText()
      if (!text) { setError('Clipboard is empty or browser denied access.'); return }
      setClipboardText(text)
      setPreviewItems(parseClipboardText(text))
    } catch {
      setError('Unable to read clipboard. Paste your values into the text box instead.')
    }
  }

  const handleParse = () => {
    setError(null)
    try { setPreviewItems(parseClipboardText(clipboardText)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to parse input.'); setPreviewItems([]) }
  }

  const handleContinue = async () => {
    if (!currentPayApp || previewItems.length === 0) return
    setIsLoading(true)
    try {
      await setLineItems(previewItems)
      router.push(`/pay-applications/${currentPayApp.id}/workspace`)
    } catch {
      setError('Failed to import. Please try again.')
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
      title="Paste from Clipboard"
      subtitle="Import your SOV data by copying rows from a spreadsheet."
      blocks={[
        {
          type: 'intro',
          text: 'Copy rows from Excel or Google Sheets and paste them here. The parser auto-detects columns by header name and maps them to the correct fields.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Table2 className="w-3.5 h-3.5" />,
          heading: 'Supported Header Names',
          body: [
            'Description (or "Item", "Desc")',
            'Scheduled Value (or "Amount", "Value", "Price")',
            'Previous Work (or "Work to Date", "Completed")',
            'This Period Work (or "Period Work", "Current Work")',
            'Materials Stored (or "Materials to Date")',
          ],
        },
        {
          type: 'tip',
          text: 'Headers don\'t need to match exactly — the parser is flexible. "Sched. Value" and "scheduled_value" both map correctly.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Columns className="w-3.5 h-3.5" />,
          heading: 'No Headers? Use Column Order',
          body: 'If your data has no header row, columns are read left to right as: Description, Scheduled Value, Previous Work, This Period Work, Previous Materials, This Period Materials.',
        },
        {
          type: 'warning',
          text: 'Remove any total rows, blank rows, or merged cells before pasting. These will be interpreted as line items and create incorrect data.',
        },
        {
          type: 'checklist',
          heading: 'Before pasting',
          items: [
            'Select only data rows (include the header row)',
            'Remove any sub-total or grand total rows',
            'Remove merged cells — they confuse the parser',
            'Check the preview before clicking Continue',
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Paste from Clipboard</h1>
        <p className="text-sm text-slate/55 mt-1">Paste rows from Excel, Google Sheets, or another application.</p>
      </div>

      <WizardSplitPane guide={guide}>
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-4">
          <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={handlePasteText} className="bg-teal-600 hover:bg-teal-700 text-white text-sm">
                <ClipboardCopy className="w-4 h-4 mr-2" />
                Read from Clipboard
              </Button>
              <Button type="button" variant="secondary" onClick={handleParse} className="text-sm">
                Parse pasted data
              </Button>
            </div>

            <textarea
              value={clipboardText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => { setClipboardText(e.target.value); setError(null) }}
              rows={8}
              placeholder={'Paste rows here, e.g.:\nDescription,Scheduled Value,Previous Work\nFraming,$12,000,$4,000'}
              className="w-full rounded-lg border border-slate/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 font-mono resize-y"
            />

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

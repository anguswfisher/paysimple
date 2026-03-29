'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Plus, Trash2, Info } from 'lucide-react'
import { generateLineItemId } from '@/app/pay-applications/calculations'
import type { LineItem } from '@/app/pay-applications/types'

export default function SOVManualPage() {
  const router = useRouter()
  const { currentPayApp, setLineItems } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      router.push(`/pay-applications/${currentPayApp?.id}/workspace`)
    } catch (error) {
      console.error('Failed to navigate to workspace:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/sov-method`)
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: generateLineItemId(),
      lineNumber: String((currentPayApp?.lineItems.length || 0) + 1),
      description: '',
      scheduledValue: 0,
      previousWork: 0,
      thisPeriodWork: 0,
      previousMaterialsStored: 0,
      thisPeriodMaterialsStored: 0,
    }
    
    const updatedItems = [...(currentPayApp?.lineItems || []), newItem]
    setLineItems(updatedItems)
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    if (!currentPayApp) return
    
    let updatedItems: LineItem[]
    
    // Handle line number reordering separately
    if (field === 'lineNumber') {
      const newLineNumber = String(value)
      const oldLineNumber = currentPayApp.lineItems.find(item => item.id === id)?.lineNumber || '1'
      
      updatedItems = currentPayApp.lineItems.map(item => {
        if (item.id === id) {
          return { ...item, lineNumber: newLineNumber }
        } else if (parseInt(item.lineNumber) >= parseInt(newLineNumber) && parseInt(item.lineNumber) < parseInt(oldLineNumber)) {
          return { ...item, lineNumber: String(parseInt(item.lineNumber) + 1) }
        } else if (parseInt(item.lineNumber) <= parseInt(newLineNumber) && parseInt(item.lineNumber) > parseInt(oldLineNumber)) {
          return { ...item, lineNumber: String(parseInt(item.lineNumber) - 1) }
        }
        return item
      })
    } else {
      // Simple field update
      updatedItems = currentPayApp.lineItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }
    
    setLineItems(updatedItems)
  }

  const deleteLineItem = (id: string) => {
    if (!currentPayApp || currentPayApp.lineItems.length <= 1) return
    
    const updatedItems = currentPayApp.lineItems
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, lineNumber: String(index + 1) }))
    
    setLineItems(updatedItems)
  }

  const totalScheduledValue = currentPayApp?.lineItems.reduce(
    (sum, item) => sum + (item.scheduledValue || 0), 0
  ) || 0

  // Initialize with one empty row if no line items exist
  useEffect(() => {
    if (currentPayApp && (!currentPayApp.lineItems || currentPayApp.lineItems.length === 0)) {
      addLineItem()
    }
  }, [currentPayApp])

  if (!currentPayApp) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate/70 mb-2">Pay application not found</div>
          <div className="text-sm text-slate/50">Redirecting to pay applications...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Enter Schedule of Values</h1>
        <p className="text-slate/70 mt-1">
          Add line items for your pay application manually
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Line Items Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate/10 bg-slate/5">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate/70 w-20">
                        Line #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-70">
                        Description
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-70 w-40">
                        Scheduled Value
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-slate/70 w-20">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayApp.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate/5">
                        {/* Line Number */}
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="1"
                            value={item.lineNumber}
                            onChange={(e) => updateLineItem(item.id, 'lineNumber', parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border border-slate/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </td>
                        
                        {/* Description */}
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder="Enter line item description"
                            className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </td>
                        
                        {/* Scheduled Value */}
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="text-slate-700 mr-1">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.scheduledValue}
                              onChange={(e) => updateLineItem(item.id, 'scheduledValue', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-right"
                            />
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteLineItem(item.id)}
                            disabled={currentPayApp.lineItems.length <= 1}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate/10 bg-slate/5">
                      <td colSpan={2} className="py-3 px-4 text-sm font-semibold text-slate-900">
                        Total Scheduled Value:
                      </td>
                      <td colSpan={2} className="py-3 px-4 text-sm font-semibold text-slate-900 text-right tabular-nums">
                        ${totalScheduledValue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Add Row Button */}
          <div className="flex justify-center">
            <button
              onClick={addLineItem}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>

          {/* Info Callout */}
          <Card className="border-teal-200 bg-teal-50/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-teal-600 mt-0.5" />
                <p className="text-teal-800 text-sm">
                  You can add more details and enter work completed in the full workspace editor.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Continue to Workspace"
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}

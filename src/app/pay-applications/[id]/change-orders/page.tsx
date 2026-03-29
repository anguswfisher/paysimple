'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Plus, Trash2 } from 'lucide-react'
import type { ChangeOrderSettings, ChangeOrder, ChangeOrderMode } from '@/app/pay-applications/types'
import { generateChangeOrderId } from '@/app/pay-applications/calculations'

export default function ChangeOrdersPage() {
  const router = useRouter()
  const { currentPayApp, updateChangeOrderSettings, markStepCompleted } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [hasChangeOrders, setHasChangeOrders] = useState(false)
  const [mode, setMode] = useState<ChangeOrderMode>('totals-only')
  const [totalAmount, setTotalAmount] = useState('')
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([])

  // Initialize from current pay app
  useEffect(() => {
    if (currentPayApp?.changeOrderSettings) {
      const settings = currentPayApp.changeOrderSettings
      setHasChangeOrders(settings.hasChangeOrders)
      setMode(settings.mode)
      setTotalAmount(settings.totalAmount?.toString() || '')
      setChangeOrders(settings.changeOrders || [])
    }
  }, [currentPayApp])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      const changeOrderSettings: ChangeOrderSettings = {
        hasChangeOrders,
        mode,
        changeOrders: mode === 'individual' ? changeOrders : [],
        ...(mode === 'totals-only' && totalAmount ? { totalAmount: parseFloat(totalAmount) || 0 } : {}),
      }

      await updateChangeOrderSettings(changeOrderSettings)
      await markStepCompleted(4)
      router.push(`/pay-applications/${currentPayApp?.id}/materials-stored`)
    } catch (error) {
      console.error('Failed to save change order settings:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/retainage`)
  }

  const addChangeOrder = () => {
    const newChangeOrder: ChangeOrder = {
      id: generateChangeOrderId(),
      number: '',
      description: '',
      amount: 0,
    }
    setChangeOrders(prev => [...prev, newChangeOrder])
  }

  const updateChangeOrder = (id: string, field: keyof ChangeOrder, value: string | number) => {
    setChangeOrders(prev => 
      prev.map(co => 
        co.id === id ? { ...co, [field]: value } : co
      )
    )
  }

  const deleteChangeOrder = (id: string) => {
    setChangeOrders(prev => prev.filter(co => co.id !== id))
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Change Orders</h1>
        <p className="text-slate/70 mt-1">
          Optionally add approved change orders for this billing period
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Include Change Orders Toggle */}
          <Card>
            <CardContent className="p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasChangeOrders}
                  onChange={(e) => setHasChangeOrders(e.target.checked)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30 rounded"
                />
                <div>
                  <div className="text-slate-700">Include change orders</div>
                  <div className="text-sm text-slate/60">
                    Do you have approved change orders for this billing period?
                  </div>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Change Order Configuration - Only show when enabled */}
          {hasChangeOrders && (
            <>
              {/* Entry Mode */}
              <Card>
                <CardHeader>
                  <CardTitle style={{ fontVariant: 'small-caps' }}>
                    Entry Mode
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { value: 'totals-only' as const, label: 'Enter total amount only' },
                      { value: 'individual' as const, label: 'List individual change orders' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="changeOrderMode"
                          value={option.value}
                          checked={mode === option.value}
                          onChange={(e) => setMode(e.target.value as ChangeOrderMode)}
                          className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate/30"
                        />
                        <span className="text-slate-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Totals Only Mode */}
              {mode === 'totals-only' && (
                <Card>
                  <CardHeader>
                    <CardTitle style={{ fontVariant: 'small-caps' }}>
                      Total Change Order Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="w-32 px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="0.00"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Individual Change Orders Mode */}
              {mode === 'individual' && (
                <Card>
                  <CardHeader>
                    <CardTitle style={{ fontVariant: 'small-caps' }}>
                      Individual Change Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {changeOrders.length === 0 ? (
                      <div className="text-center py-8 text-slate/60">
                        <p className="mb-4">No change orders added yet</p>
                        <button
                          onClick={addChangeOrder}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Change Order
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {changeOrders.map((changeOrder) => (
                          <div key={changeOrder.id} className="grid grid-cols-12 gap-3 items-center">
                            {/* CO # */}
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={changeOrder.number}
                                onChange={(e) => updateChangeOrder(changeOrder.id, 'number', e.target.value)}
                                className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder="CO #"
                              />
                            </div>
                            
                            {/* Description */}
                            <div className="col-span-6">
                              <input
                                type="text"
                                value={changeOrder.description}
                                onChange={(e) => updateChangeOrder(changeOrder.id, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Description"
                              />
                            </div>
                            
                            {/* Amount */}
                            <div className="col-span-3">
                              <div className="flex items-center gap-1">
                                <span className="text-slate-700 text-sm">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={changeOrder.amount}
                                  onChange={(e) => updateChangeOrder(changeOrder.id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-slate/30 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            
                            {/* Delete Button */}
                            <div className="col-span-1">
                              <button
                                onClick={() => deleteChangeOrder(changeOrder.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Change Order Button */}
                        <button
                          onClick={addChangeOrder}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Change Order
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Continue"
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}

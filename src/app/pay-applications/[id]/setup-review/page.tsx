'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { 
  Table, 
  PiggyBank, 
  ArrowRightLeft, 
  Package, 
  Edit 
} from 'lucide-react'

interface SummaryCard {
  title: string
  icon: React.ReactNode
  value: string
  editHref: string
}

export default function SetupReviewPage() {
  const router = useRouter()
  const { currentPayApp, markStepCompleted } = usePayAppStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // This page doesn't need to load anything since we're just reading from currentPayApp
  }, [])

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      await markStepCompleted(6)
      router.push(`/pay-applications/${currentPayApp?.id}/sov-method`)
    } catch (error) {
      console.error('Failed to mark setup review as completed:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/materials-stored`)
  }

  // Generate summary data
  const getSummaryCards = (): SummaryCard[] => {
    if (!currentPayApp) return []

    const { billingFormat, retainageSettings, changeOrderSettings, materialsStoredEnabled } = currentPayApp

    // Billing Format
    const billingFormatValue = billingFormat === 'schedule-of-values' 
      ? 'Schedule of Values (G703)' 
      : 'Total Only'

    // Retainage
    let retainageValue = `${retainageSettings.retainagePercent}% on `
    if (retainageSettings.appliesTo === 'work') {
      retainageValue += 'work only'
    } else if (retainageSettings.appliesTo === 'materials') {
      retainageValue += 'materials only'
    } else {
      retainageValue += 'work and materials'
    }

    // Change Orders
    let changeOrdersValue = 'None'
    if (changeOrderSettings.hasChangeOrders) {
      if (changeOrderSettings.mode === 'totals-only' && changeOrderSettings.totalAmount) {
        changeOrdersValue = `Total: $${changeOrderSettings.totalAmount.toLocaleString()}`
      } else if (changeOrderSettings.mode === 'individual') {
        const count = changeOrderSettings.changeOrders.length
        changeOrdersValue = `${count} change order${count !== 1 ? 's' : ''}`
      }
    }

    // Materials Stored
    const materialsStoredValue = materialsStoredEnabled ? 'Enabled' : 'Disabled'

    return [
      {
        title: 'Billing Format',
        icon: <Table className="w-5 h-5" />,
        value: billingFormatValue,
        editHref: `/pay-applications/${currentPayApp.id}/billing-format`,
      },
      {
        title: 'Retainage',
        icon: <PiggyBank className="w-5 h-5" />,
        value: retainageValue,
        editHref: `/pay-applications/${currentPayApp.id}/retainage`,
      },
      {
        title: 'Change Orders',
        icon: <ArrowRightLeft className="w-5 h-5" />,
        value: changeOrdersValue,
        editHref: `/pay-applications/${currentPayApp.id}/change-orders`,
      },
      {
        title: 'Materials Stored',
        icon: <Package className="w-5 h-5" />,
        value: materialsStoredValue,
        editHref: `/pay-applications/${currentPayApp.id}/materials-stored`,
      },
    ]
  }

  const summaryCards = getSummaryCards()

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
        <h1 className="text-2xl font-bold text-slate-900">Setup Review</h1>
        <p className="text-slate/70 mt-1">
          Review your pay application settings before building the schedule of values
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 gap-6">
            {summaryCards.map((card) => (
              <Card key={card.title} className="border-slate/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{card.title}</h3>
                      </div>
                    </div>
                    <Link href={card.editHref}>
                      <button className="p-2 text-slate/60 hover:text-slate-900 hover:bg-slate/5 rounded-md transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                  <p className="text-slate-700 font-medium">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Callout */}
          <Card className="border-teal-200 bg-teal-50/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-600 mt-2" />
                <p className="text-teal-800">
                  Next, you'll build your schedule of values by importing from a previous pay app or entering line items manually.
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
        continueLabel="Continue to Schedule of Values"
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}

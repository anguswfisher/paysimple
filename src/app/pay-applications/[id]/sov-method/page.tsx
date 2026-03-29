'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Copy, Edit, Upload, Clipboard } from 'lucide-react'

interface SOVMethod {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  disabled?: boolean
  badge?: string
  route: string
}

export default function SOVMethodPage() {
  const router = useRouter()
  const { currentPayApp, markStepCompleted } = usePayAppStore()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const sovMethods: SOVMethod[] = [
    {
      id: 'import',
      title: 'Import from Previous Pay App',
      description: 'Copy line items from a previous application',
      icon: <Copy className="w-6 h-6" />,
      route: `/pay-applications/${currentPayApp?.id}/sov-import`,
    },
    {
      id: 'manual',
      title: 'Enter Manually',
      description: 'Create line items from scratch',
      icon: <Edit className="w-6 h-6" />,
      route: `/pay-applications/${currentPayApp?.id}/sov-manual`,
    },
    {
      id: 'upload',
      title: 'Upload Spreadsheet',
      description: 'Import from Excel or CSV file',
      icon: <Upload className="w-6 h-6" />,
      disabled: true,
      badge: 'Coming soon',
      route: '',
    },
    {
      id: 'clipboard',
      title: 'Paste from Clipboard',
      description: 'Copy and paste from another application',
      icon: <Clipboard className="w-6 h-6" />,
      disabled: true,
      badge: 'Coming soon',
      route: '',
    },
  ]

  const handleContinue = async () => {
    if (!selectedMethod) return

    setIsLoading(true)
    try {
      await markStepCompleted(7)
      
      const selectedMethodData = sovMethods.find(method => method.id === selectedMethod)
      if (selectedMethodData && selectedMethodData.route) {
        router.push(selectedMethodData.route)
      }
    } catch (error) {
      console.error('Failed to mark SOV method as completed:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push(`/pay-applications/${currentPayApp?.id}/setup-review`)
  }

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
        <h1 className="text-2xl font-bold text-slate-900">Schedule of Values Method</h1>
        <p className="text-slate/70 mt-1">
          Choose how you want to build your schedule of values
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Method Cards Grid */}
          <div className="grid grid-cols-2 gap-6">
            {sovMethods.map((method) => (
              <Card
                key={method.id}
                className={`
                  cursor-pointer transition-all duration-200
                  ${method.disabled
                    ? 'border-slate/10 bg-slate/5 opacity-60 cursor-not-allowed'
                    : selectedMethod === method.id
                    ? 'border-teal-600 bg-teal-50/30'
                    : 'border-slate/20 hover:border-slate/40'
                  }
                `}
                onClick={() => !method.disabled && setSelectedMethod(method.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      ${method.disabled
                        ? 'bg-slate/20 text-slate/40'
                        : selectedMethod === method.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-teal-100 text-teal-600'
                      }
                    `}>
                      {method.icon}
                    </div>
                    
                    {method.badge && (
                      <Badge className="bg-slate/100 text-slate/600 border-slate/200 text-xs">
                        {method.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 ${
                    method.disabled ? 'text-slate/50' : 'text-slate-900'
                  }`}>
                    {method.title}
                  </h3>
                  <p className={`text-sm ${
                    method.disabled ? 'text-slate/40' : 'text-slate/70'
                  }`}>
                    {method.description}
                  </p>
                  
                  {selectedMethod === method.id && !method.disabled && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-600" />
                      <span className="text-sm font-medium text-teal-600">Selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <WizardActionBar
        onSaveAndExit={handleSaveAndExit}
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel="Continue"
        continueDisabled={!selectedMethod || isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}

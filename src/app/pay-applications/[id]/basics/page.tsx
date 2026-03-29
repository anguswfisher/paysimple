'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { usePayAppStore } from '@/app/pay-applications/store'
import type { PayAppBasics } from '@/app/pay-applications/types'

interface FormErrors {
  projectName?: string
  ownerName?: string
  contractorName?: string
  applicationNumber?: string
  periodStartDate?: string
  periodEndDate?: string
  paymentDueDate?: string
}

export default function BasicsPage() {
  const router = useRouter()
  const { currentPayApp, updateBasics, markStepCompleted } = usePayAppStore()
  const [formData, setFormData] = useState<PayAppBasics>({
    projectName: '',
    ownerName: '',
    contractorName: '',
    applicationNumber: '',
    periodStartDate: '',
    periodEndDate: '',
    paymentDueDate: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  // Pre-populate form data from current pay app
  useEffect(() => {
    if (currentPayApp?.basics) {
      setFormData(currentPayApp.basics)
    }
  }, [currentPayApp])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required'
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required'
    }
    if (!formData.contractorName.trim()) {
      newErrors.contractorName = 'Contractor name is required'
    }
    if (!formData.applicationNumber.trim()) {
      newErrors.applicationNumber = 'Application number is required'
    }
    if (!formData.periodStartDate) {
      newErrors.periodStartDate = 'Period start date is required'
    }
    if (!formData.periodEndDate) {
      newErrors.periodEndDate = 'Period end date is required'
    }
    if (!formData.paymentDueDate) {
      newErrors.paymentDueDate = 'Payment due date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof PayAppBasics, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleContinue = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await updateBasics(formData)
      await markStepCompleted(1)

      // Navigate based on entry mode
      if (currentPayApp?.entryMode === 'blank') {
        router.push(`/pay-applications/${currentPayApp?.id}/workspace`)
      } else {
        router.push(`/pay-applications/${currentPayApp?.id}/billing-format`)
      }
    } catch (error) {
      console.error('Failed to save basics:', error)
      // TODO: Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndExit = () => {
    router.push('/pay-applications')
  }

  const handleBack = () => {
    router.push('/pay-applications/new')
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Page Header */}
      <div className="p-6 border-b border-slate/10">
        <h1 className="text-2xl font-bold text-slate-900">Application Basics</h1>
        <p className="text-slate/70 mt-1">
          Enter the basic information for this pay application
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontVariant: 'small-caps' }}>
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Name - Full Width */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.projectName ? 'border-red-500' : 'border-slate/30'
                  }`}
                  placeholder="Enter project name"
                />
                {errors.projectName && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
                )}
              </div>

              {/* Owner Name + Contractor Name - Two Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.ownerName ? 'border-red-500' : 'border-slate/30'
                    }`}
                    placeholder="Enter owner name"
                  />
                  {errors.ownerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Contractor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contractorName}
                    onChange={(e) => handleInputChange('contractorName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.contractorName ? 'border-red-500' : 'border-slate/30'
                    }`}
                    placeholder="Enter contractor name"
                  />
                  {errors.contractorName && (
                    <p className="mt-1 text-sm text-red-600">{errors.contractorName}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontVariant: 'small-caps' }}>
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Application Number *
                </label>
                <input
                  type="text"
                  value={formData.applicationNumber}
                  onChange={(e) => handleInputChange('applicationNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.applicationNumber ? 'border-red-500' : 'border-slate/30'
                  }`}
                  placeholder="e.g., 1, 2, 3"
                />
                {errors.applicationNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.applicationNumber}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing Period */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontVariant: 'small-caps' }}>
                Billing Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Period Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.periodStartDate}
                    onChange={(e) => handleInputChange('periodStartDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.periodStartDate ? 'border-red-500' : 'border-slate/30'
                    }`}
                  />
                  {errors.periodStartDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.periodStartDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Period End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.periodEndDate}
                    onChange={(e) => handleInputChange('periodEndDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.periodEndDate ? 'border-red-500' : 'border-slate/30'
                    }`}
                  />
                  {errors.periodEndDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.periodEndDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Payment Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.paymentDueDate}
                    onChange={(e) => handleInputChange('paymentDueDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.paymentDueDate ? 'border-red-500' : 'border-slate/30'
                    }`}
                  />
                  {errors.paymentDueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentDueDate}</p>
                  )}
                </div>
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
        continueLabel="Continue"
        continueDisabled={isLoading}
        isLoading={isLoading}
      />
    </div>
  )
}

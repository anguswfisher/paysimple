'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardActionBar } from '@/components/pay-applications/WizardActionBar'
import { WizardSplitPane } from '@/components/pay-applications/WizardSplitPane'
import { StepGuide } from '@/components/pay-applications/StepGuide'
import { usePayAppStore } from '@/app/pay-applications/store'
import { Building2, CalendarRange, FileText, Hash, Users, Calendar } from 'lucide-react'
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

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wide text-slate/60 uppercase mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-danger flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-danger" />
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate/35
   focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500
   transition-colors duration-150
   ${hasError ? 'border-danger/60 bg-danger/5' : 'border-slate/20 hover:border-slate/35'}`

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

  useEffect(() => {
    if (currentPayApp?.basics) {
      setFormData(currentPayApp.basics)
    }
  }, [currentPayApp])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.projectName.trim())     newErrors.projectName = 'Required'
    if (!formData.ownerName.trim())       newErrors.ownerName = 'Required'
    if (!formData.contractorName.trim())  newErrors.contractorName = 'Required'
    if (!formData.applicationNumber.trim()) newErrors.applicationNumber = 'Required'
    if (!formData.periodStartDate)        newErrors.periodStartDate = 'Required'
    if (!formData.periodEndDate)          newErrors.periodEndDate = 'Required'
    if (!formData.paymentDueDate)         newErrors.paymentDueDate = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof PayAppBasics, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleContinue = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    try {
      await updateBasics(formData)
      await markStepCompleted(1)
      if (currentPayApp?.entryMode === 'blank') {
        router.push(`/pay-applications/${currentPayApp?.id}/workspace`)
      } else {
        router.push(`/pay-applications/${currentPayApp?.id}/billing-format`)
      }
    } catch (error) {
      console.error('Failed to save basics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const guide = (
    <StepGuide
      title="Application Basics"
      subtitle="Understanding the core fields that identify your pay application."
      blocks={[
        {
          type: 'intro',
          text: 'A pay application (AIA G702) is the formal document a contractor submits to request payment for work completed during a billing period. Every field here appears on the final form submitted to the owner or architect.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Building2 className="w-3.5 h-3.5" />,
          heading: 'Project Name',
          body: 'Use the official project name as it appears in your contract. This flows through to all generated documents — consistency avoids disputes.',
        },
        {
          type: 'section',
          icon: <Users className="w-3.5 h-3.5" />,
          heading: 'Owner vs. Contractor',
          body: [
            'Owner — the entity that owns the property and is funding the project (your client).',
            'Contractor — the company performing the work and submitting this application (typically you).',
          ],
        },
        {
          type: 'tip',
          text: 'Match names exactly to your contract documents. Discrepancies between your pay app and the contract can delay certification.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Hash className="w-3.5 h-3.5" />,
          heading: 'Application Number',
          body: 'Start at 1 for the first application on a project and increment by 1 each billing cycle. Owners and architects use this to track the payment history of a project.',
        },
        {
          type: 'warning',
          text: 'Never reuse or skip numbers. If an application is voided, record it as void — don\'t renumber the ones that follow.',
        },
        { type: 'divider' },
        {
          type: 'section',
          icon: <Calendar className="w-3.5 h-3.5" />,
          heading: 'Billing Period',
          body: 'The period covers the span of work being billed — typically one calendar month. It does not have to align with the calendar month exactly.',
        },
        {
          type: 'glossary',
          terms: [
            {
              term: 'Period Start / End',
              definition: 'The date range during which the billed work was performed. Work outside this range should be deferred to the next application.',
            },
            {
              term: 'Payment Due Date',
              definition: 'The contractual deadline by which the owner must certify and issue payment. Typically 7–30 days after submission per AIA contract terms.',
            },
          ],
        },
        {
          type: 'checklist',
          heading: 'Before you continue',
          items: [
            'Project name matches your signed contract exactly',
            'Application number is one higher than the previous application',
            'Billing period end date is on or before today',
            'Payment due date is within your contract\'s payment window',
          ],
        },
      ]}
    />
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Page Header */}
      <div className="px-8 pt-7 pb-5 border-b border-slate/10">
        <div className="flex items-center gap-2 text-xs font-medium text-slate/40 uppercase tracking-widest mb-2">
          <span>Step 1</span>
          <span className="text-slate/20">·</span>
          <span>Setup</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Basics</h1>
        <p className="text-sm text-slate/55 mt-1">
          Enter the core details that identify this pay application.
        </p>
      </div>

      {/* Split: form left, guide right */}
      <WizardSplitPane guide={guide}>
        {/* Form content — scrollable middle section */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="space-y-6">

            {/* Project Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-700" style={{ fontVariant: 'small-caps', letterSpacing: '0.04em' }}>
                  Project Information
                </h2>
              </div>

              <div className="bg-white border border-slate/15 rounded-xl p-5 space-y-4 shadow-sm">
                <Field label="Project Name" error={errors.projectName}>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={e => handleInputChange('projectName', e.target.value)}
                    className={inputClass(!!errors.projectName)}
                    placeholder="e.g., Downtown Office Renovation"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Owner Name" error={errors.ownerName}>
                    <input
                      type="text"
                      value={formData.ownerName}
                      onChange={e => handleInputChange('ownerName', e.target.value)}
                      className={inputClass(!!errors.ownerName)}
                      placeholder="Property owner"
                    />
                  </Field>
                  <Field label="Contractor Name" error={errors.contractorName}>
                    <input
                      type="text"
                      value={formData.contractorName}
                      onChange={e => handleInputChange('contractorName', e.target.value)}
                      className={inputClass(!!errors.contractorName)}
                      placeholder="General contractor"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Application Details */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-700" style={{ fontVariant: 'small-caps', letterSpacing: '0.04em' }}>
                  Application Details
                </h2>
              </div>

              <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm">
                <div className="max-w-xs">
                  <Field label="Application Number" error={errors.applicationNumber}>
                    <input
                      type="text"
                      value={formData.applicationNumber}
                      onChange={e => handleInputChange('applicationNumber', e.target.value)}
                      className={inputClass(!!errors.applicationNumber)}
                      placeholder="e.g., 1, 2, 3"
                    />
                  </Field>
                  <p className="mt-1.5 text-xs text-slate/40">
                    Sequential number identifying this pay application in the project.
                  </p>
                </div>
              </div>
            </section>

            {/* Billing Period */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
                  <CalendarRange className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-700" style={{ fontVariant: 'small-caps', letterSpacing: '0.04em' }}>
                  Billing Period
                </h2>
              </div>

              <div className="bg-white border border-slate/15 rounded-xl p-5 shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Period Start" error={errors.periodStartDate}>
                    <input
                      type="date"
                      value={formData.periodStartDate}
                      onChange={e => handleInputChange('periodStartDate', e.target.value)}
                      className={inputClass(!!errors.periodStartDate)}
                    />
                  </Field>
                  <Field label="Period End" error={errors.periodEndDate}>
                    <input
                      type="date"
                      value={formData.periodEndDate}
                      onChange={e => handleInputChange('periodEndDate', e.target.value)}
                      className={inputClass(!!errors.periodEndDate)}
                    />
                  </Field>
                  <Field label="Payment Due" error={errors.paymentDueDate}>
                    <input
                      type="date"
                      value={formData.paymentDueDate}
                      onChange={e => handleInputChange('paymentDueDate', e.target.value)}
                      className={inputClass(!!errors.paymentDueDate)}
                    />
                  </Field>
                </div>
                <p className="mt-3 text-xs text-slate/40">
                  The billing period defines the work window covered by this application.
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* Action Bar — sits at the bottom of the form pane */}
        <WizardActionBar
          onSaveAndExit={() => router.push('/pay-applications')}
          onBack={() => router.push('/pay-applications/new')}
          onContinue={handleContinue}
          continueLabel="Continue"
          continueDisabled={isLoading}
          isLoading={isLoading}
        />
      </WizardSplitPane>
    </div>
  )
}

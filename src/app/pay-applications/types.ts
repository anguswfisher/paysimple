// ─────────────────────────────────────────────────────────────
// PaySimple — Pay Applications Types
// Ported from Angular pay-app.models.ts
// ─────────────────────────────────────────────────────────────

export type PayAppStatus = 'draft' | 'finalized' | 'corrected-draft'
export type EntryMode = 'guided' | 'from-previous' | 'blank'
export type BillingFormat = 'schedule-of-values' | 'total-only'
export type RetainageAppliesTo = 'work' | 'materials' | 'both'
export type ChangeOrderMode = 'none' | 'totals-only' | 'individual'
export type SaveStatus = 'saved' | 'saving' | 'unsaved'

// ── Basics ────────────────────────────────────────────────────

export interface PayAppBasics {
  projectName: string
  ownerName: string
  contractorName: string
  applicationNumber: string
  periodStartDate: string
  periodEndDate: string
  paymentDueDate: string
}

// ── Settings ──────────────────────────────────────────────────

export interface RetainageSettings {
  retainagePercent: number
  appliesTo: RetainageAppliesTo
  canChangeOverTime: boolean
  effectiveDate?: string
  newRetainagePercent?: number
}

export interface ChangeOrder {
  id: string
  number: string
  description: string
  amount: number
}

export interface ChangeOrderSettings {
  hasChangeOrders: boolean
  mode: ChangeOrderMode
  totalAmount?: number
  changeOrders: ChangeOrder[]
}

// ── Line Items (G703) ─────────────────────────────────────────

export interface LineItem {
  id: string
  lineNumber: string
  description: string
  scheduledValue: number
  previousWork: number
  thisPeriodWork: number
  previousMaterialsStored: number
  thisPeriodMaterialsStored: number
  // Computed (derived from inputs — never set by user)
  workToDate?: number
  materialsToDate?: number
  earnedToDate?: number
  retainageHeld?: number
  balanceToFinish?: number
  percentComplete?: number
  // Flags
  hasWarning?: boolean
  warningMessage?: string
  isChangeOrderRelated?: boolean
}

// ── Signature ─────────────────────────────────────────────────

export interface SignatureInfo {
  signerName: string
  title: string
  date: string
  notes?: string
}

// ── G702 Totals ───────────────────────────────────────────────

export interface G702Totals {
  originalContractSum: number
  netChangeByChangeOrders: number
  contractSumToDate: number
  totalCompletedAndStoredToDate: number
  retainageWorkPercent: number
  retainageWorkAmount: number
  retainageMaterialsPercent: number
  retainageMaterialsAmount: number
  totalRetainage: number
  totalEarnedLessRetainage: number
  lessPreviousCertificates: number
  currentPaymentDue: number
  balanceToFinishIncludingRetainage: number
}

// ── Finalized Snapshot ────────────────────────────────────────

export interface FinalizedSnapshot {
  finalizedAt: string
  g702Totals: G702Totals
  lineItems: LineItem[]
  signatureInfo: SignatureInfo
}

// ── Core PayApp ───────────────────────────────────────────────

export interface PayApp {
  id: string
  status: PayAppStatus
  entryMode: EntryMode
  createdAt: string
  updatedAt: string
  finalizedAt?: string

  basics: PayAppBasics
  billingFormat: BillingFormat
  retainageSettings: RetainageSettings
  changeOrderSettings: ChangeOrderSettings
  materialsStoredEnabled: boolean

  lineItems: LineItem[]
  signatureInfo?: SignatureInfo
  finalizedSnapshot?: FinalizedSnapshot

  // Corrected draft tracking
  correctedFromId?: string
  correctionReason?: string
  correctionNotes?: string

  // Wizard progress
  currentStep: number
  completedSteps: number[]
}

// ── Validation ────────────────────────────────────────────────

export interface ValidationError {
  field: string
  message: string
  pageRoute?: string
}

export interface ValidationWarning {
  field: string
  message: string
  lineItemId?: string
  canProceed: boolean
  acknowledged: boolean
}

export interface PayAppValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

// ── Steps ─────────────────────────────────────────────────────

export interface PayAppStep {
  step: number
  label: string
  route: string
}

export const PAY_APP_STEPS: PayAppStep[] = [
  { step: 1,  label: 'Basics',              route: 'basics' },
  { step: 2,  label: 'Billing Format',      route: 'billing-format' },
  { step: 3,  label: 'Retainage',           route: 'retainage' },
  { step: 4,  label: 'Change Orders',       route: 'change-orders' },
  { step: 5,  label: 'Materials',           route: 'materials-stored' },
  { step: 6,  label: 'Setup Review',        route: 'setup-review' },
  { step: 7,  label: 'Schedule of Values',  route: 'sov-method' },
  { step: 8,  label: 'Workspace',           route: 'workspace' },
  { step: 9,  label: 'Summary',             route: 'summary' },
  { step: 10, label: 'Checks',              route: 'checks' },
  { step: 11, label: 'Review',              route: 'review-checklist' },
  { step: 12, label: 'Finalize',            route: 'finalize-confirm' },
]

// ── Supabase row shape (snake_case from DB) ───────────────────
// Used in fromSupabaseRow() to map DB rows → PayApp

export interface PayAppRow {
  id: string
  user_id: string
  status: PayAppStatus
  entry_mode: EntryMode
  project_name: string
  owner_name: string
  contractor_name: string
  application_number: string
  period_start_date: string | null
  period_end_date: string | null
  payment_due_date: string | null
  billing_format: BillingFormat
  materials_stored_enabled: boolean
  retainage_percent: number
  retainage_applies_to: RetainageAppliesTo
  retainage_can_change: boolean
  retainage_effective_date: string | null
  retainage_new_percent: number | null
  change_orders_enabled: boolean
  change_order_mode: ChangeOrderMode
  change_order_total_amount: number | null
  current_step: number
  completed_steps: number[]
  signer_name: string | null
  signer_title: string | null
  signature_date: string | null
  signature_notes: string | null
  corrected_from_id: string | null
  correction_reason: string | null
  correction_notes: string | null
  finalized_snapshot: FinalizedSnapshot | null
  finalized_at: string | null
  created_at: string
  updated_at: string
}

export interface LineItemRow {
  id: string
  pay_application_id: string
  sort_order: number
  line_number: string
  description: string
  scheduled_value: number
  previous_work: number
  this_period_work: number
  previous_materials_stored: number
  this_period_materials_stored: number
  // Generated columns returned from DB
  work_to_date: number
  materials_to_date: number
  earned_to_date: number
  balance_to_finish: number
  is_change_order_related: boolean
  created_at: string
  updated_at: string
}

export interface ChangeOrderRow {
  id: string
  pay_application_id: string
  co_number: string
  description: string
  amount: number
  sort_order: number
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// PaySimple — Pay Application Calculation Helpers
// Pure functions, no side effects. Safe to call anywhere.
// Ported from Angular pay-app.models.ts + PayAppStorageService
// ─────────────────────────────────────────────────────────────

import type {
  PayApp,
  LineItem,
  LineItemRow,
  ChangeOrderRow,
  G702Totals,
  EntryMode,
  PayAppRow,
  ChangeOrder,
  FinalizedSnapshot,
} from './types'

// ── ID Generation ─────────────────────────────────────────────

export function generatePayAppId(): string {
  return 'pa_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export function generateLineItemId(): string {
  return 'li_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

export function generateChangeOrderId(): string {
  return 'co_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// ── Factory ───────────────────────────────────────────────────

export function createEmptyPayApp(entryMode: EntryMode = 'guided'): PayApp {
  return {
    id: generatePayAppId(),
    status: 'draft',
    entryMode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    basics: {
      projectName: '',
      ownerName: '',
      contractorName: '',
      applicationNumber: '',
      periodStartDate: '',
      periodEndDate: '',
      paymentDueDate: '',
    },
    billingFormat: 'schedule-of-values',
    retainageSettings: {
      retainagePercent: 10,
      appliesTo: 'both',
      canChangeOverTime: false,
    },
    changeOrderSettings: {
      hasChangeOrders: false,
      mode: 'none',
      changeOrders: [],
    },
    materialsStoredEnabled: false,
    lineItems: [],
    currentStep: 1,
    completedSteps: [],
  }
}

// ── Line Item Calculations ────────────────────────────────────
// Mirrors calculateLineItem() from Angular models.

export function calculateLineItem(item: LineItem, retainagePercent: number): LineItem {
  const workToDate = item.previousWork + item.thisPeriodWork
  const materialsToDate = item.previousMaterialsStored + item.thisPeriodMaterialsStored
  const earnedToDate = workToDate + materialsToDate
  const retainageHeld = earnedToDate * (retainagePercent / 100)
  const balanceToFinish = item.scheduledValue - earnedToDate
  const percentComplete =
    item.scheduledValue > 0 ? (earnedToDate / item.scheduledValue) * 100 : 0

  let hasWarning = false
  let warningMessage = ''

  if (earnedToDate > item.scheduledValue) {
    hasWarning = true
    warningMessage = 'Earned to date exceeds scheduled value'
  } else if (item.thisPeriodWork < 0 || item.thisPeriodMaterialsStored < 0) {
    hasWarning = true
    warningMessage = 'Negative values detected'
  }

  return {
    ...item,
    workToDate,
    materialsToDate,
    earnedToDate,
    retainageHeld,
    balanceToFinish,
    percentComplete,
    hasWarning,
    warningMessage,
  }
}

export function calculateAllLineItems(
  lineItems: LineItem[],
  retainagePercent: number,
): LineItem[] {
  return lineItems.map((item) => calculateLineItem(item, retainagePercent))
}

// ── G702 Totals ───────────────────────────────────────────────
// Mirrors calculateG702Totals() from Angular service.

export function calculateG702Totals(payApp: PayApp): G702Totals {
  const { lineItems, retainageSettings, changeOrderSettings } = payApp
  const retainagePercent = retainageSettings.retainagePercent / 100

  const originalContractSum = lineItems.reduce((sum, item) => sum + item.scheduledValue, 0)

  const netChangeByChangeOrders =
    changeOrderSettings.totalAmount ??
    changeOrderSettings.changeOrders.reduce((sum, co) => sum + co.amount, 0)

  const contractSumToDate = originalContractSum + netChangeByChangeOrders

  const totalWorkToDate = lineItems.reduce((sum, item) => sum + (item.workToDate ?? 0), 0)
  const totalMaterialsToDate = lineItems.reduce(
    (sum, item) => sum + (item.materialsToDate ?? 0),
    0,
  )
  const totalCompletedAndStoredToDate = totalWorkToDate + totalMaterialsToDate

  const retainageWorkAmount = totalWorkToDate * retainagePercent
  const retainageMaterialsAmount = totalMaterialsToDate * retainagePercent
  const totalRetainage = retainageWorkAmount + retainageMaterialsAmount

  const totalEarnedLessRetainage = totalCompletedAndStoredToDate - totalRetainage

  const lessPreviousCertificates =
    lineItems.reduce(
      (sum, item) => sum + item.previousWork + item.previousMaterialsStored,
      0,
    ) *
    (1 - retainagePercent)

  const currentPaymentDue = totalEarnedLessRetainage - lessPreviousCertificates
  const balanceToFinishIncludingRetainage = contractSumToDate - totalEarnedLessRetainage

  return {
    originalContractSum,
    netChangeByChangeOrders,
    contractSumToDate,
    totalCompletedAndStoredToDate,
    retainageWorkPercent: retainageSettings.retainagePercent,
    retainageWorkAmount,
    retainageMaterialsPercent: retainageSettings.retainagePercent,
    retainageMaterialsAmount,
    totalRetainage,
    totalEarnedLessRetainage,
    lessPreviousCertificates,
    currentPaymentDue,
    balanceToFinishIncludingRetainage,
  }
}

// ── Application Number ────────────────────────────────────────

export function incrementApplicationNumber(current: string): string {
  const num = parseInt(current, 10)
  return isNaN(num) ? `${current}-1` : String(num + 1)
}

// ── Supabase Row Mappers ──────────────────────────────────────
// fromSupabaseRow: DB row → PayApp (camelCase)
// toSupabaseRow:  PayApp → DB row (snake_case)

export function fromSupabaseRow(
  row: PayAppRow,
  lineItemRows: LineItemRow[] = [],
  changeOrderRows: ChangeOrderRow[] = [],
): PayApp {
  const changeOrders: ChangeOrder[] = changeOrderRows.map((co) => ({
    id: co.id,
    number: co.co_number,
    description: co.description,
    amount: co.amount,
  }))

  const lineItems: LineItem[] = lineItemRows.map((li) => ({
    id: li.id,
    lineNumber: li.line_number,
    description: li.description,
    scheduledValue: li.scheduled_value,
    previousWork: li.previous_work,
    thisPeriodWork: li.this_period_work,
    previousMaterialsStored: li.previous_materials_stored,
    thisPeriodMaterialsStored: li.this_period_materials_stored,
    workToDate: li.work_to_date,
    materialsToDate: li.materials_to_date,
    earnedToDate: li.earned_to_date,
    balanceToFinish: li.balance_to_finish,
    isChangeOrderRelated: li.is_change_order_related,
  }))

  // Re-run calculations client-side to populate retainage_held / percentComplete
  // (those aren't generated columns — they need retainage_percent from the parent)
  const retainagePercent = row.retainage_percent
  const calculatedLineItems = lineItems.map((li) => calculateLineItem(li, retainagePercent))

  return {
    id: row.id,
    status: row.status,
    entryMode: row.entry_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    finalizedAt: row.finalized_at ?? undefined,
    userId: row.user_id,

    basics: {
      projectName: row.project_name,
      ownerName: row.owner_name,
      contractorName: row.contractor_name,
      applicationNumber: row.application_number,
      periodStartDate: row.period_start_date ?? '',
      periodEndDate: row.period_end_date ?? '',
      paymentDueDate: row.payment_due_date ?? '',
    },

    billingFormat: row.billing_format,
    materialsStoredEnabled: row.materials_stored_enabled,

    retainageSettings: {
      retainagePercent: row.retainage_percent,
      appliesTo: row.retainage_applies_to,
      canChangeOverTime: row.retainage_can_change,
      effectiveDate: row.retainage_effective_date ?? undefined,
      newRetainagePercent: row.retainage_new_percent ?? undefined,
    },

    changeOrderSettings: {
      hasChangeOrders: row.change_orders_enabled,
      mode: row.change_order_mode,
      totalAmount: row.change_order_total_amount ?? undefined,
      changeOrders,
    },

    lineItems: calculatedLineItems,

    signatureInfo:
      row.signer_name && row.signer_title && row.signature_date
        ? {
            signerName: row.signer_name,
            title: row.signer_title,
            date: row.signature_date,
            notes: row.signature_notes ?? undefined,
          }
        : undefined,

    finalizedSnapshot: row.finalized_snapshot ?? undefined,

    correctedFromId: row.corrected_from_id ?? undefined,
    correctionReason: row.correction_reason ?? undefined,
    correctionNotes: row.correction_notes ?? undefined,

    currentStep: row.current_step,
    completedSteps: row.completed_steps,
  }
}

export function toSupabaseRow(
  payApp: PayApp,
  userId: string,
): Omit<PayAppRow, 'created_at' | 'updated_at'> {
  return {
    id: payApp.id,
    user_id: payApp.userId ?? userId,
    status: payApp.status,
    entry_mode: payApp.entryMode,

    project_name: payApp.basics.projectName,
    owner_name: payApp.basics.ownerName,
    contractor_name: payApp.basics.contractorName,
    application_number: payApp.basics.applicationNumber,
    period_start_date: payApp.basics.periodStartDate || null,
    period_end_date: payApp.basics.periodEndDate || null,
    payment_due_date: payApp.basics.paymentDueDate || null,

    billing_format: payApp.billingFormat,
    materials_stored_enabled: payApp.materialsStoredEnabled,

    retainage_percent: payApp.retainageSettings.retainagePercent,
    retainage_applies_to: payApp.retainageSettings.appliesTo,
    retainage_can_change: payApp.retainageSettings.canChangeOverTime,
    retainage_effective_date: payApp.retainageSettings.effectiveDate ?? null,
    retainage_new_percent: payApp.retainageSettings.newRetainagePercent ?? null,

    change_orders_enabled: payApp.changeOrderSettings.hasChangeOrders,
    change_order_mode: payApp.changeOrderSettings.mode,
    change_order_total_amount: payApp.changeOrderSettings.totalAmount ?? null,

    current_step: payApp.currentStep,
    completed_steps: payApp.completedSteps,

    signer_name: payApp.signatureInfo?.signerName ?? null,
    signer_title: payApp.signatureInfo?.title ?? null,
    signature_date: payApp.signatureInfo?.date ?? null,
    signature_notes: payApp.signatureInfo?.notes ?? null,

    corrected_from_id: payApp.correctedFromId ?? null,
    correction_reason: payApp.correctionReason ?? null,
    correction_notes: payApp.correctionNotes ?? null,

    finalized_snapshot: payApp.finalizedSnapshot ?? null,
    finalized_at: payApp.finalizedAt ?? null,
  }
}

export function lineItemToSupabaseRow(
  item: LineItem,
  payApplicationId: string,
  sortOrder: number,
): Omit<LineItemRow, 'id' | 'work_to_date' | 'materials_to_date' | 'earned_to_date' | 'balance_to_finish' | 'created_at' | 'updated_at'> {
  return {
    pay_application_id: payApplicationId,
    sort_order: sortOrder,
    line_number: item.lineNumber,
    description: item.description,
    scheduled_value: item.scheduledValue,
    previous_work: item.previousWork,
    this_period_work: item.thisPeriodWork,
    previous_materials_stored: item.previousMaterialsStored,
    this_period_materials_stored: item.thisPeriodMaterialsStored,
    is_change_order_related: item.isChangeOrderRelated ?? false,
  }
}

export function changeOrderToSupabaseRow(
  co: ChangeOrder,
  payApplicationId: string,
  sortOrder: number,
): Omit<ChangeOrderRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    pay_application_id: payApplicationId,
    co_number: co.number,
    description: co.description,
    amount: co.amount,
    sort_order: sortOrder,
  }
}

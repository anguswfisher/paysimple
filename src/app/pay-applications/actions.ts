'use server'

// ─────────────────────────────────────────────────────────────
// PaySimple — Pay Applications Server Actions
// Called by the Zustand store. Never imported client-side directly
// (the store lazy-imports these so the bundle stays clean).
// ─────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import {
  fromSupabaseRow,
  toSupabaseRow,
  lineItemToSupabaseRow,
  changeOrderToSupabaseRow,
} from './calculations'
import type { PayApp, PayAppRow, LineItemRow, ChangeOrderRow } from './types'

// ── Load ──────────────────────────────────────────────────────

export async function loadPayApplications(userId: string): Promise<PayApp[]> {
  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('pay_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`loadPayApplications: ${error.message}`)
  if (!rows?.length) return []

  // Fetch line items and change orders for all pay apps in parallel
  const ids = (rows as PayAppRow[]).map((r) => r.id)

  const [{ data: lineItemRows }, { data: changeOrderRows }] = await Promise.all([
    supabase
      .from('pay_application_line_items')
      .select('*')
      .in('pay_application_id', ids)
      .order('sort_order', { ascending: true }),
    supabase
      .from('pay_application_change_orders')
      .select('*')
      .in('pay_application_id', ids)
      .order('sort_order', { ascending: true }),
  ])

  return (rows as PayAppRow[]).map((row: PayAppRow) =>
    fromSupabaseRow(
      row,
      (lineItemRows ?? []).filter((li: LineItemRow) => li.pay_application_id === row.id),
      (changeOrderRows ?? []).filter((co: ChangeOrderRow) => co.pay_application_id === row.id),
    ),
  )
}

export async function loadPayApplicationById(id: string, userId: string): Promise<PayApp | null> {
  const supabase = await createClient()

  const [{ data: row, error }, { data: lineItemRows }, { data: changeOrderRows }] =
    await Promise.all([
      supabase
        .from('pay_applications')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single(),
      supabase
        .from('pay_application_line_items')
        .select('*')
        .eq('pay_application_id', id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('pay_application_change_orders')
        .select('*')
        .eq('pay_application_id', id)
        .order('sort_order', { ascending: true }),
    ])

  if (error || !row) return null

  return fromSupabaseRow(row as PayAppRow, lineItemRows ?? [], changeOrderRows ?? [])
}

// ── Create ────────────────────────────────────────────────────

export async function createPayApplication(payApp: PayApp, userId: string): Promise<PayApp> {
  const supabase = await createClient()

  const row = toSupabaseRow(payApp, userId) as any
  delete row.id

  const { data: insertedRow, error } = await (supabase
    .from('pay_applications') as any)
    .insert(row)
    .select()
    .single()

  if (error) throw new Error(`createPayApplication: ${error.message}`)

  // Insert line items
  if (payApp.lineItems.length > 0) {
    const lineItemRows = payApp.lineItems.map((item, i) =>
      lineItemToSupabaseRow(item, insertedRow.id, i * 10),
    )
    const { error: liError } = await (supabase
      .from('pay_application_line_items') as any)
      .insert(lineItemRows)
    if (liError) throw new Error(`createPayApplication (line items): ${liError.message}`)
  }

  // Insert individual change orders
  if (
    payApp.changeOrderSettings.mode === 'individual' &&
    payApp.changeOrderSettings.changeOrders.length > 0
  ) {
    const coRows = payApp.changeOrderSettings.changeOrders.map((co, i) =>
      changeOrderToSupabaseRow(co, insertedRow.id, i * 10),
    )
    const { error: coError } = await (supabase
      .from('pay_application_change_orders') as any)
      .insert(coRows)
    if (coError) throw new Error(`createPayApplication (change orders): ${coError.message}`)
  }

  return fromSupabaseRow(insertedRow as PayAppRow, [], [])
}

// ── Update ────────────────────────────────────────────────────
// Updates the parent row + performs a full replace of child records.
// Fine for the wizard (small data sets). Can optimize to diff later.

export async function updatePayApplication(payApp: PayApp): Promise<void> {
  const supabase = await createClient()

  if (!payApp.userId) {
    throw new Error('updatePayApplication: missing user ID')
  }

  const row = toSupabaseRow(payApp, payApp.userId)

  const { error } = await (supabase
    .from('pay_applications') as any)
    .update(row)
    .eq('id', payApp.id)

  if (error) throw new Error(`updatePayApplication: ${error.message}`)

  // Full replace of line items
  await (supabase
    .from('pay_application_line_items') as any)
    .delete()
    .eq('pay_application_id', payApp.id)

  if (payApp.lineItems.length > 0) {
    const lineItemRows = payApp.lineItems.map((item, i) =>
      lineItemToSupabaseRow(item, payApp.id, i * 10),
    )
    const { error: liError } = await (supabase
      .from('pay_application_line_items') as any)
      .insert(lineItemRows)
    if (liError) throw new Error(`updatePayApplication (line items): ${liError.message}`)
  }

  // Full replace of change orders (individual mode only)
  await (supabase
    .from('pay_application_change_orders') as any)
    .delete()
    .eq('pay_application_id', payApp.id)

  if (
    payApp.changeOrderSettings.mode === 'individual' &&
    payApp.changeOrderSettings.changeOrders.length > 0
  ) {
    const coRows = payApp.changeOrderSettings.changeOrders.map((co, i) =>
      changeOrderToSupabaseRow(co, payApp.id, i * 10),
    )
    const { error: coError } = await (supabase
      .from('pay_application_change_orders') as any)
      .insert(coRows)
    if (coError) throw new Error(`updatePayApplication (change orders): ${coError.message}`)
  }
}

// ── Delete ────────────────────────────────────────────────────

export async function deletePayApplication(id: string): Promise<void> {
  const supabase = await createClient()

  // Cascade deletes line items and change orders via FK constraint
  const { error } = await (supabase
    .from('pay_applications') as any)
    .delete()
    .eq('id', id)
  if (error) throw new Error(`deletePayApplication: ${error.message}`)
}

// ── Corrected Draft ───────────────────────────────────────────────

export async function createCorrectedDraft(
  originalId: string,
  userId: string,
  reason: string,
  notes: string
): Promise<PayApp> {
  const supabase = await createClient()

  // Load the original pay application
  const { data: original, error: loadError } = await supabase
    .from('pay_applications')
    .select('*')
    .eq('id', originalId)
    .eq('user_id', userId)
    .single()

  if (loadError || !original) {
    throw new Error(`createCorrectedDraft: Original pay application not found: ${loadError?.message}`)
  }

  if ((original as any).status !== 'finalized') {
    throw new Error('createCorrectedDraft: Can only create corrected drafts from finalized applications')
  }

  // Load line items from original
  const { data: lineItemRows } = await supabase
    .from('pay_application_line_items')
    .select('*')
    .eq('pay_application_id', originalId)
    .order('sort_order', { ascending: true })

  // Create the corrected draft
  const correctedRow = {
    ...(original as any),
    id: crypto.randomUUID(),
    user_id: userId,
    status: 'corrected-draft',
    corrected_from_id: originalId,
    correction_reason: reason,
    correction_notes: notes,
    finalized_at: null,
    finalized_snapshot: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data: insertedRow, error: insertError } = await supabase
    .from('pay_applications')
    .insert(correctedRow)
    .select()
    .single()

  if (insertError) throw new Error(`createCorrectedDraft: ${insertError.message}`)

  // Copy line items to corrected draft
  if (lineItemRows && lineItemRows.length > 0) {
    const correctedLineItems = (lineItemRows as any[]).map((li: any) => ({
      ...li,
      id: crypto.randomUUID(),
      pay_application_id: (insertedRow as any).id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { error: liError } = await (supabase
      .from('pay_application_line_items') as any)
      .insert(correctedLineItems)

    if (liError) throw new Error(`createCorrectedDraft (line items): ${liError.message}`)
  }

  // Load the complete corrected draft with line items
  return loadPayApplicationById((insertedRow as any).id, userId) as Promise<PayApp>
}

// ── Finalize ───────────────────────────────────────────────────────

export async function finalizePayApplication(id: string, userId: string): Promise<PayApp> {
  if (!userId) {
    throw new Error('finalizePayApplication: missing user ID')
  }

  const supabase = await createClient()

  // Load the current pay application with line items
  const current = await loadPayApplicationById(id, userId)
  if (!current) {
    throw new Error('finalizePayApplication: Pay application not found')
  }

  if (current.status !== 'draft' && current.status !== 'corrected-draft') {
    throw new Error('finalizePayApplication: Can only finalize draft applications')
  }

  // Create finalized snapshot
  const { calculatePayAppTotals } = await import('./calculations')
  const payAppTotals = calculatePayAppTotals(current)

  const finalizedSnapshot = {
    payAppTotals,
    lineItems: current.lineItems,
    signatureInfo: current.signatureInfo,
    finalizedAt: new Date().toISOString(),
  }

  // Update the pay application
  const { data: updatedRow, error } = await (supabase
    .from('pay_applications') as any)
    .update({
      status: 'finalized',
      finalized_at: new Date().toISOString(),
      finalized_snapshot: finalizedSnapshot,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`finalizePayApplication: ${error.message}`)

  // Load and return the finalized pay application
  return loadPayApplicationById(id, userId) as Promise<PayApp>
}

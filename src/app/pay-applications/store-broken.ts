// ─────────────────────────────────────────────────────────────
// PaySimple — usePayAppStore (Zustand)
// Direct port of Angular PayAppStorageService.
//
// State split:
//   - Active wizard draft lives here in memory (fast, optimistic)
//   - Every mutation calls a Supabase server action to persist
//   - On mount / page load, actions fetch from Supabase → hydrate store
//
// Usage:
//   const { currentPayApp, updateBasics, markStepCompleted } = usePayAppStore()
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { StateCreator } from 'zustand'
import type {
  PayApp,
  PayAppStatus,
  EntryMode,
  LineItem,
  ChangeOrder,
  SignatureInfo,
  SaveStatus,
} from './types'
import {
  createEmptyPayApp,
  calculateLineItem,
  calculateAllLineItems,
  calculateG702Totals,
  incrementApplicationNumber,
  generateLineItemId,
  generatePayAppId,
} from './calculations'

// ── Store Shape ───────────────────────────────────────────────

interface PayAppState {
  // Data
  payApps: PayApp[]
  currentPayApp: PayApp | null
  saveStatus: SaveStatus

  // ── Lifecycle ──────────────────────────────────────────────

  /** Load all pay apps for the current user from Supabase. Call on mount. */
  loadPayApps: () => Promise<void>

  /** Load a single pay app by ID (e.g. when navigating to /pay-applications/[id]/basics) */
  loadPayAppById: (id: string) => Promise<void>

  /** Set the active pay app by ID (from already-loaded list). */
  setCurrentPayApp: (id: string) => void

  /** Clear the active pay app (e.g. when navigating away). */
  clearCurrentPayApp: () => void

  // ── Creation ────────────────────────────────────────────────

  /** Create a brand new pay application (entry mode = guided/from-previous/blank). */
  createPayApp: (entryMode: EntryMode, userId: string) => Promise<PayApp>

  /** Create next sequential pay app from a previous one (copies basics, line items). */
  createNextPayApp: (previousId: string, userId: string) => Promise<PayApp | null>

  /** Create a corrected draft from a finalized pay app. */
  createCorrectedDraft: (
    originalId: string,
    userId: string,
    reason: string,
    notes: string
  ) => Promise<PayApp | null>

  // ── Wizard Step Updates ──────────────────────────────────────
  // All follow the same pattern:
  //   1. Merge into currentPayApp optimistically
  //   2. Persist to Supabase via server action
  //   3. On error, set saveStatus = 'unsaved'

  updateBasics: (basics: PayApp['basics']) => Promise<void>
  updateBillingFormat: (billingFormat: PayApp['billingFormat']) => Promise<void>
  updateRetainageSettings: (retainageSettings: PayApp['retainageSettings']) => Promise<void>
  updateChangeOrderSettings: (changeOrderSettings: PayApp['changeOrderSettings']) => Promise<void>
  updateMaterialsStoredEnabled: (materialsStoredEnabled: boolean) => Promise<void>
  updateSignatureInfo: (signatureInfo: SignatureInfo) => Promise<void>

  /** Mark a wizard step as completed (for resuming). */
  markStepCompleted: (step: number) => Promise<void>

  // ── Line Items ───────────────────────────────────────────────

  /** Replace all line items (used by import/manual entry). */
  setLineItems: (items: LineItem[]) => Promise<void>

  /** Add a new line item (used by SOV Manual). */
  addLineItem: (partial?: Partial<LineItem>) => Promise<void>

  /** Update a single line item (used by Workspace grid). */
  updateLineItem: (id: string, updates: Partial<LineItem>) => Promise<void>

  /** Delete a line item. */
  deleteLineItem: (id: string) => Promise<void>

  // ── Finalization ─────────────────────────────────────────────

  /** Finalize the current pay application (status = finalized, snapshot). */
  finalizePayApp: () => Promise<void>

  /** Delete a pay application (cascade deletes line items). */
  deletePayApp: (id: string) => Promise<void>

  // ── Computed Helpers ───────────────────────────────────────

  getPayAppsByStatus: (status: PayAppStatus) => PayApp[]
  getG702Totals: () => ReturnType<typeof calculateG702Totals> | null
}

// ── Store Implementation ──────────────────────────────────────

export const usePayAppStore = create<PayAppState>()(
  devtools(
    (set, get) => ({
      payApps: [],
      currentPayApp: null,
      saveStatus: 'saved',

      // ── Lifecycle ────────────────────────────────────────────

      loadPayApps: async () => {
        try {
          const { loadPayApplications } = await import('@/app/pay-applications/actions')
          const payApps = await loadPayApplications()
          set({ payApps })
        } catch (err) {
          console.error('[PayAppStore] loadPayApps failed:', err)
        }
      },

      loadPayAppById: async (id: string) => {
        try {
          const { loadPayApplicationById } = await import('@/app/pay-applications/actions')
          const payApp = await loadPayApplicationById(id)
          if (payApp) {
            set({ currentPayApp: payApp })
          }
        } catch (err) {
          console.error('[PayAppStore] loadPayAppById failed:', err)
        }
      },

      setCurrentPayApp: (id: string) => {
        const payApp = get().payApps.find((p) => p.id === id)
        if (payApp) {
          set({ currentPayApp: payApp })
        }
      },

      clearCurrentPayApp: () => {
        set({ currentPayApp: null })
      },

      // ── Creation ───────────────────────────────────────────────

      createPayApp: async (entryMode, userId) => {
        const payApp = createEmptyPayApp(entryMode)
        set(
          (state) => ({
            payApps: [...state.payApps, payApp],
            currentPayApp: payApp,
          })
        )

        try {
          const { createPayApplication } = await import('@/app/pay-applications/actions')
          const saved = await createPayApplication(payApp, userId)
          set(
            (state) => ({
              payApps: state.payApps.map((p) => (p.id === payApp.id ? saved : p)),
              currentPayApp:
                state.currentPayApp?.id === payApp.id ? saved : state.currentPayApp,
            })
          )
          return saved
        } catch (err) {
          console.error('[PayAppStore] createPayApp failed:', err)
          return payApp
        }
      },

      createNextPayApp: async (previousId, userId) => {
        const previous = get().payApps.find((p) => p.id === previousId)
        if (!previous) return null

        const next: PayApp = {
          ...previous,
          id: generatePayAppId(),
          status: 'draft',
          entryMode: 'from-previous',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          finalizedAt: undefined,
          finalizedSnapshot: undefined,
          signatureInfo: undefined,
          correctedFromId: undefined,
          correctionReason: undefined,
          correctionNotes: undefined,
          basics: {
            ...previous.basics,
            applicationNumber: incrementApplicationNumber(previous.basics.applicationNumber),
            periodStartDate: '',
            periodEndDate: '',
            paymentDueDate: '',
          },
          currentStep: 1,
          completedSteps: [],
        }

        set(
          (state) => ({
            payApps: [...state.payApps, next],
            currentPayApp: next,
          })
        )

        try {
          const { createPayApplication } = await import('@/app/pay-applications/actions')
          const saved = await createPayApplication(next, userId)
          set(
            (state) => ({
              payApps: state.payApps.map((p) => (p.id === next.id ? saved : p)),
              currentPayApp:
                state.currentPayApp?.id === next.id ? saved : state.currentPayApp,
            })
          )
          return saved
        } catch (err) {
          console.error('[PayAppStore] createNextPayApp failed:', err)
          return next
        }
      },

      createCorrectedDraft: async (originalId, userId, reason, notes) => {
        const original = get().payApps.find((p) => p.id === originalId)
        if (!original || original.status !== 'finalized') return null

        try {
          const { createCorrectedDraft } = await import('@/app/pay-applications/actions')
          const corrected = await createCorrectedDraft(originalId, userId, reason, notes)
          
          set(
            (state) => ({
              payApps: [...state.payApps, corrected],
              currentPayApp: corrected,
            })
          )
          
          return corrected
        } catch (err) {
          console.error('[PayAppStore] createCorrectedDraft failed:', err)
          return null
        }
      },

      // ── Wizard Step Updates ──────────────────────────────────────
      // All follow the same pattern:
      //   1. Merge into currentPayApp optimistically
      //   2. Persist to Supabase via server action
      //   3. On error, set saveStatus = 'unsaved'

      updateBasics: async (basics) => {
        await applyUpdate(set, get, { basics }, 'updateBasics')
      },

      updateBillingFormat: async (billingFormat) => {
        await applyUpdate(set, get, { billingFormat }, 'updateBillingFormat')
      },

      updateRetainageSettings: async (retainageSettings) => {
        // Retainage % changed — recalculate all line items
        const current = get().currentPayApp
        if (!current) return
        const lineItems = calculateAllLineItems(
          current.lineItems,
          retainageSettings.retainagePercent,
        )
        await applyUpdate(set, get, { retainageSettings, lineItems }, 'updateRetainageSettings')
      },

      updateChangeOrderSettings: async (changeOrderSettings) => {
        await applyUpdate(set, get, { changeOrderSettings }, 'updateChangeOrderSettings')
      },

      updateMaterialsStoredEnabled: async (materialsStoredEnabled) => {
        await applyUpdate(set, get, { materialsStoredEnabled }, 'updateMaterialsStoredEnabled')
      },

      updateSignatureInfo: async (signatureInfo) => {
        await applyUpdate(set, get, { signatureInfo }, 'updateSignatureInfo')
      },

      markStepCompleted: async (step: number) => {
        const current = get().currentPayApp
        if (!current) return

        const completedSteps = current.completedSteps.includes(step)
          ? current.completedSteps
          : [...current.completedSteps, step]

        const currentStep = Math.max(current.currentStep, step + 1)
        await applyUpdate(set, get, { completedSteps, currentStep }, 'markStepCompleted')
      },

      // ── Line Items ─────────────────────────────────────────────

      setLineItems: async (items: LineItem[]) => {
        const current = get().currentPayApp
        if (!current) return
        const lineItems = calculateAllLineItems(items, current.retainageSettings.retainagePercent)
        await applyUpdate(set, get, { lineItems }, 'setLineItems')
      },

      addLineItem: async (partial = {}) => {
        const current = get().currentPayApp
        if (!current) return

        const newItem: LineItem = {
          id: generateLineItemId(),
          lineNumber: String(current.lineItems.length + 1),
          description: '',
          scheduledValue: 0,
          previousWork: 0,
          thisPeriodWork: 0,
          previousMaterialsStored: 0,
          thisPeriodMaterialsStored: 0,
          ...partial,
        }

        const calculated = calculateLineItem(newItem, current.retainageSettings.retainagePercent)
        const lineItems = [...current.lineItems, calculated]
        await applyUpdate(set, get, { lineItems }, 'addLineItem')
      },

      updateLineItem: async (id: string, updates: Partial<LineItem>) => {
        const current = get().currentPayApp
        if (!current) return

        const lineItems = current.lineItems.map((item) => {
          if (item.id !== id) return item
          const merged = { ...item, ...updates }
          return calculateLineItem(merged, current.retainageSettings.retainagePercent)
        })

        await applyUpdate(set, get, { lineItems }, 'updateLineItem')
      },

      deleteLineItem: async (id: string) => {
        const current = get().currentPayApp
        if (!current) return
        const lineItems = current.lineItems.filter((item) => item.id !== id)
        await applyUpdate(set, get, { lineItems }, 'deleteLineItem')
      },

      // ── Finalization ─────────────────────────────────────────────

      finalizePayApp: async () => {
        const current = get().currentPayApp
        if (!current) return

        try {
          const { finalizePayApplication } = await import('@/app/pay-applications/actions')
          const finalized = await finalizePayApplication(current.id)
          
          set(
            (state) => ({
              payApps: state.payApps.map((p) => (p.id === current.id ? finalized : p)),
              currentPayApp: finalized,
            })
          )
        } catch (err) {
          console.error('[PayAppStore] finalizePayApp failed:', err)
        }
      },

      deletePayApp: async (id: string) => {
        set(
          (state) => ({
            payApps: state.payApps.filter((p) => p.id !== id),
            currentPayApp: state.currentPayApp?.id === id ? null : state.currentPayApp,
          })
        )

        try {
          const { deletePayApplication } = await import('@/app/pay-applications/actions')
          await deletePayApplication(id)
        } catch (err) {
          console.error('[PayAppStore] deletePayApp failed:', err)
        }
      },

      // ── Computed Helpers ───────────────────────────────────────

      getPayAppsByStatus: (status) => {
        return get().payApps.filter((p) => p.status === status)
      },

      getG702Totals: () => {
        const current = get().currentPayApp
        if (!current) return null
        return calculateG702Totals(current)
      },
    }),
    { name: 'PayAppStore' },
  ),
)

// ── Helper: Optimistic Update Pattern ───────────────────────────

async function applyUpdate<T extends Partial<PayApp>>(
  set: Parameters<StateCreator<PayAppState>>[0],
  get: Parameters<StateCreator<PayAppState>>[1],
  updates: T,
  actionName: string,
) {
  const current = get().currentPayApp
  if (!current) return

  // Optimistic update
  const updated = { ...current, ...updates, updatedAt: new Date().toISOString() }
  set({ currentPayApp: updated, saveStatus: 'saving' })

  try {
    const { updatePayApplication } = await import('@/app/pay-applications/actions')
    await updatePayApplication(updated)
    set({ saveStatus: 'saved' })
  } catch (err) {
    console.error(`[PayAppStore] ${actionName} failed:`, err)
    set({ saveStatus: 'unsaved' })
  }
}

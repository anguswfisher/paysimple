// ─────────────────────────────────────────────────────────────
// PaySimple — Demo seed data
//
// A realistic book of work for a mid-size commercial GC: eight projects
// across the full lifecycle, with schedules of values built from real CSI
// divisions, change orders, retainage, and compliance findings.
//
// Everything is deterministic — no Math.random() — so the demo looks the
// same on every visit and screenshots stay stable.
// ─────────────────────────────────────────────────────────────

import type { Project } from '@/lib/database/projects'
import type {
  PayApp,
  LineItem,
  ChangeOrder,
  PayAppStatus,
} from '@/app/pay-applications/types'
import { calculateAllLineItems } from '@/app/pay-applications/calculations'
import { DEMO_USER_ID } from './mode'

// ── Deterministic pseudo-random ───────────────────────────────
// Seeded so every visitor sees identical numbers.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const iso = (daysFromNow: number) => {
  const d = new Date('2026-09-15T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + daysFromNow)
  return d.toISOString()
}
const dateOnly = (daysFromNow: number) => iso(daysFromNow).slice(0, 10)

// ── Projects ──────────────────────────────────────────────────

export interface DemoProject extends Project {
  complianceScore: number
  riskFlagCount: number
  billedToDate: number
  receivedToDate: number
  retainageHeld: number
  percentComplete: number
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: 'prj-northgate-medical',
    user_id: DEMO_USER_ID,
    name: 'Northgate Medical Office Building',
    project_type: 'Stipulated Sum',
    contract_value: '14250000',
    start_date: dateOnly(-410),
    estimated_completion: dateOnly(120),
    owner: 'Northgate Health Partners LLC',
    contractor: 'Meridian Builders',
    architect: 'Alder & Voss Architects',
    description: '4-story, 68,000 sf medical office building with structured parking.',
    tags: ['Healthcare', 'Stipulated Sum', '10% Retainage'],
    contract_file_url: null,
    contract_text: null,
    status: 'complete',
    created_at: iso(-412),
    updated_at: iso(-3),
    complianceScore: 96,
    riskFlagCount: 1,
    billedToDate: 10687500,
    receivedToDate: 9618750,
    retainageHeld: 1068750,
    percentComplete: 75,
  },
  {
    id: 'prj-harbor-view',
    user_id: DEMO_USER_ID,
    name: 'Harbor View Residences — Phase II',
    project_type: 'Cost Plus with GMP',
    contract_value: '23800000',
    start_date: dateOnly(-280),
    estimated_completion: dateOnly(265),
    owner: 'Cascade Residential Group',
    contractor: 'Meridian Builders',
    architect: 'Lindqvist Design Studio',
    description: '112-unit mixed-use residential with 9,000 sf ground-floor retail.',
    tags: ['Residential', 'GMP', 'Prevailing Wage'],
    contract_file_url: null,
    contract_text: null,
    status: 'complete',
    created_at: iso(-284),
    updated_at: iso(-1),
    complianceScore: 82,
    riskFlagCount: 4,
    billedToDate: 11662000,
    receivedToDate: 10145940,
    retainageHeld: 1166200,
    percentComplete: 49,
  },
  {
    id: 'prj-westfield-logistics',
    user_id: DEMO_USER_ID,
    name: 'Westfield Logistics Center',
    project_type: 'Stipulated Sum',
    contract_value: '8940000',
    start_date: dateOnly(-165),
    estimated_completion: dateOnly(75),
    owner: 'Westfield Industrial REIT',
    contractor: 'Meridian Builders',
    architect: 'Brannigan Engineering',
    description: '210,000 sf tilt-up distribution warehouse with 32 dock doors.',
    tags: ['Industrial', 'Design-Build', '5% Retainage'],
    contract_file_url: null,
    contract_text: null,
    status: 'complete',
    created_at: iso(-168),
    updated_at: iso(-6),
    complianceScore: 91,
    riskFlagCount: 2,
    billedToDate: 6168600,
    receivedToDate: 5860170,
    retainageHeld: 308430,
    percentComplete: 69,
  },
  {
    id: 'prj-riverside-civic',
    user_id: DEMO_USER_ID,
    name: 'Riverside Civic Center Renovation',
    project_type: 'Cost Plus',
    contract_value: '5620000',
    start_date: dateOnly(-95),
    estimated_completion: dateOnly(190),
    owner: 'City of Riverside',
    contractor: 'Meridian Builders',
    architect: 'Public Works Design Bureau',
    description: 'Seismic retrofit and interior modernization of a 1962 civic hall.',
    tags: ['Public', 'Prevailing Wage', 'Bonded'],
    contract_file_url: null,
    contract_text: null,
    status: 'reviewed',
    created_at: iso(-97),
    updated_at: iso(-11),
    complianceScore: 74,
    riskFlagCount: 6,
    billedToDate: 1461200,
    receivedToDate: 1168960,
    retainageHeld: 146120,
    percentComplete: 26,
  },
  {
    id: 'prj-summit-ridge',
    user_id: DEMO_USER_ID,
    name: 'Summit Ridge Corporate Campus — Bldg C',
    project_type: 'Cost Plus with GMP',
    contract_value: '31400000',
    start_date: dateOnly(-42),
    estimated_completion: dateOnly(520),
    owner: 'Summit Ridge Holdings',
    contractor: 'Meridian Builders',
    architect: 'Kessler Nakamura Partners',
    description: '6-story Class A office core and shell, LEED Gold target.',
    tags: ['Commercial', 'GMP', 'LEED'],
    contract_file_url: null,
    contract_text: null,
    status: 'reviewed',
    created_at: iso(-44),
    updated_at: iso(-2),
    complianceScore: 88,
    riskFlagCount: 3,
    billedToDate: 2198000,
    receivedToDate: 1758400,
    retainageHeld: 219800,
    percentComplete: 7,
  },
  {
    id: 'prj-eastline-transit',
    user_id: DEMO_USER_ID,
    name: 'Eastline Transit Maintenance Facility',
    project_type: 'Stipulated Sum',
    contract_value: '12750000',
    start_date: dateOnly(-14),
    estimated_completion: dateOnly(430),
    owner: 'Regional Transit Authority',
    contractor: 'Meridian Builders',
    architect: 'Thorne Infrastructure Group',
    description: 'Heavy vehicle maintenance shop, wash bay, and fueling island.',
    tags: ['Public', 'Federal Funding', 'Davis-Bacon'],
    contract_file_url: null,
    contract_text: null,
    status: 'processing',
    created_at: iso(-15),
    updated_at: iso(0),
    complianceScore: 79,
    riskFlagCount: 5,
    billedToDate: 0,
    receivedToDate: 0,
    retainageHeld: 0,
    percentComplete: 0,
  },
  {
    id: 'prj-brookhaven-school',
    user_id: DEMO_USER_ID,
    name: 'Brookhaven Elementary Addition',
    project_type: 'Stipulated Sum',
    contract_value: '6380000',
    start_date: dateOnly(-6),
    estimated_completion: dateOnly(360),
    owner: 'Brookhaven Unified School District',
    contractor: 'Meridian Builders',
    architect: 'Fairweather Educational Design',
    description: '12-classroom addition with new media center and covered walkways.',
    tags: ['Education', 'Public', 'Bonded'],
    contract_file_url: null,
    contract_text: null,
    status: 'uploaded',
    created_at: iso(-6),
    updated_at: iso(-6),
    complianceScore: 0,
    riskFlagCount: 0,
    billedToDate: 0,
    receivedToDate: 0,
    retainageHeld: 0,
    percentComplete: 0,
  },
  {
    id: 'prj-lakeshore-hotel',
    user_id: DEMO_USER_ID,
    name: 'Lakeshore Boutique Hotel Conversion',
    project_type: 'Cost Plus',
    contract_value: '9120000',
    start_date: dateOnly(2),
    estimated_completion: dateOnly(400),
    owner: 'Lakeshore Hospitality Trust',
    contractor: 'Meridian Builders',
    architect: 'Oyelaran Studio',
    description: 'Adaptive reuse of a 1920s warehouse into a 74-key boutique hotel.',
    tags: ['Hospitality', 'Adaptive Reuse', 'Historic Tax Credit'],
    contract_file_url: null,
    contract_text: null,
    status: 'draft',
    created_at: iso(-1),
    updated_at: iso(-1),
    complianceScore: 0,
    riskFlagCount: 0,
    billedToDate: 0,
    receivedToDate: 0,
    retainageHeld: 0,
    percentComplete: 0,
  },
]

// ── Schedule of values ────────────────────────────────────────
// CSI MasterFormat divisions, weighted the way a real schedule of values is.

const CSI_DIVISIONS: { code: string; name: string; weight: number }[] = [
  { code: '01 00 00', name: 'General Requirements', weight: 7.5 },
  { code: '02 41 00', name: 'Demolition & Site Clearing', weight: 3.0 },
  { code: '03 30 00', name: 'Cast-in-Place Concrete', weight: 12.5 },
  { code: '04 20 00', name: 'Unit Masonry', weight: 4.5 },
  { code: '05 12 00', name: 'Structural Steel Framing', weight: 11.0 },
  { code: '06 10 00', name: 'Rough Carpentry', weight: 3.5 },
  { code: '07 21 00', name: 'Thermal Insulation', weight: 2.5 },
  { code: '07 54 00', name: 'Membrane Roofing', weight: 4.0 },
  { code: '08 11 00', name: 'Doors & Frames', weight: 2.5 },
  { code: '08 44 00', name: 'Curtain Wall & Glazing', weight: 8.0 },
  { code: '09 21 00', name: 'Gypsum Board Assemblies', weight: 5.0 },
  { code: '09 51 00', name: 'Acoustical Ceilings', weight: 2.0 },
  { code: '09 65 00', name: 'Resilient Flooring', weight: 2.5 },
  { code: '09 91 00', name: 'Painting & Coatings', weight: 2.0 },
  { code: '10 28 00', name: 'Toilet & Bath Accessories', weight: 1.0 },
  { code: '14 20 00', name: 'Elevators', weight: 3.5 },
  { code: '21 13 00', name: 'Fire Suppression Sprinklers', weight: 2.5 },
  { code: '22 00 00', name: 'Plumbing', weight: 6.0 },
  { code: '23 00 00', name: 'HVAC', weight: 9.5 },
  { code: '26 00 00', name: 'Electrical', weight: 8.0 },
  { code: '31 20 00', name: 'Earth Moving', weight: 3.5 },
  { code: '32 12 00', name: 'Asphalt Paving', weight: 2.0 },
  { code: '33 10 00', name: 'Site Utilities', weight: 3.5 },
]

const round2 = (n: number) => Math.round(n * 100) / 100

function buildLineItems(opts: {
  seed: number
  contractSum: number
  divisionCount: number
  overallPercent: number
  previousPercent: number
  materialsStored: boolean
}): LineItem[] {
  const rand = seeded(opts.seed)
  const divisions = CSI_DIVISIONS.slice(0, opts.divisionCount)
  const weightTotal = divisions.reduce((s, d) => s + d.weight, 0)

  return divisions.map((div, i) => {
    const scheduledValue = round2((div.weight / weightTotal) * opts.contractSum)

    // Trades run ahead of or behind the overall curve — sitework finishes
    // early, finishes trail — which is what makes a schedule of values
    // interesting to look at rather than uniformly N% across every row.
    const phaseBias = i < 5 ? 1.35 : i > divisions.length - 6 ? 0.45 : 1.0
    const jitter = 0.85 + rand() * 0.3

    const pct = Math.min(1, Math.max(0, (opts.overallPercent / 100) * phaseBias * jitter))

    // Split this row's completion between "previously billed" and "this period"
    // using the same ratio as the project overall. Deriving the previous figure
    // from pct (rather than clamping both independently) means a row that has
    // reached 100% still shows the movement that got it there, instead of a
    // column of zeroes at the top of the grid.
    const prevRatio =
      opts.overallPercent > 0
        ? Math.min(0.94, opts.previousPercent / opts.overallPercent)
        : 0
    const prevPct = pct * prevRatio

    const previousWork = round2(scheduledValue * prevPct)
    const thisPeriodWork = round2(scheduledValue * (pct - prevPct))

    const storedEligible = opts.materialsStored && [4, 9, 17, 18, 19].includes(i)
    const thisPeriodMaterialsStored = storedEligible
      ? round2(scheduledValue * 0.06 * (0.5 + rand()))
      : 0
    const previousMaterialsStored = storedEligible
      ? round2(scheduledValue * 0.03 * (0.5 + rand()))
      : 0

    const overBilled = pct > 0.97 && rand() > 0.75

    return {
      id: `li-${opts.seed}-${i}`,
      lineNumber: div.code,
      description: div.name,
      scheduledValue,
      previousWork,
      thisPeriodWork,
      previousMaterialsStored,
      thisPeriodMaterialsStored,
      hasWarning: overBilled,
      warningMessage: overBilled
        ? 'Billed to 100% — confirm the work is complete before certification.'
        : undefined,
    }
  })
}

const CHANGE_ORDERS: Record<string, ChangeOrder[]> = {
  'prj-northgate-medical': [
    { id: 'co-1', number: 'CO-001', description: 'Added MRI suite structural reinforcement', amount: 184500 },
    { id: 'co-2', number: 'CO-002', description: 'Owner-requested lobby finish upgrade', amount: 62300 },
    { id: 'co-3', number: 'CO-003', description: 'Deduct — deleted exterior canopy', amount: -41000 },
  ],
  'prj-harbor-view': [
    { id: 'co-4', number: 'CO-001', description: 'Unforeseen contaminated soil removal', amount: 312750 },
    { id: 'co-5', number: 'CO-002', description: 'Upgraded unit appliance package', amount: 148900 },
    { id: 'co-6', number: 'CO-003', description: 'Revised podium waterproofing detail', amount: 57400 },
    { id: 'co-7', number: 'CO-004', description: 'Deduct — value engineering, corridor finishes', amount: -96200 },
  ],
  'prj-westfield-logistics': [
    { id: 'co-8', number: 'CO-001', description: 'Additional 4 dock levelers', amount: 78600 },
  ],
  'prj-riverside-civic': [
    { id: 'co-9', number: 'CO-001', description: 'Asbestos abatement — 2nd floor plenum', amount: 96400 },
    { id: 'co-10', number: 'CO-002', description: 'Historic window restoration scope', amount: 134800 },
  ],
}

// ── Pay applications ──────────────────────────────────────────

interface PayAppSpec {
  id: string
  projectId: string
  applicationNumber: string
  status: PayAppStatus
  contractSum: number
  divisionCount: number
  overallPercent: number
  previousPercent: number
  retainagePercent: number
  materialsStored: boolean
  periodOffsetDays: number
  currentStep: number
  completedSteps: number[]
  correctedFromId?: string
  correctionReason?: string
}

const PAY_APP_SPECS: PayAppSpec[] = [
  {
    id: 'pa-northgate-009', projectId: 'prj-northgate-medical', applicationNumber: '9',
    status: 'finalized', contractSum: 14250000, divisionCount: 23,
    overallPercent: 75, previousPercent: 67, retainagePercent: 10,
    materialsStored: true, periodOffsetDays: -32, currentStep: 6, completedSteps: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'pa-northgate-010', projectId: 'prj-northgate-medical', applicationNumber: '10',
    status: 'draft', contractSum: 14250000, divisionCount: 23,
    overallPercent: 82, previousPercent: 75, retainagePercent: 10,
    materialsStored: true, periodOffsetDays: -2, currentStep: 4, completedSteps: [1, 2, 3],
  },
  {
    id: 'pa-harbor-005', projectId: 'prj-harbor-view', applicationNumber: '5',
    status: 'finalized', contractSum: 23800000, divisionCount: 21,
    overallPercent: 49, previousPercent: 41, retainagePercent: 10,
    materialsStored: true, periodOffsetDays: -30, currentStep: 6, completedSteps: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'pa-harbor-006', projectId: 'prj-harbor-view', applicationNumber: '6',
    status: 'corrected-draft', contractSum: 23800000, divisionCount: 21,
    overallPercent: 56, previousPercent: 49, retainagePercent: 10,
    materialsStored: true, periodOffsetDays: -1, currentStep: 5, completedSteps: [1, 2, 3, 4],
    correctedFromId: 'pa-harbor-005',
    correctionReason: 'Architect rejected — stored materials lacked insurance certificates',
  },
  {
    id: 'pa-westfield-004', projectId: 'prj-westfield-logistics', applicationNumber: '4',
    status: 'finalized', contractSum: 8940000, divisionCount: 18,
    overallPercent: 69, previousPercent: 58, retainagePercent: 5,
    materialsStored: false, periodOffsetDays: -28, currentStep: 6, completedSteps: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 'pa-westfield-005', projectId: 'prj-westfield-logistics', applicationNumber: '5',
    status: 'draft', contractSum: 8940000, divisionCount: 18,
    overallPercent: 77, previousPercent: 69, retainagePercent: 5,
    materialsStored: false, periodOffsetDays: 0, currentStep: 2, completedSteps: [1],
  },
  {
    id: 'pa-riverside-002', projectId: 'prj-riverside-civic', applicationNumber: '2',
    status: 'draft', contractSum: 5620000, divisionCount: 14,
    overallPercent: 26, previousPercent: 15, retainagePercent: 10,
    materialsStored: false, periodOffsetDays: -4, currentStep: 3, completedSteps: [1, 2],
  },
  {
    id: 'pa-summit-001', projectId: 'prj-summit-ridge', applicationNumber: '1',
    status: 'draft', contractSum: 31400000, divisionCount: 12,
    overallPercent: 7, previousPercent: 0, retainagePercent: 10,
    materialsStored: true, periodOffsetDays: -8, currentStep: 1, completedSteps: [],
  },
]

function buildPayApp(spec: PayAppSpec, index: number): PayApp {
  const project = DEMO_PROJECTS.find((p) => p.id === spec.projectId)!
  const changeOrders = CHANGE_ORDERS[spec.projectId] ?? []
  // buildLineItems only sets the *inputs*. The derived columns
  // (workToDate, earnedToDate, retainageHeld, percentComplete) have to be
  // computed with the app's own function or every total reads as zero.
  const lineItems = calculateAllLineItems(
    buildLineItems({
      seed: 7919 + index * 104729,
      contractSum: spec.contractSum,
      divisionCount: spec.divisionCount,
      overallPercent: spec.overallPercent,
      previousPercent: spec.previousPercent,
      materialsStored: spec.materialsStored,
    }),
    spec.retainagePercent,
  )

  return {
    id: spec.id,
    status: spec.status,
    entryMode: index === 0 ? 'guided' : 'from-previous',
    createdAt: iso(spec.periodOffsetDays - 30),
    updatedAt: iso(spec.periodOffsetDays),
    finalizedAt: spec.status === 'finalized' ? iso(spec.periodOffsetDays + 3) : undefined,
    userId: DEMO_USER_ID,
    basics: {
      projectName: project.name,
      ownerName: project.owner ?? '',
      contractorName: project.contractor ?? '',
      applicationNumber: spec.applicationNumber,
      periodStartDate: dateOnly(spec.periodOffsetDays - 30),
      periodEndDate: dateOnly(spec.periodOffsetDays),
      paymentDueDate: dateOnly(spec.periodOffsetDays + 30),
    },
    billingFormat: 'schedule-of-values',
    retainageSettings: {
      retainagePercent: spec.retainagePercent,
      appliesTo: spec.materialsStored ? 'both' : 'work',
      canChangeOverTime: spec.overallPercent >= 50,
      effectiveDate: spec.overallPercent >= 50 ? dateOnly(spec.periodOffsetDays - 60) : undefined,
      newRetainagePercent: spec.overallPercent >= 50 ? 5 : undefined,
    },
    changeOrderSettings: {
      hasChangeOrders: changeOrders.length > 0,
      mode: changeOrders.length > 0 ? 'individual' : 'none',
      totalAmount: changeOrders.reduce((s, co) => s + co.amount, 0),
      changeOrders,
    },
    materialsStoredEnabled: spec.materialsStored,
    lineItems,
    signatureInfo:
      spec.status === 'finalized'
        ? { signerName: 'Dana Whitfield', title: 'Project Executive', date: dateOnly(spec.periodOffsetDays + 3) }
        : undefined,
    correctedFromId: spec.correctedFromId,
    correctionReason: spec.correctionReason,
    currentStep: spec.currentStep,
    completedSteps: spec.completedSteps,
  }
}

export const DEMO_PAY_APPS: PayApp[] = PAY_APP_SPECS.map(buildPayApp)

export function getDemoPayApp(id: string): PayApp | null {
  return DEMO_PAY_APPS.find((p) => p.id === id) ?? null
}

export function getDemoProject(id: string): DemoProject | null {
  return DEMO_PROJECTS.find((p) => p.id === id) ?? null
}

// ── Compliance findings ───────────────────────────────────────

export interface DemoRiskFlag {
  id: string
  projectId: string
  projectName: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  status: 'open' | 'resolved'
  clause: string
  flaggedAt: string
}

export const DEMO_RISK_FLAGS: DemoRiskFlag[] = [
  {
    id: 'rf-1', projectId: 'prj-harbor-view', projectName: 'Harbor View Residences — Phase II',
    title: 'Pay-when-paid clause', severity: 'high', status: 'open',
    description: 'Article 5.2 conditions your payment on the owner receiving construction loan draws. In this state pay-when-paid is enforceable only as a timing provision, not as a condition precedent.',
    clause: 'Article 5.2 — Progress Payments', flaggedAt: iso(-19),
  },
  {
    id: 'rf-2', projectId: 'prj-riverside-civic', projectName: 'Riverside Civic Center Renovation',
    title: 'Retainage exceeds statutory cap', severity: 'high', status: 'open',
    description: 'Contract specifies 10% retainage held through final completion. Public works in this jurisdiction cap retainage at 5% after 50% completion.',
    clause: 'Article 7.1 — Retainage', flaggedAt: iso(-24),
  },
  {
    id: 'rf-3', projectId: 'prj-eastline-transit', projectName: 'Eastline Transit Maintenance Facility',
    title: 'Certified payroll not referenced', severity: 'high', status: 'open',
    description: 'Federally funded project with no certified payroll submission requirement in the payment article. Missing documentation is a common cause of withheld payment.',
    clause: 'Article 5 — Payment', flaggedAt: iso(-9),
  },
  {
    id: 'rf-4', projectId: 'prj-harbor-view', projectName: 'Harbor View Residences — Phase II',
    title: 'No interest rate on late payment', severity: 'medium', status: 'open',
    description: 'General conditions allow work stoppage after 7 days of non-payment but specify no interest rate on overdue amounts, limiting recovery of carrying costs.',
    clause: 'General Conditions §9.7', flaggedAt: iso(-21),
  },
  {
    id: 'rf-5', projectId: 'prj-riverside-civic', projectName: 'Riverside Civic Center Renovation',
    title: 'Stored materials insurance unspecified', severity: 'medium', status: 'open',
    description: 'Contract permits billing for stored materials but does not state who insures them off-site. Carriers routinely deny these claims absent explicit coverage.',
    clause: 'General Conditions §9.3.2', flaggedAt: iso(-17),
  },
  {
    id: 'rf-6', projectId: 'prj-summit-ridge', projectName: 'Summit Ridge Corporate Campus — Bldg C',
    title: 'Lien waiver form not attached', severity: 'medium', status: 'open',
    description: 'Payment is conditioned on customary lien waivers with no exhibit defining the form. Ambiguity here delays first payment more often than any other clause.',
    clause: 'Article 5.4 — Waivers', flaggedAt: iso(-12),
  },
  {
    id: 'rf-7', projectId: 'prj-northgate-medical', projectName: 'Northgate Medical Office Building',
    title: 'Substantial completion date undefined', severity: 'low', status: 'open',
    description: 'Retainage reduction is tied to substantial completion, but the term is never defined with a certificate or milestone trigger.',
    clause: 'Article 3.3 — Time', flaggedAt: iso(-40),
  },
  {
    id: 'rf-8', projectId: 'prj-westfield-logistics', projectName: 'Westfield Logistics Center',
    title: 'Retainage reduction threshold met', severity: 'low', status: 'resolved',
    description: 'Project passed 50% completion; retainage reduced from 10% to 5% as permitted. Applied beginning with application 4.',
    clause: 'Article 7.1 — Retainage', flaggedAt: iso(-55),
  },
  {
    id: 'rf-9', projectId: 'prj-westfield-logistics', projectName: 'Westfield Logistics Center',
    title: 'Schedule of values missing detail', severity: 'medium', status: 'resolved',
    description: 'Application 2 submitted totals only. Architect requested a line-item breakdown; resubmitted with a full schedule of values.',
    clause: 'General Conditions §9.2', flaggedAt: iso(-78),
  },
  {
    id: 'rf-10', projectId: 'prj-harbor-view', projectName: 'Harbor View Residences — Phase II',
    title: 'Change order markup exceeds cap', severity: 'medium', status: 'open',
    description: 'CO-002 carries 18% combined overhead and profit; the contract caps markup on owner-directed changes at 15%.',
    clause: 'Article 7.2 — Change Orders', flaggedAt: iso(-15),
  },
  {
    id: 'rf-11', projectId: 'prj-eastline-transit', projectName: 'Eastline Transit Maintenance Facility',
    title: 'Claims notice period is 7 days', severity: 'medium', status: 'open',
    description: 'Claims notice window is 7 days from the triggering event, shorter than the 21 days in standard general conditions. Missed notice waives the claim entirely.',
    clause: 'General Conditions §15.1.3', flaggedAt: iso(-8),
  },
  {
    id: 'rf-12', projectId: 'prj-riverside-civic', projectName: 'Riverside Civic Center Renovation',
    title: 'Liquidated damages without a cap', severity: 'high', status: 'open',
    description: 'Liquidated damages accrue at $2,400/day with no aggregate cap and no matching early-completion bonus.',
    clause: 'Article 3.4 — Liquidated Damages', flaggedAt: iso(-22),
  },
]

// ── Portfolio roll-ups ────────────────────────────────────────

export const DEMO_PORTFOLIO = {
  get totalContractValue() {
    return DEMO_PROJECTS.reduce((s, p) => s + Number(p.contract_value ?? 0), 0)
  },
  get billedToDate() {
    return DEMO_PROJECTS.reduce((s, p) => s + p.billedToDate, 0)
  },
  get receivedToDate() {
    return DEMO_PROJECTS.reduce((s, p) => s + p.receivedToDate, 0)
  },
  get retainageHeld() {
    return DEMO_PROJECTS.reduce((s, p) => s + p.retainageHeld, 0)
  },
  get activeProjects() {
    return DEMO_PROJECTS.filter((p) => p.status !== 'draft').length
  },
  get openRiskFlags() {
    return DEMO_RISK_FLAGS.filter((f) => f.status === 'open').length
  },
  get complianceScore() {
    const scored = DEMO_PROJECTS.filter((p) => p.complianceScore > 0)
    return Math.round(scored.reduce((s, p) => s + p.complianceScore, 0) / scored.length)
  },
}

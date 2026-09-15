'use client'

import { useState, useEffect, useRef } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Clock,
  Search,
  Download,
  CheckCircle,
  BarChart3,
  Camera,
  ChevronRight,
  Info,
  GitCompare,
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const kpiData = [
  {
    label: 'Total Billed',
    value: '$18.4M',
    numericValue: 18.4,
    delta: '+12.3% vs prior period',
    deltaType: 'up',
    icon: DollarSign,
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.08)',
    tooltip: 'Sum of all pay applications submitted across active projects this period.',
  },
  {
    label: 'Payments Received',
    value: '$16.1M',
    numericValue: 16.1,
    delta: '87.5% collection rate',
    deltaType: 'up',
    icon: CheckCircle,
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,0.08)',
    tooltip: 'Total payments confirmed received against submitted applications.',
  },
  {
    label: 'Retainage Held',
    value: '$2.3M',
    numericValue: 2.3,
    delta: 'Across 4 projects',
    deltaType: 'neutral',
    icon: Shield,
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    tooltip: 'Total retainage withheld per contract terms. Releases forecast Q3 2026.',
  },
  {
    label: 'Avg Days to Pay',
    value: '23',
    numericValue: 23,
    delta: '4 days faster than avg',
    deltaType: 'up',
    icon: Clock,
    accent: '#8b5cf6',
    accentBg: 'rgba(139,92,246,0.08)',
    tooltip: 'Mean time from application submission to payment receipt across all apps.',
  },
]

const billingData = [
  { month: 'Aug', billed: 2.1, received: 1.8 },
  { month: 'Sep', billed: 2.8, received: 2.4 },
  { month: 'Oct', billed: 3.2, received: 2.9 },
  { month: 'Nov', billed: 3.8, received: 3.4 },
  { month: 'Dec', billed: 2.9, received: 2.6 },
  { month: 'Jan', billed: 4.1, received: 3.7 },
  { month: 'Feb', billed: 4.6, received: 4.2 },
  { month: 'Mar', billed: 4.9, received: 4.5 },
]

const billingDataPrior = [
  { month: 'Aug', billed: 1.6, received: 1.3 },
  { month: 'Sep', billed: 2.1, received: 1.8 },
  { month: 'Oct', billed: 2.5, received: 2.2 },
  { month: 'Nov', billed: 3.1, received: 2.7 },
  { month: 'Dec', billed: 2.2, received: 1.9 },
  { month: 'Jan', billed: 3.4, received: 3.0 },
  { month: 'Feb', billed: 3.8, received: 3.5 },
  { month: 'Mar', billed: 4.1, received: 3.7 },
]

const contractTypes = [
  { name: 'Stipulated Sum', value: 13000000, percentage: 52, color: '#3b82f6' },
  { name: 'Cost Plus GMP', value: 7750000, percentage: 31, color: '#10b981' },
  { name: 'Cost Plus', value: 4250000, percentage: 17, color: '#f59e0b' },
]

const complianceTrend = [
  { month: 'Oct', score: 82 },
  { month: 'Nov', score: 85 },
  { month: 'Dec', score: 87 },
  { month: 'Jan', score: 90 },
  { month: 'Feb', score: 93 },
  { month: 'Mar', score: 94 },
]

const paymentVelocity = [
  { app: 'App 1', days: 27 },
  { app: 'App 2', days: 31 },
  { app: 'App 3', days: 18 },
  { app: 'App 4', days: 34 },
  { app: 'App 5', days: 22 },
  { app: 'App 6', days: 23 },
]

const riskFlags = [
  { category: 'Pay-When-Paid', count: 8, color: '#3b82f6' },
  { category: 'Retainage Rate', count: 5, color: '#f59e0b' },
  { category: 'Lien Waivers', count: 4, color: '#10b981' },
  { category: 'Stored Materials', count: 3, color: '#8b5cf6' },
  { category: 'Substantial Completion', count: 2, color: '#ef4444' },
]

const projectPerformance = [
  {
    name: 'Test Project 11',
    contract: 'Stipulated Sum',
    contractValue: 25000002,
    billedToDate: 9200000,
    received: 8100000,
    retainage: 1100000,
    compliance: 94,
    trend: [40, 55, 60, 75, 90],
    monthlyBreakdown: [
      { month: 'Oct', billed: 1200000, received: 1050000 },
      { month: 'Nov', billed: 1500000, received: 1380000 },
      { month: 'Dec', billed: 2000000, received: 1820000 },
      { month: 'Jan', billed: 2400000, received: 2200000 },
      { month: 'Feb', billed: 2100000, received: 1950000 },
    ],
    complianceIssues: [],
  },
  {
    name: 'Westfield Office Build',
    contract: 'Cost Plus GMP',
    contractValue: 12400000,
    billedToDate: 5800000,
    received: 5200000,
    retainage: 650000,
    compliance: 71,
    trend: [70, 60, 65, 55, 71],
    monthlyBreakdown: [
      { month: 'Oct', billed: 620000, received: 560000 },
      { month: 'Nov', billed: 780000, received: 700000 },
      { month: 'Dec', billed: 900000, received: 810000 },
      { month: 'Jan', billed: 1100000, received: 980000 },
      { month: 'Feb', billed: 950000, received: 850000 },
    ],
    complianceIssues: [
      { label: 'Pay-When-Paid clause', impact: '-15pts', severity: 'high' },
      { label: 'Retainage rate 12%', impact: '-8pts', severity: 'high' },
      { label: 'Stored materials clause', impact: '-6pts', severity: 'medium' },
    ],
  },
  {
    name: 'Harbor View Residential',
    contract: 'Stipulated Sum',
    contractValue: 8750000,
    billedToDate: 2100000,
    received: 1900000,
    retainage: 280000,
    compliance: 83,
    trend: [30, 40, 55, 70, 83],
    monthlyBreakdown: [
      { month: 'Oct', billed: 180000, received: 160000 },
      { month: 'Nov', billed: 210000, received: 190000 },
      { month: 'Dec', billed: 350000, received: 310000 },
      { month: 'Jan', billed: 480000, received: 430000 },
      { month: 'Feb', billed: 530000, received: 480000 },
    ],
    complianceIssues: [
      { label: 'Lien waiver deadline', impact: '-10pts', severity: 'medium' },
      { label: 'Substantial completion date', impact: '-7pts', severity: 'low' },
    ],
  },
  {
    name: 'Northampton Civic Center',
    contract: 'Cost Plus',
    contractValue: 4250000,
    billedToDate: 1300000,
    received: 1200000,
    retainage: 260000,
    compliance: 98,
    trend: [85, 88, 90, 95, 98],
    monthlyBreakdown: [
      { month: 'Oct', billed: 120000, received: 110000 },
      { month: 'Nov', billed: 190000, received: 175000 },
      { month: 'Dec', billed: 240000, received: 225000 },
      { month: 'Jan', billed: 310000, received: 295000 },
      { month: 'Feb', billed: 340000, received: 320000 },
    ],
    complianceIssues: [
      { label: 'Minor schedule of values formatting', impact: '-2pts', severity: 'low' },
    ],
  },
]

// ─── Unchanged helper functions ───────────────────────────────────────────────

const formatDate = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

const getDeltaIcon = (type: string) => {
  switch (type) {
    case 'up': return <TrendingUp className="w-3.5 h-3.5" />
    case 'down': return <TrendingDown className="w-3.5 h-3.5" />
    default: return null
  }
}

const getDeltaColor = (type: string) => {
  switch (type) {
    case 'up': return 'text-emerald-600'
    case 'down': return 'text-red-500'
    default: return 'text-gray-400'
  }
}

const getContractBadgeColor = (type: string) => {
  switch (type) {
    case 'Stipulated Sum': return 'bg-blue-50 text-blue-700 border border-blue-100'
    case 'Cost Plus GMP': return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    case 'Cost Plus': return 'bg-amber-50 text-amber-700 border border-amber-100'
    default: return 'bg-gray-50 text-gray-600 border border-gray-100'
  }
}

const getComplianceColor = (score: number) => {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 75) return 'text-amber-600'
  return 'text-red-500'
}

const renderSparkline = (data: number[]) => {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-px" style={{ width: 44, height: 24 }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px]"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1 ? '#3b82f6' : '#dbeafe',
          }}
        />
      ))}
    </div>
  )
}

// ─── [7] Animated counter ─────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 900, decimals = 1) {
  const [current, setCurrent] = useState(0)
  const frame = useRef<number>()
  const start = useRef<number>()

  useEffect(() => {
    const animate = (ts: number) => {
      if (!start.current) start.current = ts
      const p = Math.min((ts - start.current) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCurrent(parseFloat((eased * target).toFixed(decimals)))
      if (p < 1) frame.current = requestAnimationFrame(animate)
    }
    frame.current = requestAnimationFrame(animate)
    return () => { if (frame.current) cancelAnimationFrame(frame.current) }
  }, [target, duration, decimals])

  return current
}

// ─── [6][7] KPI Card ──────────────────────────────────────────────────────────

function KPICard({ kpi }: { kpi: typeof kpiData[0] }) {
  const isDollar = kpi.value.startsWith('$')
  const isMillions = kpi.value.includes('M')
  const raw = parseFloat(kpi.value.replace(/[$M%]/g, ''))
  const animated = useAnimatedCounter(raw, 900, isMillions ? 1 : 0)
  const [tip, setTip] = useState(false)

  const displayValue = isDollar
    ? isMillions ? `$${animated.toFixed(1)}M` : `$${animated.toFixed(0)}`
    : `${Math.round(animated)}`

  return (
    <div className="relative bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
      {/* Hover accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: kpi.accent }}
      />

      <div className="flex items-start justify-between mb-5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{kpi.label}</p>
        <div className="flex items-center gap-2">
          {/* [6] Info tooltip */}
          <div className="relative">
            <button
              className="text-gray-200 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
              onMouseEnter={() => setTip(true)}
              onMouseLeave={() => setTip(false)}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {tip && (
              <div className="absolute right-0 top-6 z-50 w-52 bg-gray-900 text-white/80 text-[11px] leading-relaxed rounded-xl px-3 py-2.5 shadow-2xl pointer-events-none">
                {kpi.tooltip}
                <div className="absolute -top-[5px] right-2 w-2.5 h-2.5 bg-gray-900 rotate-45" />
              </div>
            )}
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: kpi.accentBg, color: kpi.accent }}
          >
            <kpi.icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>
      </div>

      {/* [7] Animated value */}
      <p className="text-[28px] font-bold tracking-tight text-gray-900 tabular-nums leading-none mb-2">
        {displayValue}
      </p>

      <div className={`flex items-center gap-1 text-xs font-medium ${getDeltaColor(kpi.deltaType)}`}>
        {getDeltaIcon(kpi.deltaType)}
        <span>{kpi.delta}</span>
      </div>
    </div>
  )
}

// ─── [3] Chart tooltip ────────────────────────────────────────────────────────

function ChartTooltip({ x, y, content, visible }: {
  x: number; y: number; content: React.ReactNode; visible: boolean
}) {
  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: x,
        top: y,
        opacity: visible ? 1 : 0,
        transform: 'translate(-50%, calc(-100% - 10px))',
        transition: 'opacity 0.1s ease',
      }}
    >
      <div className="bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl px-3 py-2.5 shadow-2xl whitespace-nowrap">
        {content}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-2.5 h-2.5 bg-gray-900 rotate-45" />
      </div>
    </div>
  )
}

// ─── [5] Snapshot button ─────────────────────────────────────────────────────

function SnapshotButton() {
  const [saved, setSaved] = useState(false)
  return (
    <button
      onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
      title="Snapshot chart"
      className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100"
    >
      {saved
        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        : <Camera className="w-3.5 h-3.5" />}
    </button>
  )
}

// ─── [2] Expanded project row ─────────────────────────────────────────────────

function ExpandedRow({ project }: { project: typeof projectPerformance[0] }) {
  const max = Math.max(...project.monthlyBreakdown.map(m => m.billed))
  return (
    <tr>
      <td colSpan={9} className="p-0 border-b border-gray-100">
        <div className="bg-slate-50 px-6 py-5 grid grid-cols-2 gap-10 border-l-2 border-blue-400 ml-[52px]">

          {/* Monthly mini-chart */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Monthly Billing vs. Received
            </p>
            <div className="flex items-end gap-2" style={{ height: 56 }}>
              {project.monthlyBreakdown.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex flex-col gap-px">
                    <div className="w-full rounded-sm bg-blue-400"
                      style={{ height: `${(m.billed / max) * 36}px` }} />
                    <div className="w-full rounded-sm bg-emerald-400"
                      style={{ height: `${(m.received / max) * 36}px` }} />
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <div className="w-2 h-1.5 rounded-sm bg-blue-400" /> Billed
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <div className="w-2 h-1.5 rounded-sm bg-emerald-400" /> Received
              </div>
            </div>
          </div>

          {/* [6] Compliance breakdown */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Compliance Breakdown — {project.compliance}%
            </p>
            {project.complianceIssues.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" strokeWidth={1.75} />
                No issues — full marks
              </div>
            ) : (
              <div className="space-y-2.5">
                {project.complianceIssues.map((issue) => (
                  <div key={issue.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        issue.severity === 'high' ? 'bg-red-500'
                        : issue.severity === 'medium' ? 'bg-amber-400'
                        : 'bg-gray-300'
                      }`} />
                      <span className="text-xs text-gray-600">{issue.label}</span>
                    </div>
                    <span className={`text-[11px] font-bold tabular-nums ${
                      issue.severity === 'high' ? 'text-red-500'
                      : issue.severity === 'medium' ? 'text-amber-600'
                      : 'text-gray-400'
                    }`}>{issue.impact}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-200">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Final score</span>
                  <span className={`text-sm font-bold ${getComplianceColor(project.compliance)}`}>
                    {project.compliance}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── Panel wrapper ────────────────────────────────────────────────────────────

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function PanelHeader({ label, title, subtitle, right }: {
  label?: string; title: string; subtitle?: string; right?: React.ReactNode
}) {
  return (
    <div className="px-5 pt-5 pb-4 flex items-start justify-between">
      <div>
        {label && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  )
}

// ─── [8] Empty state ─────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <BarChart3 className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">No data yet</h3>
      <p className="text-xs text-gray-400 max-w-[220px] mb-5 leading-relaxed">
        Upload your first construction contract to start tracking payments and compliance.
      </p>
      <button className="text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg">
        Upload a contract →
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const DATE_RANGES = ['7D', '30D', '90D', 'YTD', 'All'] as const
type DateRange = typeof DATE_RANGES[number]

type Tooltip = { visible: boolean; x: number; y: number; content: React.ReactNode }

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30D')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [comparePrior, setComparePrior] = useState(false)
  const [tooltip, setTooltip] = useState<Tooltip>({ visible: false, x: 0, y: 0, content: null })

  // [1] Keyboard shortcuts 1–5
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const idx = parseInt(e.key) - 1
      if (idx >= 0 && idx < DATE_RANGES.length) setDateRange(DATE_RANGES[idx])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // [3] Show/hide tooltip
  const showTip = (e: React.MouseEvent<HTMLElement>, containerSel: string, content: React.ReactNode) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const container = e.currentTarget.closest(containerSel)?.getBoundingClientRect()
    if (!container) return
    setTooltip({ visible: true, x: rect.left - container.left + rect.width / 2, y: rect.top - container.top, content })
  }
  const hideTip = () => setTooltip(p => ({ ...p, visible: false }))

  const filteredProjects = projectPerformance.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">Portfolio performance across all projects</p>
        </div>
        {/* [1] Pill date switcher */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
          {DATE_RANGES.map((range, i) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              title={`Press ${i + 1}`}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                dateRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-3 gap-4">

        {/* ── Billing chart ── */}
        <Panel className="col-span-2 group">
          <PanelHeader
            label="Revenue"
            title="Billing vs. Payments Received"
            subtitle="Monthly comparison — last 8 months"
            right={
              <>
                {/* [4] Compare toggle */}
                <button
                  onClick={() => setComparePrior(p => !p)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                    comparePrior
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'border-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <GitCompare className="w-3 h-3" />
                  Compare
                </button>
                {/* [5] Snapshot */}
                <SnapshotButton />
              </>
            }
          />

          {/* Legend */}
          <div className="px-5 flex items-center gap-4 mb-3">
            {[
              { color: '#3b82f6', label: 'Billed' },
              { color: '#10b981', label: 'Received' },
              ...(comparePrior ? [{ color: '#d1d5db', label: 'Prior period' }] : []),
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                <span className="text-[11px] text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="relative billing-panel px-5 pb-5">
            {/* Y axis */}
            <div className="flex">
              <div className="flex flex-col justify-between text-right pr-2.5" style={{ height: 160 }}>
                {['$5M', '$4M', '$3M', '$2M', '$1M'].map(l => (
                  <span key={l} className="text-[9px] text-gray-300 leading-none">{l}</span>
                ))}
              </div>
              <div className="flex-1 relative">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="absolute left-0 right-0 border-t border-gray-100"
                    style={{ top: `${(i / 4) * 160}px` }} />
                ))}
                {/* Bars */}
                <div className="flex items-end gap-1.5" style={{ height: 160 }}>
                  {billingData.map((data, idx) => (
                    <div key={idx} className="flex-1 flex items-end gap-0.5 h-full">
                      {/* [4] Prior (faded) */}
                      {comparePrior && (
                        <div className="flex-1 flex flex-col justify-end gap-px opacity-30">
                          <div className="w-full rounded-t-[2px] bg-blue-300"
                            style={{ height: `${(billingDataPrior[idx].billed / 5) * 160}px` }} />
                          <div className="w-full rounded-t-[2px] bg-emerald-300"
                            style={{ height: `${(billingDataPrior[idx].received / 5) * 160}px` }} />
                        </div>
                      )}
                      {/* [3] Current (hoverable) */}
                      <div
                        className="flex-1 flex flex-col justify-end gap-px cursor-pointer"
                        onMouseEnter={e => showTip(e, '.billing-panel', (
                          <div className="space-y-1.5">
                            <p className="font-semibold text-white/90 mb-0.5">{data.month}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              Billed: <strong>${data.billed.toFixed(1)}M</strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Received: <strong>${data.received.toFixed(1)}M</strong>
                            </div>
                            <div className="text-white/40 text-[10px] mt-0.5">
                              Gap: ${(data.billed - data.received).toFixed(1)}M outstanding
                            </div>
                          </div>
                        ))}
                        onMouseLeave={hideTip}
                      >
                        <div className="w-full rounded-t-[2px] bg-blue-500 hover:bg-blue-600 transition-colors"
                          style={{ height: `${(data.billed / 5) * 160}px` }} />
                        <div className="w-full rounded-t-[2px] bg-emerald-500 hover:bg-emerald-600 transition-colors"
                          style={{ height: `${(data.received / 5) * 160}px` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* X labels */}
                <div className="flex gap-1.5 mt-2">
                  {billingData.map(d => (
                    <div key={d.month} className="flex-1 text-center text-[9px] text-gray-400">{d.month}</div>
                  ))}
                </div>
              </div>
            </div>
            <ChartTooltip {...tooltip} />
          </div>
        </Panel>

        {/* ── Donut ── */}
        <Panel>
          <PanelHeader label="Breakdown" title="Contract Value by Type" />
          <div className="px-5 pb-5 flex flex-col items-center gap-5">
            {/* Donut */}
            <div className="relative" style={{ width: 140, height: 140 }}>
              <svg viewBox="0 0 160 160" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                {contractTypes.map((type, i) => {
                  const circ = 2 * Math.PI * 56
                  const off = contractTypes.slice(0, i).reduce((s, t) => s + t.percentage, 0) * circ / 100
                  return (
                    <circle
                      key={type.name}
                      cx="80" cy="80" r="56"
                      fill="none"
                      stroke={type.color}
                      strokeWidth="18"
                      strokeDasharray={`${(type.percentage / 100) * circ} ${circ}`}
                      strokeDashoffset={-(88 + off)}
                    />
                  )
                })}
                <circle cx="80" cy="80" r="47" fill="white" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-bold text-gray-900 tracking-tight">$25M</p>
                <p className="text-[10px] text-gray-400 font-medium">Total</p>
              </div>
            </div>

            {/* Type rows with mini progress */}
            <div className="w-full space-y-3">
              {contractTypes.map(type => (
                <div key={type.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: type.color }} />
                      <span className="text-xs text-gray-600 font-medium">{type.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-900 tabular-nums">{formatDate(type.value)}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${type.color}18`, color: type.color }}
                      >
                        {type.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${type.percentage}%`, background: type.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Secondary charts row */}
      <div className="grid grid-cols-3 gap-4">

        {/* Compliance trend */}
        <Panel className="group">
          <PanelHeader label="Compliance" title="Score Trend" subtitle="Rolling 6-month average"
            right={<SnapshotButton />} />
          <div className="px-5 pb-5">
            <div className="relative compliance-panel" style={{ height: 96 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: `${(i / 3) * 100}%` }} />
              ))}
              <div className="absolute inset-0 flex items-end gap-1">
                {complianceTrend.map((data, i) => {
                  const isLast = i === complianceTrend.length - 1
                  return (
                    <div
                      key={i}
                      className="flex-1 h-full flex items-end cursor-pointer group/bar"
                      onMouseEnter={e => showTip(e, '.compliance-panel', (
                        <div>
                          <p className="font-semibold mb-0.5">{data.month}</p>
                          <p>Score: <strong>{data.score}%</strong></p>
                          {i > 0 && (
                            <p className="text-white/50 text-[10px] mt-0.5">
                              {data.score > complianceTrend[i-1].score ? '▲' : '▼'} {Math.abs(data.score - complianceTrend[i-1].score)}pts from {complianceTrend[i-1].month}
                            </p>
                          )}
                        </div>
                      ))}
                      onMouseLeave={hideTip}
                    >
                      <div
                        className={`w-full rounded-t-[2px] transition-colors ${
                          isLast ? 'bg-blue-500' : 'bg-gray-100 group-hover/bar:bg-blue-200'
                        }`}
                        style={{ height: `${(data.score / 100) * 96}px` }}
                      />
                    </div>
                  )
                })}
              </div>
              <ChartTooltip {...tooltip} />
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
              {complianceTrend.map((d, i) => (
                <div key={i} className="text-center">
                  <p className="text-[9px] text-gray-400">{d.month}</p>
                  <p className={`text-[11px] font-bold ${i === complianceTrend.length - 1 ? 'text-emerald-600' : 'text-gray-700'}`}>
                    {d.score}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Payment velocity */}
        <Panel className="group">
          <PanelHeader label="Velocity" title="Days to Payment" subtitle="Avg per application"
            right={<SnapshotButton />} />
          <div className="px-5 pb-5">
            <div className="relative velocity-panel" style={{ height: 96 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ top: `${(i / 3) * 100}%` }} />
              ))}
              {/* Avg dashed line */}
              <div
                className="absolute left-0 right-6 border-t border-dashed border-red-200"
                style={{ top: `${(1 - 27 / 40) * 96}px` }}
              >
                <span className="absolute -right-6 -top-3 text-[9px] text-red-400 font-medium">avg</span>
              </div>
              <div className="absolute inset-0 flex items-end gap-1.5">
                {paymentVelocity.map((data, i) => {
                  const isLast = i === paymentVelocity.length - 1
                  const avg = 27
                  return (
                    <div
                      key={i}
                      className="flex-1 h-full flex items-end cursor-pointer group/bar"
                      onMouseEnter={e => showTip(e, '.velocity-panel', (
                        <div>
                          <p className="font-semibold mb-0.5">{data.app}</p>
                          <p>{data.days} days to pay</p>
                          <p className={`text-[10px] mt-0.5 ${data.days < avg ? 'text-emerald-400' : 'text-red-400'}`}>
                            {data.days < avg ? `${avg - data.days}d faster` : `${data.days - avg}d slower`} than avg
                          </p>
                        </div>
                      ))}
                      onMouseLeave={hideTip}
                    >
                      <div
                        className={`w-full rounded-t-[2px] transition-colors ${
                          isLast ? 'bg-blue-500' : 'bg-gray-100 group-hover/bar:bg-blue-200'
                        }`}
                        style={{ height: `${(data.days / 40) * 96}px` }}
                      />
                    </div>
                  )
                })}
              </div>
              <ChartTooltip {...tooltip} />
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 text-center">
              {[
                { label: 'Fastest', value: '18d', cls: 'text-emerald-600' },
                { label: 'Average', value: '27d', cls: 'text-gray-700' },
                { label: 'Slowest', value: '34d', cls: 'text-red-500' },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-[11px] font-bold ${s.cls}`}>{s.value}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Risk flags */}
        <Panel>
          <PanelHeader label="Risk" title="Flags by Category" subtitle="All-time distribution" />
          <div className="px-5 pb-5">
            <div className="space-y-3.5 mb-5">
              {riskFlags.map((risk) => (
                <div key={risk.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-600">{risk.category}</span>
                    <span className="text-xs font-bold text-gray-900 tabular-nums">{risk.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(risk.count / 10) * 100}%`, background: risk.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 pt-4 border-t border-gray-100 text-center">
              {[
                { label: 'Total', value: '22', cls: 'text-gray-900' },
                { label: 'Resolved', value: '19', cls: 'text-emerald-600' },
                { label: 'Open', value: '3', cls: 'text-red-500' },
              ].map(s => (
                <div key={s.label}>
                  <p className={`text-lg font-bold tracking-tight ${s.cls}`}>{s.value}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Project performance table */}
      <Panel className="overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Project Performance</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              All active projects, YTD ·{' '}
              <span className="text-gray-300">
                press{' '}
                <kbd className="font-mono text-[10px] bg-gray-100 border border-gray-200 rounded px-1 text-gray-500">1</kbd>
                {' '}–{' '}
                <kbd className="font-mono text-[10px] bg-gray-100 border border-gray-200 rounded px-1 text-gray-500">5</kbd>
                {' '}to switch range
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-300 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                placeholder="Search projects…"
                className="pl-8 pr-3 h-8 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none w-44 transition-colors"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? <EmptyState /> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-10 py-3 pl-4" />
                {['Project', 'Contract', 'Value', 'Billed', 'Received', 'Retainage', 'Compliance', 'Trend'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <>
                  <tr
                    key={project.name}
                    onClick={() => setExpandedRow(p => p === project.name ? null : project.name)}
                    className="border-b border-gray-100 hover:bg-gray-50/60 cursor-pointer transition-colors"
                  >
                    <td className="pl-4 py-3.5">
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-all duration-200 ${
                          expandedRow === project.name ? 'rotate-90 text-blue-500' : 'text-gray-300'
                        }`}
                      />
                    </td>
                    <td className="py-3.5 px-3 text-sm font-medium text-gray-800">{project.name}</td>
                    <td className="py-3.5 px-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getContractBadgeColor(project.contract)}`}>
                        {project.contract}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-sm text-gray-700 tabular-nums">{formatDate(project.contractValue)}</td>
                    <td className="py-3.5 px-3">
                      <span className="text-sm text-gray-700 tabular-nums">{formatDate(project.billedToDate)}</span>
                      <span className="text-[10px] text-gray-400 ml-1">
                        {Math.round((project.billedToDate / project.contractValue) * 100)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-sm font-medium text-emerald-600 tabular-nums">{formatDate(project.received)}</td>
                    <td className="py-3.5 px-3 text-sm text-gray-700 tabular-nums">{formatDate(project.retainage)}</td>
                    <td className="py-3.5 px-3">
                      <span className={`text-sm font-bold ${getComplianceColor(project.compliance)}`}>
                        {project.compliance}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3">{renderSparkline(project.trend)}</td>
                  </tr>
                  {expandedRow === project.name && (
                    <ExpandedRow key={`${project.name}-exp`} project={project} />
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  )
}
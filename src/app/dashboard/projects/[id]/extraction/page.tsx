'use client'

import { StepBar } from '@/components/layout/step-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Edit, Eye, AlertCircle, CheckCircle, XCircle, ArrowRight, Search, ZoomIn, ZoomOut, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 'upload', name: 'Upload', href: '/projects/123/upload' },
  { id: 'extraction', name: 'Extraction', href: '/projects/123/extraction' },
  { id: 'review', name: 'Review', href: '/projects/123/review' },
  { id: 'schedule', name: 'Schedule', href: '/projects/123/schedule' },
  { id: 'compliance', name: 'Compliance', href: '/projects/123/compliance' },
  { id: 'export', name: 'Export', href: '/projects/123/export' },
]

interface ExtractedField {
  id: string
  label: string
  value: string
  confidence: 'high' | 'medium' | 'low'
  location?: {
    page: number
    section: string
    coordinates?: { x: number; y: number }
  }
  category: string
  editable?: boolean
  originalValue?: string
}

interface CategoryData {
  id: string
  title: string
  icon: string
  iconBg: string
  iconColor: string
  fields: ExtractedField[]
  confidence: 'high' | 'medium' | 'low'
  flags?: Array<{
    type: 'high' | 'medium' | 'low'
    title: string
    description: string
  }>
}

const categoryData: CategoryData[] = [
  {
    id: 'basics',
    title: 'Contract basics',
    icon: '☐',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confidence: 'high',
    fields: [
      {
        id: 'contract_sum',
        label: 'Contract sum',
        value: '$450,000',
        confidence: 'high',
        location: { page: 1, section: 'Article 1' },
        category: 'Contract Basics'
      },
      {
        id: 'contract_type',
        label: 'Contract type',
        value: 'AIA A201-2017',
        confidence: 'high',
        location: { page: 1, section: 'Header' },
        category: 'Contract Basics'
      },
      {
        id: 'owner',
        label: 'Owner',
        value: 'ABC Development Corp',
        confidence: 'high',
        location: { page: 2, section: 'Article 1' },
        category: 'Contract Basics'
      },
      {
        id: 'contractor',
        label: 'Contractor',
        value: 'XYZ Construction LLC',
        confidence: 'high',
        location: { page: 2, section: 'Article 1' },
        category: 'Contract Basics'
      },
      {
        id: 'start_date',
        label: 'Start date',
        value: 'January 15, 2024',
        confidence: 'medium',
        location: { page: 3, section: 'Article 3' },
        category: 'Contract Basics'
      }
    ]
  },
  {
    id: 'payment',
    title: 'Payment terms',
    icon: '★',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    confidence: 'high',
    fields: [
      {
        id: 'payment_method',
        label: 'Payment method',
        value: 'Monthly Applications',
        confidence: 'high',
        location: { page: 4, section: 'Article 7' },
        category: 'Payment Terms'
      },
      {
        id: 'payment_frequency',
        label: 'Application period',
        value: 'Monthly, ending 15th',
        confidence: 'high',
        location: { page: 4, section: 'Article 7' },
        category: 'Payment Terms'
      },
      {
        id: 'application_deadline',
        label: 'Payment due',
        value: '30 days after certification',
        confidence: 'high',
        location: { page: 5, section: 'Article 7.2' },
        category: 'Payment Terms'
      },
      {
        id: 'payment_terms',
        label: 'Late payment interest',
        value: 'Not specified ⚠',
        confidence: 'low',
        location: { page: 5, section: 'Article 7.3' },
        category: 'Payment Terms'
      }
    ]
  },
  {
    id: 'retainage',
    title: 'Retainage',
    icon: '%',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    confidence: 'high',
    fields: [
      {
        id: 'retainage_rate',
        label: 'Initial retainage',
        value: '5%',
        confidence: 'medium',
        location: { page: 6, section: 'Article 8.1' },
        category: 'Retainage'
      },
      {
        id: 'retainage_reduction',
        label: 'Reduction threshold',
        value: '50% complete',
        confidence: 'medium',
        location: { page: 6, section: 'Article 8.2' },
        category: 'Retainage'
      },
      {
        id: 'reduced_rate',
        label: 'Reduced rate',
        value: '5%',
        confidence: 'medium',
        location: { page: 6, section: 'Article 8.2' },
        category: 'Retainage'
      },
      {
        id: 'retainage_release',
        label: 'Release trigger',
        value: 'Substantial completion',
        confidence: 'medium',
        location: { page: 6, section: 'Article 8.3' },
        category: 'Retainage'
      }
    ]
  },
  {
    id: 'lien',
    title: 'Lien waivers',
    icon: '⚠',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confidence: 'medium',
    fields: [
      {
        id: 'conditional_waiver',
        label: 'Type required',
        value: 'Conditional + unconditional',
        confidence: 'medium',
        location: { page: 9, section: 'Article 9.1' },
        category: 'Lien Waiver Requirements'
      },
      {
        id: 'waiver_timing',
        label: 'Timing',
        value: 'With each application',
        confidence: 'medium',
        location: { page: 9, section: 'Article 9.2' },
        category: 'Lien Waiver Requirements'
      },
      {
        id: 'sub_waivers',
        label: 'Sub waivers',
        value: 'Required for prior period',
        confidence: 'medium',
        location: { page: 9, section: 'Article 9.3' },
        category: 'Lien Waiver Requirements'
      }
    ],
    flags: [
      {
        type: 'medium',
        title: 'Timing risk',
        description: 'Contract requires sub waivers for prior period but doesn\'t specify number of days before application — could cause payment delays.'
      }
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance requirements',
    icon: '✦',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    confidence: 'high',
    fields: [
      {
        id: 'general_liability',
        label: 'CGL per occurrence',
        value: '$1,000,000',
        confidence: 'high',
        location: { page: 7, section: 'Article 11.1' },
        category: 'Insurance Requirements'
      },
      {
        id: 'general_aggregate',
        label: 'CGL aggregate',
        value: '$2,000,000',
        confidence: 'high',
        location: { page: 7, section: 'Article 11.1' },
        category: 'Insurance Requirements'
      },
      {
        id: 'workers_comp',
        label: 'Workers\' comp',
        value: 'State statutory limits',
        confidence: 'high',
        location: { page: 7, section: 'Article 11.2' },
        category: 'Insurance Requirements'
      }
    ]
  },
  {
    id: 'flags',
    title: 'Compliance flags',
    icon: '!',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confidence: 'low',
    fields: [],
    flags: [
      {
        type: 'high',
        title: 'Missing: Late payment interest rate.',
        description: 'A201 §9.7 allows contractor to stop work if payment is late, but no interest rate is specified. Recommend adding a rate (typically prime + 2%).'
      },
      {
        type: 'medium',
        title: 'No stored materials provision.',
        description: 'Contract does not address payment for materials stored off-site. This could impact cash flow for prefabricated components.'
      }
    ]
  }
]

export default function ExtractionPage() {
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [zoomLevel, setZoomLevel] = useState(100)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set(['basics', 'payment']))
  const router = useRouter()

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-700'
      case 'medium':
        return 'bg-amber-100 text-amber-700'
      case 'low':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="w-3 h-3" />
      case 'medium':
        return <AlertCircle className="w-3 h-3" />
      case 'low':
        return <XCircle className="w-3 h-3" />
      default:
        return null
    }
  }

  const handleFieldEdit = (fieldId: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleFieldClick = (field: ExtractedField) => {
    setSelectedField(field)
    // Expand the category card if not already expanded
    setExpandedCards(prev => new Set([...prev, field.category.toLowerCase().replace(' ', '_')]))
    console.log('Jumping to:', field.location)
  }

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const handleContinue = () => {
    router.push('/projects/123/review')
  }

  const stats = {
    total: categoryData.reduce((sum, cat) => sum + cat.fields.length, 0),
    high: categoryData.reduce((sum, cat) => sum + cat.fields.filter(f => f.confidence === 'high').length, 0),
    medium: categoryData.reduce((sum, cat) => sum + cat.fields.filter(f => f.confidence === 'medium').length, 0),
    low: categoryData.reduce((sum, cat) => sum + cat.fields.filter(f => f.confidence === 'low').length, 0),
    flags: categoryData.reduce((sum, cat) => sum + (cat.flags?.length || 0), 0)
  }

  return (
    <div className="min-h-screen bg-concrete">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-navy border-b-2 border-steel/30">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-base text-white tracking-tight">
            Pay<span className="text-steel">Simple</span>
          </div>
          <div className="text-xs text-white/50">
            Projects / <span className="text-white/85 font-medium">Office Building Construction</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-white/75 border-white/20 hover:bg-white/10">
            Save Draft
          </Button>
          <Button size="sm" className="bg-steel hover:bg-steel/90" onClick={handleContinue}>
            Generate Schedule
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Step Bar */}
      <StepBar steps={steps} currentStep="extraction" />

      {/* Stats Bar */}
      <div className="flex gap-2.5 px-5 py-3.5 bg-white border-b border-neutral-200">
        <Card className="flex-1 bg-concrete border-0">
          <CardContent className="p-3.5">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
              Total Extracted
            </div>
            <div className="text-lg font-bold text-slate font-mono tracking-tight">
              {stats.total}
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 bg-concrete border-0">
          <CardContent className="p-3.5">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
              High Confidence
            </div>
            <div className="text-lg font-bold text-green-600 font-mono tracking-tight">
              {stats.high}
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 bg-concrete border-0">
          <CardContent className="p-3.5">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
              Medium Confidence
            </div>
            <div className="text-lg font-bold text-amber-600 font-mono tracking-tight">
              {stats.medium}
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 bg-concrete border-0">
          <CardContent className="p-3.5">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-[0.05em] mb-0.5">
              Low Confidence
            </div>
            <div className="text-lg font-bold text-red-600 font-mono tracking-tight">
              {stats.low}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Contract Viewer */}
        <div className="flex-1 border-r border-neutral-200 bg-white flex flex-col">
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate">Contract document</h2>
                <p className="text-xs text-neutral-500">AIA A201-2017 • 24 pages</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-neutral-300 rounded">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 border-0"
                    onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-xs px-2 text-neutral-600">{zoomLevel}%</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 border-0"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-neutral-50 rounded-lg p-6" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}>
              {/* Simulated PDF viewer with highlights */}
              <div className="bg-white p-6 shadow-sm min-h-[800px]">
                <div className="space-y-4">
                  <div className="text-center">
                    <h1 className="text-lg font-bold text-slate mb-2">AIA DOCUMENT A201-2017</h1>
                    <h2 className="text-base font-semibold text-slate">GENERAL CONDITIONS OF THE CONTRACT FOR CONSTRUCTION</h2>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <p className="text-neutral-700 leading-relaxed">
                      This Agreement is made this <span className="bg-blue-100 border-b-2 border-blue-500 px-1 rounded cursor-pointer hover:bg-blue-200" onClick={() => handleFieldClick({ id: 'start_date', label: '', value: '', confidence: 'high', category: '' })}>15th day of January, 2024</span> between:
                    </p>
                    
                    <div className="space-y-2">
                      <p><span className="font-semibold">Owner:</span> <span className="bg-blue-100 border-b-2 border-blue-500 px-1 rounded cursor-pointer hover:bg-blue-200" onClick={() => handleFieldClick({ id: 'owner', label: '', value: '', confidence: 'high', category: '' })}>ABC Development Corp</span></p>
                      <p><span className="font-semibold">Contractor:</span> <span className="bg-blue-100 border-b-2 border-blue-500 px-1 rounded cursor-pointer hover:bg-blue-200" onClick={() => handleFieldClick({ id: 'contractor', label: '', value: '', confidence: 'high', category: '' })}>XYZ Construction LLC</span></p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-bold text-slate mb-2">ARTICLE 4 - CONTRACT SUM</h3>
                      <p className="text-neutral-700 leading-relaxed">
                        The Contract Sum shall be <span className="bg-green-100 border-b-2 border-green-500 px-1 rounded cursor-pointer hover:bg-green-200" onClick={() => handleFieldClick({ id: 'contract_sum', label: '', value: '', confidence: 'high', category: '' })}>Four Hundred Fifty Thousand Dollars ($450,000.00)</span> in accordance with the terms set forth below.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-bold text-slate mb-2">ARTICLE 5 - PAYMENTS</h3>
                      <p className="text-neutral-700 leading-relaxed">
                        Applications for Payment shall be submitted <span className="bg-green-100 border-b-2 border-green-500 px-1 rounded cursor-pointer hover:bg-green-200" onClick={() => handleFieldClick({ id: 'payment_frequency', label: '', value: '', confidence: 'high', category: '' })}>monthly on or before the 15th day of each month</span>.
                      </p>
                      <p className="text-neutral-700 leading-relaxed mt-2">
                        The Owner shall make payment within <span className="bg-green-100 border-b-2 border-green-500 px-1 rounded cursor-pointer hover:bg-green-200" onClick={() => handleFieldClick({ id: 'payment_terms', label: '', value: '', confidence: 'high', category: '' })}>thirty (30) days after the Architect issues a Certificate for Payment</span>.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-bold text-slate mb-2">ARTICLE 8 - RETAINAGE</h3>
                      <p className="text-neutral-700 leading-relaxed">
                        The Owner may withhold <span className="bg-green-100 border-b-2 border-green-500 px-1 rounded cursor-pointer hover:bg-green-200" onClick={() => handleFieldClick({ id: 'retainage_rate', label: '', value: '', confidence: 'medium', category: '' })}>five percent (5%) retainage</span> from each progress payment.
                      </p>
                      <p className="text-neutral-700 leading-relaxed mt-2">
                        When the Work is <span className="bg-green-100 border-b-2 border-green-500 px-1 rounded cursor-pointer hover:bg-green-200" onClick={() => handleFieldClick({ id: 'retainage_reduction', label: '', value: '', confidence: 'medium', category: '' })}>fifty percent (50%) complete</span>, retainage shall be <span className="bg-green-100 border-b-2 border-green-500 px-1 rounded cursor-pointer hover:bg-green-200" onClick={() => handleFieldClick({ id: 'reduced_rate', label: '', value: '', confidence: 'medium', category: '' })}>reduced to five percent (5%)</span>.
                      </p>
                      <p className="text-neutral-700 leading-relaxed mt-2">
                        <span className="bg-green-100 border-b-2 border-green-500 px-1 rounded cursor-pointer hover:bg-green-200" onClick={() => handleFieldClick({ id: 'retainage_release', label: '', value: '', confidence: 'medium', category: '' })}>Retainage shall be released upon Substantial Completion</span>.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-bold text-slate mb-2">ARTICLE 9 - LIEN WAIVERS</h3>
                      <p className="text-neutral-700 leading-relaxed">
                        <span className="bg-amber-100 border-b-2 border-amber-500 px-1 rounded cursor-pointer hover:bg-amber-200" onClick={() => handleFieldClick({ id: 'conditional_waiver', label: '', value: '', confidence: 'medium', category: '' })}>Conditional lien waivers shall be submitted with each Application for Payment</span>.
                      </p>
                      <p className="text-neutral-700 leading-relaxed mt-2">
                        <span className="bg-amber-100 border-b-2 border-amber-500 px-1 rounded cursor-pointer hover:bg-amber-200" onClick={() => handleFieldClick({ id: 'sub_waivers', label: '', value: '', confidence: 'medium', category: '' })}>The Contractor shall submit lien waivers from all subcontractors</span>.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-bold text-slate mb-2">ARTICLE 11 - INSURANCE</h3>
                      <p className="text-neutral-700 leading-relaxed">
                        The Contractor shall purchase and maintain <span className="bg-purple-100 border-b-2 border-purple-500 px-1 rounded cursor-pointer hover:bg-purple-200" onClick={() => handleFieldClick({ id: 'general_liability', label: '', value: '', confidence: 'high', category: '' })}>commercial general liability insurance with a per-occurrence limit of not less than $1,000,000</span>.
                      </p>
                      <p className="text-neutral-700 leading-relaxed mt-2">
                        The Contractor shall maintain <span className="bg-purple-100 border-b-2 border-purple-500 px-1 rounded cursor-pointer hover:bg-purple-200" onClick={() => handleFieldClick({ id: 'workers_comp', label: '', value: '', confidence: 'high', category: '' })}>workers' compensation insurance as required by state law</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Extracted Data */}
        <div className="w-96 bg-concrete flex flex-col">
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate">Extracted terms</h2>
                <p className="text-xs text-neutral-500">6 categories • {stats.total} fields found</p>
              </div>
              <Badge className={`text-xs ${getConfidenceColor('high')}`}>
                94% confident
              </Badge>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3.5">
            <div className="space-y-2.5">
              {categoryData.map((category) => {
                const isExpanded = expandedCards.has(category.id)
                
                return (
                  <Card 
                    key={category.id}
                    className={`border border-neutral-200 rounded-lg overflow-hidden transition-all hover:border-steel ${
                      isExpanded ? 'bg-white' : 'bg-white'
                    }`}
                  >
                    <div 
                      className="p-3.5 cursor-pointer select-none"
                      onClick={() => toggleCard(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 ${category.iconBg} rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${category.iconColor}`}>
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate capitalize">{category.title}</h3>
                            <p className="text-xs text-neutral-500">{category.fields.length} fields</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getConfidenceColor(category.confidence)}`}>
                            {category.confidence}
                          </Badge>
                          <ChevronRight className={`w-3 h-3 text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t border-neutral-100">
                        <div className="p-3.5 space-y-1">
                          {category.fields.map((field) => {
                            const isEdited = editedValues[field.id] !== undefined
                            const currentValue = isEdited ? editedValues[field.id] : field.value
                            
                            return (
                              <div key={field.id} className="flex items-baseline justify-between py-1.5 border-b border-neutral-50 last:border-0">
                                <span className="text-xs text-neutral-600 font-medium min-w-[120px]">
                                  {field.label}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span 
                                    className={`text-xs font-medium text-slate text-right cursor-text px-1.5 py-0.5 rounded border border-transparent hover:border-steel hover:bg-blue-50 transition-all ${
                                      field.value.includes('⚠') ? 'text-amber-600' : field.id === 'contract_sum' || field.id.includes('rate') || field.id.includes('limit') ? 'font-mono' : ''
                                    }`}
                                    onClick={(e) => {
                                      if (e.currentTarget === document.activeElement) return
                                      const input = document.createElement('input')
                                      input.type = 'text'
                                      input.value = currentValue
                                      input.className = 'text-xs font-medium text-slate text-right px-1.5 py-0.5 rounded border border-steel bg-white font-mono'
                                      input.onblur = () => {
                                        handleFieldEdit(field.id, input.value)
                                        e.currentTarget.textContent = input.value || field.value
                                      }
                                      input.onkeydown = (e: KeyboardEvent) => {
                                        if (e.key === 'Enter') {
                                          input.blur()
                                        } else if (e.key === 'Escape') {
                                          e.currentTarget.textContent = field.value
                                        }
                                      }
                                      e.currentTarget.replaceWith(input)
                                      input.focus()
                                      input.select()
                                    }}
                                  >
                                    {currentValue}
                                  </span>
                                  {field.confidence === 'low' && (
                                    <AlertCircle className="w-3 h-3 text-amber-500" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          
                          {category.flags && category.flags.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {category.flags.map((flag, idx) => (
                                <div key={idx} className={`flex items-start gap-2 p-2 rounded ${
                                  flag.type === 'high' ? 'bg-red-50' : 'bg-amber-50'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                    flag.type === 'high' ? 'bg-red-500' : 'bg-amber-500'
                                  }`} />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate">{flag.title}</p>
                                    <p className="text-xs text-neutral-600 leading-relaxed">{flag.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-neutral-200">
        <div className="text-xs text-neutral-500">
          <span className="font-semibold text-slate">{stats.total} of {stats.total}</span> fields extracted • 
          <span className="font-semibold text-slate"> {stats.flags}</span> compliance flags • 
          Last updated just now
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-neutral-300">
            Back to Upload
          </Button>
          <Button size="sm" className="bg-steel hover:bg-steel/90" onClick={handleContinue}>
            Confirm & generate schedule →
          </Button>
        </div>
      </div>
    </div>
  )
}

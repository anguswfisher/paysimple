import { PaymentItem } from '@/lib/services/payment-schedule'

export interface RetainageCalculationOptions {
  contractValue: number
  retainageRate: number
  paymentCount: number
  releasePoint: 'substantial_completion' | 'final_completion' | 'custom'
  customReleaseDate?: string
  projectDuration: number // in months
}

export interface RetainageCalculationResult {
  totalRetainage: number
  retainagePerPayment: number
  netAmountPerPayment: number
  finalRetainageRelease: number
  releaseDate: string
  cashFlowImpact: {
    monthlyReduction: number
    totalHeld: number
    releaseAmount: number
  }
}

/**
 * Calculate retainage for payment schedule
 */
export function calculateRetainage(options: RetainageCalculationOptions): RetainageCalculationResult {
  const {
    contractValue,
    retainageRate,
    paymentCount,
    releasePoint,
    customReleaseDate,
    projectDuration
  } = options
  
  // Calculate basic retainage metrics
  const totalRetainage = contractValue * (retainageRate / 100)
  const retainagePerPayment = totalRetainage / paymentCount
  const paymentAmount = contractValue / paymentCount
  const netAmountPerPayment = paymentAmount - retainagePerPayment
  
  // Calculate release date
  const releaseDate = calculateRetainageReleaseDate(
    new Date().toISOString().split('T')[0], // Use current date as start
    projectDuration,
    releasePoint,
    customReleaseDate
  )
  
  // Calculate cash flow impact
  const cashFlowImpact = {
    monthlyReduction: retainagePerPayment,
    totalHeld: totalRetainage,
    releaseAmount: totalRetainage
  }
  
  return {
    totalRetainage,
    retainagePerPayment,
    netAmountPerPayment,
    finalRetainageRelease: totalRetainage,
    releaseDate,
    cashFlowImpact
  }
}

/**
 * Calculate retainage for individual payment
 */
export function calculatePaymentRetainage(
  grossAmount: number,
  retainageRate: number
): { retainage: number; netAmount: number } {
  const retainage = grossAmount * (retainageRate / 100)
  const netAmount = grossAmount - retainage
  
  return { retainage, netAmount }
}

/**
 * Calculate retainage release schedule
 */
export function calculateRetainageReleaseSchedule(
  payments: PaymentItem[],
  releasePoint: 'substantial_completion' | 'final_completion' | 'custom',
  customReleaseDate?: string
): {
  releaseDate: string
  releaseAmount: number
  releasedPayments: string[]
} {
  // Filter for payments with retainage
  const retainagePayments = payments.filter(p => p.retainage_amount > 0)
  
  if (retainagePayments.length === 0) {
    return {
      releaseDate: '',
      releaseAmount: 0,
      releasedPayments: []
    }
  }
  
  // Calculate total retainage to be released
  const totalRetainage = retainagePayments.reduce((sum, p) => sum + p.retainage_amount, 0)
  
  // Calculate release date
  const projectStartDate = payments[0]?.due_date || new Date().toISOString().split('T')[0]
  const projectDuration = payments.length > 0 ? 12 : 12 // Default to 12 months
  
  const releaseDate = calculateRetainageReleaseDate(
    projectStartDate,
    projectDuration,
    releasePoint,
    customReleaseDate
  )
  
  return {
    releaseDate,
    releaseAmount: totalRetainage,
    releasedPayments: retainagePayments.map(p => p.id)
  }
}

/**
 * Optimize retainage strategy
 */
export function optimizeRetainageStrategy(
  contractValue: number,
  projectDuration: number,
  cashFlowNeeds: number[]
): {
  recommendedRate: number
  recommendedReleasePoint: 'substantial_completion' | 'final_completion' | 'custom'
  customReleaseDate?: string
  reasoning: string[]
  alternatives: Array<{
    rate: number
    releasePoint: 'substantial_completion' | 'final_completion' | 'custom'
    impact: string
  }>
} {
  const reasoning: string[] = []
  const alternatives: Array<{
    rate: number
    releasePoint: 'substantial_completion' | 'final_completion' | 'custom'
    impact: string
  }> = []
  
  // Analyze cash flow needs
  const maxCashFlowNeed = Math.max(...cashFlowNeeds)
  const avgCashFlowNeed = cashFlowNeeds.reduce((sum, need) => sum + need, 0) / cashFlowNeeds.length
  
  // Recommended rate based on cash flow needs
  let recommendedRate = 5 // Default 5%
  
  if (maxCashFlowNeed > contractValue * 0.1) {
    recommendedRate = 3
    reasoning.push('High cash flow needs detected - recommend lower retainage rate')
  } else if (avgCashFlowNeed < contractValue * 0.05) {
    recommendedRate = 10
    reasoning.push('Low cash flow needs - can afford higher retainage rate')
  } else {
    reasoning.push('Moderate cash flow needs - standard retainage rate recommended')
  }
  
  // Recommended release point
  let recommendedReleasePoint: 'substantial_completion' | 'final_completion' | 'custom' = 'substantial_completion'
  
  if (projectDuration > 24) {
    recommendedReleasePoint = 'final_completion'
    reasoning.push('Long project duration - recommend final completion release')
  } else if (projectDuration < 6) {
    recommendedReleasePoint = 'substantial_completion'
    reasoning.push('Short project duration - substantial completion release appropriate')
  }
  
  // Generate alternatives
  alternatives.push(
    {
      rate: 3,
      releasePoint: 'substantial_completion',
      impact: 'Lower monthly cash flow impact, earlier retainage release'
    },
    {
      rate: 10,
      releasePoint: 'final_completion',
      impact: 'Higher owner protection, later cash flow return'
    },
    {
      rate: 5,
      releasePoint: 'custom',
      impact: 'Flexible release timing, can be negotiated per project needs'
    }
  )
  
  return {
    recommendedRate,
    recommendedReleasePoint,
    reasoning,
    alternatives
  }
}

/**
 * Calculate retainage cash flow projection
 */
export function calculateRetainageCashFlow(
  payments: PaymentItem[],
  projectStartDate: string
): Array<{
    month: number
    date: string
    retainageHeld: number
    retainageReleased: number
    netRetainageImpact: number
    cumulativeRetainage: number
  }> {
  const cashFlow: Array<{
    month: number
    date: string
    retainageHeld: number
    retainageReleased: number
    netRetainageImpact: number
    cumulativeRetainage: number
  }> = []
  
  let cumulativeRetainage = 0
  
  payments.forEach((payment, index) => {
    const month = index + 1
    const retainageHeld = payment.retainage_amount
    const retainageReleased = payment.retainage_amount < 0 ? Math.abs(payment.retainage_amount) : 0
    const netRetainageImpact = retainageHeld - retainageReleased
    
    cumulativeRetainage += netRetainageImpact
    
    cashFlow.push({
      month,
      date: payment.due_date,
      retainageHeld,
      retainageReleased,
      netRetainageImpact,
      cumulativeRetainage
    })
  })
  
  return cashFlow
}

/**
 * Validate retainage calculations
 */
export function validateRetainageCalculations(
  payments: PaymentItem[],
  expectedRetainageRate: number
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check retainage rates consistency
  const retainageRates = payments
    .filter(p => p.id !== 'retainage-release' && p.gross_amount > 0)
    .map(p => (p.retainage_amount / p.gross_amount) * 100)
  
  if (retainageRates.length > 0) {
    const avgRate = retainageRates.reduce((sum, rate) => sum + rate, 0) / retainageRates.length
    const rateVariance = Math.max(...retainageRates) - Math.min(...retainageRates)
    
    if (Math.abs(avgRate - expectedRetainageRate) > 0.5) {
      errors.push(`Average retainage rate (${avgRate.toFixed(2)}%) differs from expected (${expectedRetainageRate}%)`)
    }
    
    if (rateVariance > 1) {
      warnings.push(`High variance in retainage rates (${rateVariance.toFixed(2)}%)`)
    }
  }
  
  // Check for negative retainage in regular payments
  const negativeRetainagePayments = payments.filter(p => p.id !== 'retainage-release' && p.retainage_amount < 0)
  if (negativeRetainagePayments.length > 0) {
    errors.push(`${negativeRetainagePayments.length} payments have negative retainage (excluding retainage release)`)
  }
  
  // Check retainage release calculation
  const retainageRelease = payments.find(p => p.id === 'retainage-release')
  if (retainageRelease) {
    const totalRetainageHeld = payments
      .filter(p => p.id !== 'retainage-release')
      .reduce((sum, p) => sum + p.retainage_amount, 0)
    
    if (Math.abs(retainageRelease.retainage_amount + totalRetainageHeld) > 0.01) {
      warnings.push('Retainage release amount does not match total retainage held')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Calculate retainage release date
 */
function calculateRetainageReleaseDate(
  startDate: string,
  projectDuration: number,
  releasePoint: 'substantial_completion' | 'final_completion' | 'custom',
  customReleaseDate?: string
): string {
  const start = new Date(startDate)
  
  switch (releasePoint) {
    case 'substantial_completion':
      // 90% of project duration
      start.setMonth(start.getMonth() + Math.floor(projectDuration * 0.9))
      break
    case 'final_completion':
      // 100% of project duration + 30 days
      start.setMonth(start.getMonth() + Math.floor(projectDuration) + 1)
      break
    case 'custom':
      if (customReleaseDate) {
        return customReleaseDate
      }
      break
    default:
      start.setMonth(start.getMonth() + Math.floor(projectDuration) + 1)
  }
  
  return start.toISOString().split('T')[0]
}

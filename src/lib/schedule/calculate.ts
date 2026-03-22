import { PaymentItem, ScheduleSettings } from '@/lib/services/payment-schedule'

export interface ScheduleCalculationOptions {
  contractValue: number
  startDate: string
  projectDuration: number // in months
  settings: ScheduleSettings
}

export interface ScheduleCalculationResult {
  payments: PaymentItem[]
  summary: {
    totalContractSum: number
    totalRetainage: number
    totalNetPayments: number
    averagePayment: number
    finalRetainageRelease: number
  }
  calculations: {
    monthlyPayment: number
    retainagePerPayment: number
    netPaymentPerPayment: number
    paymentCount: number
  }
}

/**
 * Calculate payment schedule based on contract terms
 */
export function calculatePaymentSchedule(options: ScheduleCalculationOptions): ScheduleCalculationResult {
  const { contractValue, startDate, projectDuration, settings } = options
  
  // Calculate basic payment metrics
  const paymentCount = calculatePaymentCount(settings, projectDuration)
  const monthlyPayment = contractValue / paymentCount
  const retainagePerPayment = monthlyPayment * (settings.retainage_rate / 100)
  const netPaymentPerPayment = monthlyPayment - retainagePerPayment
  
  // Generate payment items
  const payments = generatePaymentItems({
    contractValue,
    startDate,
    projectDuration,
    settings,
    paymentCount,
    monthlyPayment,
    retainagePerPayment,
    netPaymentPerPayment
  })
  
  // Calculate summary
  const totalContractSum = payments.reduce((sum, p) => sum + p.gross_amount, 0)
  const totalRetainage = Math.abs(payments.reduce((sum, p) => sum + p.retainage_amount, 0))
  const totalNetPayments = payments.reduce((sum, p) => sum + p.net_amount, 0)
  const averagePayment = totalContractSum / paymentCount
  const finalRetainageRelease = payments.find(p => p.retainage_amount < 0)?.net_amount || 0
  
  return {
    payments,
    summary: {
      totalContractSum,
      totalRetainage,
      totalNetPayments,
      averagePayment,
      finalRetainageRelease
    },
    calculations: {
      monthlyPayment,
      retainagePerPayment,
      netPaymentPerPayment,
      paymentCount
    }
  }
}

/**
 * Calculate retainage for a given amount
 */
export function calculateRetainage(amount: number, rate: number): { retainage: number; netAmount: number } {
  const retainage = amount * (rate / 100)
  const netAmount = amount - retainage
  
  return { retainage, netAmount }
}

/**
 * Calculate payment count based on frequency
 */
function calculatePaymentCount(settings: ScheduleSettings, duration: number): number {
  switch (settings.payment_frequency) {
    case 'monthly':
      return Math.floor(duration)
    case 'bi_monthly':
      return Math.floor(duration / 2)
    case 'milestone':
      return settings.custom_payment_intervals || 5
    case 'custom':
      return settings.custom_payment_intervals || 12
    default:
      return 12
  }
}

/**
 * Generate payment items
 */
function generatePaymentItems(params: {
  contractValue: number
  startDate: string
  projectDuration: number
  settings: ScheduleSettings
  paymentCount: number
  monthlyPayment: number
  retainagePerPayment: number
  netPaymentPerPayment: number
}): PaymentItem[] {
  const {
    contractValue,
    startDate,
    projectDuration,
    settings,
    paymentCount,
    monthlyPayment,
    retainagePerPayment,
    netPaymentPerPayment
  } = params
  
  const payments: PaymentItem[] = []
  const paymentInterval = projectDuration / paymentCount
  
  for (let i = 0; i < paymentCount; i++) {
    const dueDate = calculateDueDate(startDate, i * paymentInterval)
    
    payments.push({
      id: `payment-${i + 1}`,
      payment_number: (i + 1).toString(),
      description: generatePaymentDescription(i + 1, settings),
      due_date: dueDate,
      gross_amount: monthlyPayment,
      retainage_amount: retainagePerPayment,
      net_amount: netPaymentPerPayment,
      status: 'pending'
    })
  }
  
  // Add retainage release if applicable
  if (settings.retainage_rate > 0) {
    const retainageReleaseDate = calculateRetainageReleaseDate(startDate, projectDuration, settings)
    const totalRetainage = retainagePerPayment * paymentCount
    
    payments.push({
      id: 'retainage-release',
      payment_number: 'Final',
      description: 'Retainage Release',
      due_date: retainageReleaseDate,
      gross_amount: 0,
      retainage_amount: -totalRetainage,
      net_amount: totalRetainage,
      status: 'pending'
    })
  }
  
  return payments
}

/**
 * Calculate due date for payment
 */
function calculateDueDate(startDate: string, monthsToAdd: number): string {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + Math.floor(monthsToAdd))
  return date.toISOString().split('T')[0]
}

/**
 * Generate payment description
 */
function generatePaymentDescription(paymentNumber: number, settings: ScheduleSettings): string {
  switch (settings.payment_frequency) {
    case 'monthly':
      return `Monthly Progress Payment - ${paymentNumber}`
    case 'bi_monthly':
      return `Bi-Monthly Progress Payment - ${paymentNumber}`
    case 'milestone':
      return `Milestone Payment - ${paymentNumber}`
    case 'custom':
      return `Progress Payment - ${paymentNumber}`
    default:
      return `Progress Payment - ${paymentNumber}`
  }
}

/**
 * Calculate retainage release date
 */
function calculateRetainageReleaseDate(
  startDate: string,
  projectDuration: number,
  settings: ScheduleSettings
): string {
  const start = new Date(startDate)
  
  switch (settings.retainage_release_point) {
    case 'substantial_completion':
      // 90% of project duration
      start.setMonth(start.getMonth() + Math.floor(projectDuration * 0.9))
      break
    case 'final_completion':
      // 100% of project duration + 30 days
      start.setMonth(start.getMonth() + Math.floor(projectDuration) + 1)
      break
    case 'custom':
      if (settings.retainage_release_date) {
        return settings.retainage_release_date
      }
      break
    default:
      start.setMonth(start.getMonth() + Math.floor(projectDuration) + 1)
  }
  
  return start.toISOString().split('T')[0]
}

/**
 * Calculate schedule adjustments for change orders
 */
export function calculateChangeOrderImpact(
  currentSchedule: PaymentItem[],
  changeOrderAmount: number,
  changeOrderDescription: string
): PaymentItem[] {
  if (currentSchedule.length === 0) return currentSchedule
  
  // Calculate how to distribute the change order amount
  const regularPayments = currentSchedule.filter(p => p.id !== 'retainage-release')
  const retainageRelease = currentSchedule.find(p => p.id === 'retainage-release')
  
  if (regularPayments.length === 0) return currentSchedule
  
  const amountPerPayment = changeOrderAmount / regularPayments.length
  const retainageRate = regularPayments[0]?.retainage_amount / regularPayments[0]?.gross_amount || 0
  
  // Update regular payments
  const updatedPayments = regularPayments.map((payment, index) => {
    const newGrossAmount = payment.gross_amount + amountPerPayment
    const newRetainageAmount = newGrossAmount * retainageRate
    const newNetAmount = newGrossAmount - newRetainageAmount
    
    return {
      ...payment,
      gross_amount: newGrossAmount,
      retainage_amount: newRetainageAmount,
      net_amount: newNetAmount,
      description: index === 0 
        ? `${payment.description} (${changeOrderDescription})`
        : payment.description
    }
  })
  
  // Update retainage release if it exists
  if (retainageRelease) {
    const newTotalRetainage = updatedPayments.reduce((sum, p) => sum + p.retainage_amount, 0)
    const updatedRetainageRelease = {
      ...retainageRelease,
      retainage_amount: -newTotalRetainage,
      net_amount: newTotalRetainage
    }
    
    return [...updatedPayments, updatedRetainageRelease]
  }
  
  return updatedPayments
}

/**
 * Validate payment schedule
 */
export function validatePaymentSchedule(schedule: PaymentItem[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check for duplicate payment numbers
  const paymentNumbers = schedule.map(p => p.payment_number)
  const duplicates = paymentNumbers.filter((num, index) => paymentNumbers.indexOf(num) !== index)
  if (duplicates.length > 0) {
    errors.push(`Duplicate payment numbers: ${duplicates.join(', ')}`)
  }
  
  // Check for negative amounts (except retainage release)
  const negativePayments = schedule.filter(p => p.gross_amount < 0 && p.id !== 'retainage-release')
  if (negativePayments.length > 0) {
    errors.push('Negative gross amounts found (excluding retainage release)')
  }
  
  // Check for due dates in the past
  const today = new Date().toISOString().split('T')[0]
  const pastDueDates = schedule.filter(p => p.due_date < today && p.status !== 'paid')
  if (pastDueDates.length > 0) {
    warnings.push(`${pastDueDates.length} payments have due dates in the past`)
  }
  
  // Check retainage consistency
  const retainageRates = schedule
    .filter(p => p.id !== 'retainage-release' && p.gross_amount > 0)
    .map(p => p.retainage_amount / p.gross_amount)
  
  if (retainageRates.length > 0) {
    const uniqueRates = [...new Set(retainageRates.map(r => Math.round(r * 100)))]
    if (uniqueRates.length > 1) {
      warnings.push('Inconsistent retainage rates across payments')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

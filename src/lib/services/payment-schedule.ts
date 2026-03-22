import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type PaymentScheduleRow = Database['public']['Tables']['payment_schedules']['Row']
type PaymentScheduleInsert = Database['public']['Tables']['payment_schedules']['Insert']
type PaymentScheduleUpdate = Database['public']['Tables']['payment_schedules']['Update']

export interface PaymentSchedule extends Omit<PaymentScheduleRow, 'schedule_data'> {
  schedule_data: PaymentScheduleData
}

export interface PaymentScheduleData {
  payments: PaymentItem[]
  settings: ScheduleSettings
  calculations: ScheduleCalculations
}

export interface PaymentItem {
  id: string
  payment_number: string
  description: string
  due_date: string
  gross_amount: number
  retainage_amount: number
  net_amount: number
  status: 'pending' | 'paid' | 'overdue'
  paid_date?: string
  notes?: string
}

export interface ScheduleSettings {
  retainage_rate: number
  retainage_release_point: 'substantial_completion' | 'final_completion' | 'custom'
  retainage_release_date?: string
  payment_frequency: 'monthly' | 'bi_monthly' | 'milestone' | 'custom'
  custom_payment_intervals?: number
}

export interface ScheduleCalculations {
  total_contract_sum: number
  total_retainage: number
  total_net_payments: number
  paid_amount: number
  pending_amount: number
  retainage_released: number
  progress_percentage: number
}

export class PaymentScheduleService {
  async getPaymentSchedule(projectId: string): Promise<PaymentSchedule | null> {
    try {
      const { data, error } = await (supabase
        .from('payment_schedules') as any)
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .single()

      if (error) throw error
      if (!data) return null

      return {
        ...data,
        schedule_data: data.schedule_data as PaymentScheduleData
      }
    } catch (error) {
      console.error('Error fetching payment schedule:', error)
      throw new Error('Failed to fetch payment schedule')
    }
  }

  async createPaymentSchedule(
    projectId: string,
    scheduleData: PaymentScheduleData
  ): Promise<PaymentSchedule> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not authenticated')

      const calculations = this.calculateScheduleTotals(scheduleData.payments, scheduleData.settings)

      const newSchedule: PaymentScheduleInsert = {
        project_id: projectId,
        version: 1,
        schedule_data: scheduleData as any,
        total_contract_sum: calculations.total_contract_sum.toString(),
        total_retainage: calculations.total_retainage.toString(),
        is_active: true
      }

      const { data, error } = await (supabase
        .from('payment_schedules') as any)
        .insert(newSchedule)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create payment schedule')

      return {
        ...data,
        schedule_data: data.schedule_data as PaymentScheduleData
      }
    } catch (error) {
      console.error('Error creating payment schedule:', error)
      throw new Error('Failed to create payment schedule')
    }
  }

  async updatePaymentSchedule(
    scheduleId: string,
    updates: Partial<PaymentScheduleData>
  ): Promise<PaymentSchedule> {
    try {
      // Get current schedule
      const currentSchedule = await this.getPaymentScheduleById(scheduleId)
      if (!currentSchedule) throw new Error('Payment schedule not found')

      // Merge updates
      const updatedData: PaymentScheduleData = {
        ...currentSchedule.schedule_data,
        ...updates
      }

      // Recalculate totals if payments changed
      if (updates.payments) {
        const calculations = this.calculateScheduleTotals(
          updatedData.payments,
          updatedData.settings
        )

        const { data, error } = await (supabase
          .from('payment_schedules') as any)
          .update({
            schedule_data: updatedData as any,
            total_contract_sum: calculations.total_contract_sum.toString(),
            total_retainage: calculations.total_retainage.toString(),
            version: currentSchedule.version + 1
          })
          .eq('id', scheduleId)
          .select()
          .single()

        if (error) throw error
        if (!data) throw new Error('Failed to update payment schedule')

        return {
          ...data,
          schedule_data: data.schedule_data as PaymentScheduleData
        }
      } else {
        const { data, error } = await (supabase
          .from('payment_schedules') as any)
          .update({
            schedule_data: updatedData as any,
            version: currentSchedule.version + 1
          })
          .eq('id', scheduleId)
          .select()
          .single()

        if (error) throw error
        if (!data) throw new Error('Failed to update payment schedule')

        return {
          ...data,
          schedule_data: data.schedule_data as PaymentScheduleData
        }
      }
    } catch (error) {
      console.error('Error updating payment schedule:', error)
      throw new Error('Failed to update payment schedule')
    }
  }

  async deletePaymentSchedule(scheduleId: string): Promise<void> {
    try {
      const { error } = await (supabase
        .from('payment_schedules') as any)
        .update({ is_active: false })
        .eq('id', scheduleId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting payment schedule:', error)
      throw new Error('Failed to delete payment schedule')
    }
  }

  async updatePaymentStatus(
    scheduleId: string,
    paymentId: string,
    status: PaymentItem['status'],
    paidDate?: string
  ): Promise<PaymentSchedule> {
    try {
      const schedule = await this.getPaymentScheduleById(scheduleId)
      if (!schedule) throw new Error('Payment schedule not found')

      const updatedPayments = schedule.schedule_data.payments.map(payment =>
        payment.id === paymentId
          ? { ...payment, status, paid_date: paidDate }
          : payment
      )

      return await this.updatePaymentSchedule(scheduleId, {
        payments: updatedPayments
      })
    } catch (error) {
      console.error('Error updating payment status:', error)
      throw new Error('Failed to update payment status')
    }
  }

  private async getPaymentScheduleById(scheduleId: string): Promise<PaymentSchedule | null> {
    const { data, error } = await (supabase
      .from('payment_schedules') as any)
      .select('*')
      .eq('id', scheduleId)
      .single()

    if (error) return null
    if (!data) return null

    return {
      ...data,
      schedule_data: data.schedule_data as PaymentScheduleData
    }
  }

  calculateScheduleTotals(
    payments: PaymentItem[],
    settings: ScheduleSettings
  ): ScheduleCalculations {
    const totalContractSum = payments.reduce((sum, payment) => sum + payment.gross_amount, 0)
    const totalRetainage = payments.reduce((sum, payment) => sum + payment.retainage_amount, 0)
    const totalNetPayments = payments.reduce((sum, payment) => sum + payment.net_amount, 0)
    
    const paidAmount = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + payment.net_amount, 0)
    
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.net_amount, 0)

    const retainageReleased = payments
      .filter(p => p.status === 'paid' && p.retainage_amount < 0)
      .reduce((sum, payment) => sum + Math.abs(payment.retainage_amount), 0)

    const progressPercentage = totalContractSum > 0 
      ? (paidAmount / totalContractSum) * 100 
      : 0

    return {
      total_contract_sum: totalContractSum,
      total_retainage: totalRetainage,
      total_net_payments: totalNetPayments,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      retainage_released: retainageReleased,
      progress_percentage: progressPercentage
    }
  }

  generateDefaultSchedule(
    contractValue: number,
    settings: ScheduleSettings,
    startDate: string,
    projectDuration: number
  ): PaymentItem[] {
    const payments: PaymentItem[] = []
    const paymentCount = this.calculatePaymentCount(settings, projectDuration)
    const paymentInterval = projectDuration / paymentCount
    const retainageRate = settings.retainage_rate / 100

    for (let i = 0; i < paymentCount; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + Math.floor(i * paymentInterval))
      
      const grossAmount = contractValue / paymentCount
      const retainageAmount = grossAmount * retainageRate
      const netAmount = grossAmount - retainageAmount

      payments.push({
        id: `payment-${i + 1}`,
        payment_number: (i + 1).toString(),
        description: this.generatePaymentDescription(i + 1, settings),
        due_date: dueDate.toISOString().split('T')[0],
        gross_amount: grossAmount,
        retainage_amount: retainageAmount,
        net_amount: netAmount,
        status: 'pending'
      })
    }

    // Add retainage release if applicable
    if (settings.retainage_rate > 0) {
      const releaseDate = this.calculateRetainageReleaseDate(startDate, projectDuration, settings)
      const totalRetainage = payments.reduce((sum, p) => sum + p.retainage_amount, 0)

      payments.push({
        id: 'retainage-release',
        payment_number: 'Final',
        description: 'Retainage Release',
        due_date: releaseDate,
        gross_amount: 0,
        retainage_amount: -totalRetainage,
        net_amount: totalRetainage,
        status: 'pending'
      })
    }

    return payments
  }

  private calculatePaymentCount(settings: ScheduleSettings, duration: number): number {
    switch (settings.payment_frequency) {
      case 'monthly':
        return Math.floor(duration)
      case 'bi_monthly':
        return Math.floor(duration / 2)
      case 'milestone':
        return 5 // Default milestone count
      case 'custom':
        return settings.custom_payment_intervals || 12
      default:
        return 12
    }
  }

  private generatePaymentDescription(paymentNumber: number, settings: ScheduleSettings): string {
    switch (settings.payment_frequency) {
      case 'monthly':
        return `Monthly Progress Payment - ${paymentNumber}`
      case 'bi_monthly':
        return `Bi-Monthly Progress Payment - ${paymentNumber}`
      case 'milestone':
        return `Milestone Payment - ${paymentNumber}`
      default:
        return `Progress Payment - ${paymentNumber}`
    }
  }

  private calculateRetainageReleaseDate(
    startDate: string,
    duration: number,
    settings: ScheduleSettings
  ): string {
    const start = new Date(startDate)
    
    switch (settings.retainage_release_point) {
      case 'substantial_completion':
        // 90% of project duration
        start.setMonth(start.getMonth() + Math.floor(duration * 0.9))
        break
      case 'final_completion':
        // 100% of project duration + 30 days
        start.setMonth(start.getMonth() + Math.floor(duration) + 1)
        break
      case 'custom':
        if (settings.retainage_release_date) {
          return settings.retainage_release_date
        }
        break
      default:
        start.setMonth(start.getMonth() + Math.floor(duration) + 1)
    }

    return start.toISOString().split('T')[0]
  }
}

export const paymentScheduleService = new PaymentScheduleService()

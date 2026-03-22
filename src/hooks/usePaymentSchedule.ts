'use client'

import { useState, useEffect } from 'react'
import { paymentScheduleService, PaymentSchedule, PaymentScheduleData, PaymentItem } from '@/lib/services/payment-schedule'

export function usePaymentSchedule(projectId: string) {
  const [schedule, setSchedule] = useState<PaymentSchedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = async () => {
    if (!projectId) return

    setLoading(true)
    setError(null)

    try {
      const data = await paymentScheduleService.getPaymentSchedule(projectId)
      setSchedule(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment schedule')
    } finally {
      setLoading(false)
    }
  }

  const createSchedule = async (scheduleData: PaymentScheduleData) => {
    if (!projectId) throw new Error('Project ID is required')

    setLoading(true)
    setError(null)

    try {
      const newSchedule = await paymentScheduleService.createPaymentSchedule(projectId, scheduleData)
      setSchedule(newSchedule)
      return newSchedule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment schedule')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSchedule = async (updates: Partial<PaymentScheduleData>) => {
    if (!schedule) throw new Error('No schedule found')

    setLoading(true)
    setError(null)

    try {
      const updatedSchedule = await paymentScheduleService.updatePaymentSchedule(schedule.id, updates)
      setSchedule(updatedSchedule)
      return updatedSchedule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment schedule')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteSchedule = async () => {
    if (!schedule) throw new Error('No schedule found')

    setLoading(true)
    setError(null)

    try {
      await paymentScheduleService.deletePaymentSchedule(schedule.id)
      setSchedule(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment schedule')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (paymentId: string, status: PaymentItem['status'], paidDate?: string) => {
    if (!schedule) throw new Error('No schedule found')

    setLoading(true)
    setError(null)

    try {
      const updatedSchedule = await paymentScheduleService.updatePaymentStatus(schedule.id, paymentId, status, paidDate)
      setSchedule(updatedSchedule)
      return updatedSchedule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addPayment = async (payment: Omit<PaymentItem, 'id'>) => {
    if (!schedule) throw new Error('No schedule found')

    const newPayment: PaymentItem = {
      ...payment,
      id: `payment-${Date.now()}`
    }

    const updatedPayments = [...schedule.schedule_data.payments, newPayment]
    return await updateSchedule({ payments: updatedPayments })
  }

  const updatePayment = async (paymentId: string, updates: Partial<PaymentItem>) => {
    if (!schedule) throw new Error('No schedule found')

    const updatedPayments = schedule.schedule_data.payments.map(payment =>
      payment.id === paymentId ? { ...payment, ...updates } : payment
    )

    return await updateSchedule({ payments: updatedPayments })
  }

  const removePayment = async (paymentId: string) => {
    if (!schedule) throw new Error('No schedule found')

    const updatedPayments = schedule.schedule_data.payments.filter(payment => payment.id !== paymentId)
    return await updateSchedule({ payments: updatedPayments })
  }

  const generateDefaultSchedule = async (
    contractValue: number,
    settings: PaymentScheduleData['settings'],
    startDate: string,
    projectDuration: number
  ) => {
    const payments = paymentScheduleService.generateDefaultSchedule(
      contractValue,
      settings,
      startDate,
      projectDuration
    )

    const calculations = paymentScheduleService.calculateScheduleTotals(payments, settings)

    const scheduleData: PaymentScheduleData = {
      payments,
      settings,
      calculations
    }

    return await createSchedule(scheduleData)
  }

  useEffect(() => {
    fetchSchedule()
  }, [projectId])

  return {
    schedule,
    loading,
    error,
    refetch: fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    updatePaymentStatus,
    addPayment,
    updatePayment,
    removePayment,
    generateDefaultSchedule
  }
}

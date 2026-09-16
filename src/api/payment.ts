import { requestJson } from './http'
import type { PaymentRecord } from '@/types/user'

export const payAppointment = (appointmentId: number) => requestJson<PaymentRecord>(`/api/patient/appointments/${appointmentId}/pay`, { method: 'POST' })
export const getPayment = (id: number) => requestJson<PaymentRecord>(`/api/patient/payments/${id}`, { method: 'GET' })
export const getAppointmentPayment = (appointmentId: number) => requestJson<PaymentRecord>(`/api/patient/appointments/${appointmentId}/payment`, { method: 'GET' })
export const getPatientPayments = (page = 1, page_size = 20) => requestJson<{ page: number; page_size: number; total: number; items: PaymentRecord[] }>(`/api/patient/payments?page=${page}&page_size=${page_size}`, { method: 'GET' })
export const refundPayment = (id: number) => requestJson<null>(`/api/patient/payments/${id}/refund`, { method: 'POST' })
export const adminRefundPayment = (id: number) => requestJson<null>(`/api/admin/payments/${id}/refund`, { method: 'POST' })

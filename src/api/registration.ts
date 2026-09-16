import { requestJson } from './http'
import type { AppointmentRecord } from '@/types/user'

export const getRegistrationAppointments = () => requestJson<AppointmentRecord[]>('/api/registration/appointments', { method: 'GET' })
export const getRegistrationAppointmentsPage = (page = 1, page_size = 20, status?: number) => requestJson<{ page: number; page_size: number; total: number; items: AppointmentRecord[] }>(`/api/registration/appointments/page?page=${page}&page_size=${page_size}${status === undefined ? '' : `&status=${status}`}`, { method: 'GET' })

export const getRegistrationQueue = () => requestJson<AppointmentRecord[]>('/api/registration/queue', { method: 'GET' })

export const checkInAppointment = (id: number) => requestJson<null>(`/api/registration/appointments/${id}/check-in`, { method: 'POST' })

export const cancelAppointment = (id: number, reason?: string) => requestJson<null>(`/api/registration/appointments/${id}/cancel`, { method: 'POST', body: JSON.stringify(reason ? { reason } : {}) })

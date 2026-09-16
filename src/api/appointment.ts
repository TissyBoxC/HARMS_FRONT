import { requestJson } from './http'
import type { AppointmentRecord } from '@/types/user'

export interface CreateAppointmentRequest { schedule_id: number; slot_id?: number | null; request_no?: string; remark?: string }
export const createAppointment = (payload: CreateAppointmentRequest) => requestJson<AppointmentRecord>('/api/patient/appointments', { method: 'POST', body: JSON.stringify(payload) })
export const getPatientAppointments = () => requestJson<AppointmentRecord[]>('/api/patient/appointments', { method: 'GET' })
export const getPatientAppointmentsPage = (page = 1, page_size = 20, status?: number) => requestJson<{ page: number; page_size: number; total: number; items: AppointmentRecord[] }>(`/api/patient/appointments/page?page=${page}&page_size=${page_size}${status === undefined ? '' : `&status=${status}`}`, { method: 'GET' })
export const getPatientAppointment = (id: number) => requestJson<AppointmentRecord>(`/api/patient/appointments/${id}`, { method: 'GET' })
export const cancelPatientAppointment = (id: number, reason?: string) => requestJson<null>(`/api/patient/appointments/${id}/cancel`, { method: 'POST', body: JSON.stringify(reason ? { reason } : {}) })
export const checkInPatientAppointment = (id: number) => requestJson<null>(`/api/patient/appointments/${id}/check-in`, { method: 'POST' })

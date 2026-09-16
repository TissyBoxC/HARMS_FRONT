import { requestJson } from './http'
import type { AppointmentRecord } from '@/types/user'

export const getAdminAppointments = () => requestJson<AppointmentRecord[]>('/api/admin/appointments', { method: 'GET' })
export const getAdminAppointmentsPage = (page = 1, page_size = 20, status?: number) => requestJson<{ page: number; page_size: number; total: number; items: AppointmentRecord[] }>(`/api/admin/appointments/page?page=${page}&page_size=${page_size}${status === undefined ? '' : `&status=${status}`}`, { method: 'GET' })
export const getAdminAppointment = (id: number) => requestJson<AppointmentRecord>(`/api/admin/appointments/${id}`, { method: 'GET' })

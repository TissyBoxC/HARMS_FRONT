import { requestJson } from './http'
import type { PublicDoctor, PublicSchedule, PublicSlot } from '@/types/user'

const query = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== '') search.set(key, String(value)) })
  return search.toString()
}

export const getPublicDoctors = (params: { department_id?: number; keyword?: string } = {}) => requestJson<PublicDoctor[]>(`/api/public/doctors${query(params) ? `?${query(params)}` : ''}`, { method: 'GET' })

export const getPublicDoctor = (id: number) => requestJson<PublicDoctor>(`/api/public/doctors/${id}`, { method: 'GET' })

export const getDepartmentDoctors = (departmentId: number) => requestJson<PublicDoctor[]>(`/api/public/departments/${departmentId}/doctors`, { method: 'GET' })

export const getPublicSchedules = (params: { department_id?: number; doctor_id?: number; schedule_date?: string; period?: number } = {}) => requestJson<PublicSchedule[]>(`/api/public/schedules${query(params) ? `?${query(params)}` : ''}`, { method: 'GET' })
export const getPublicSchedulesPage = (params: { page?: number; page_size?: number; department_id?: number; doctor_id?: number; schedule_date?: string; period?: number } = {}) => requestJson<{ page: number; page_size: number; total: number; items: PublicSchedule[] }>(`/api/public/schedules/page${query(params) ? `?${query(params)}` : ''}`, { method: 'GET' })

export const getPublicSchedule = (id: number) => requestJson<PublicSchedule>(`/api/public/schedules/${id}`, { method: 'GET' })

export const getPublicScheduleSlots = (id: number) => requestJson<PublicSlot[]>(`/api/public/schedules/${id}/slots`, { method: 'GET' })

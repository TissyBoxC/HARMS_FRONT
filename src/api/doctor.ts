import { requestJson } from './http'
import type { DoctorProfile, DoctorProfileUpdateRequest, Schedule, Slot } from '@/types/user'

/**
 * 医生工作台接口
 *
 * 包含医生个人资料、个人排班、时间段和停诊操作。
 */
export const getDoctorProfile = () => requestJson<DoctorProfile>('/api/doctor/profile', { method: 'GET' })

export const updateDoctorProfile = (payload: DoctorProfileUpdateRequest) =>
  requestJson<DoctorProfile>('/api/doctor/profile', { method: 'PUT', body: JSON.stringify(payload) })

export const getDoctorSchedules = () => requestJson<Schedule[]>('/api/doctor/schedules', { method: 'GET' })

export const getDoctorSchedule = (scheduleId: number) => requestJson<Schedule>(`/api/doctor/schedules/${scheduleId}`, { method: 'GET' })

export const getDoctorSlots = (scheduleId: number) => requestJson<Slot[]>(`/api/doctor/schedules/${scheduleId}/slots`, { method: 'GET' })

export const stopDoctorSchedule = (id: number, reason?: string) =>
  requestJson<Schedule>(`/api/doctor/schedules/${id}/stop`, {
    method: 'POST',
    body: JSON.stringify(reason ? { reason } : {}),
  })

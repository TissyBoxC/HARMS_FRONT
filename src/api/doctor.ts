import { requestJson } from './http'
import type { DoctorProfile, DoctorProfileUpdateRequest, Schedule, ScheduleRequest, Slot, SlotRequest } from '@/types/user'

export const getDoctorProfile = () => requestJson<DoctorProfile>('/api/doctor/profile', { method: 'GET' })

export const updateDoctorProfile = (payload: DoctorProfileUpdateRequest) =>
  requestJson<DoctorProfile>('/api/doctor/profile', { method: 'PUT', body: JSON.stringify(payload) })

export const getDoctorSchedules = () => requestJson<Schedule[]>('/api/doctor/schedules', { method: 'GET' })

export const getDoctorSchedule = (scheduleId: number) => requestJson<Schedule>(`/api/doctor/schedules/${scheduleId}`, { method: 'GET' })

export const createDoctorSchedule = (payload: ScheduleRequest) =>
  requestJson<Schedule>('/api/doctor/schedules', { method: 'POST', body: JSON.stringify(payload) })

export const updateDoctorSchedule = (id: number, payload: ScheduleRequest) =>
  requestJson<Schedule>(`/api/doctor/schedules/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

export const deleteDoctorSchedule = (id: number) => requestJson<null>(`/api/doctor/schedules/${id}`, { method: 'DELETE' })

export const getDoctorSlots = (scheduleId: number) => requestJson<Slot[]>(`/api/doctor/schedules/${scheduleId}/slots`, { method: 'GET' })

export const createDoctorSlot = (scheduleId: number, payload: SlotRequest) =>
  requestJson<Slot>(`/api/doctor/schedules/${scheduleId}/slots`, { method: 'POST', body: JSON.stringify(payload) })

export const updateDoctorSlotStatus = (slotId: number, status: number) =>
  requestJson<null>(`/api/doctor/slots/${slotId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

export const stopDoctorSchedule = (id: number, reason?: string) =>
  requestJson<Schedule>(`/api/doctor/schedules/${id}/stop`, { method: 'POST', body: JSON.stringify(reason ? { reason } : {}) })
export const updateDoctorSlot = (slotId: number, payload: SlotRequest) => requestJson<Slot>(`/api/doctor/slots/${slotId}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteDoctorSlot = (slotId: number) => requestJson<null>(`/api/doctor/slots/${slotId}`, { method: 'DELETE' })

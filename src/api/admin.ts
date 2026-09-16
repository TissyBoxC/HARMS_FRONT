import { requestJson } from './http'
import type { AdminCreateAccountResult, AdminCreateDoctorRequest, AdminCreatePatientRequest, AdminCreateRegistrationRequest, AdminDoctorUpdateRequest, AdminPatientUpdateRequest, AdminUserSummary, DoctorProfile, PatientProfile, Schedule, ScheduleRequest, Slot, SlotRequest } from '@/types/user'

export const getAdminUsers = () => requestJson<AdminUserSummary[]>('/api/admin/users', { method: 'GET' })

export const getAdminUser = (userId: number) => requestJson<AdminUserSummary>(`/api/admin/users/${userId}`, { method: 'GET' })

export const getAdminPatient = (patientId: number) => requestJson<PatientProfile>(`/api/admin/patients/${patientId}`, { method: 'GET' })

export const getAdminDoctor = (doctorId: number) => requestJson<DoctorProfile>(`/api/admin/doctors/${doctorId}`, { method: 'GET' })

export const getAdminUserRoles = (userId: number) => requestJson<string[]>(`/api/admin/users/${userId}/roles`, { method: 'GET' })

export const getAdminUserPermissions = (userId: number) => requestJson<string[]>(`/api/admin/users/${userId}/permissions`, { method: 'GET' })

export const updateAdminPatient = (patientId: number, payload: AdminPatientUpdateRequest) => requestJson<Record<string, unknown>>(`/api/admin/patients/${patientId}`, { method: 'PUT', body: JSON.stringify(payload) })

export const updateAdminDoctor = (doctorId: number, payload: AdminDoctorUpdateRequest) => requestJson<Record<string, unknown>>(`/api/admin/doctors/${doctorId}`, { method: 'PUT', body: JSON.stringify(payload) })

export const updateAdminDoctorStatus = (doctorId: number, status: number) => requestJson<null>(`/api/admin/doctors/${doctorId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

export const createAdminPatient = (payload: AdminCreatePatientRequest) =>
  requestJson<AdminCreateAccountResult>('/api/admin/patients', { method: 'POST', body: JSON.stringify(payload) })

export const createAdminDoctor = (payload: AdminCreateDoctorRequest) =>
  requestJson<AdminCreateAccountResult>('/api/admin/doctors', { method: 'POST', body: JSON.stringify(payload) })

export const createAdminRegistration = (payload: AdminCreateRegistrationRequest) =>
  requestJson<AdminCreateAccountResult>('/api/admin/registrations', { method: 'POST', body: JSON.stringify(payload) })

export const updateAdminUserStatus = (userId: number, status: number) =>
  requestJson<null>(`/api/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

export const resetAdminUserPassword = (userId: number, password: string) =>
  requestJson<null>(`/api/admin/users/${userId}/password`, { method: 'PUT', body: JSON.stringify({ password }) })

export const setDepartmentManager = (userId: number, enabled: boolean) =>
  requestJson<null>(`/api/admin/users/${userId}/department-manager`, { method: 'PUT', body: JSON.stringify({ enabled }) })

export const getAdminSchedules = () => requestJson<Schedule[]>('/api/admin/schedules', { method: 'GET' })

export const getAdminSchedule = (scheduleId: number) => requestJson<Schedule>(`/api/admin/schedules/${scheduleId}`, { method: 'GET' })

export const createAdminSchedule = (payload: ScheduleRequest) =>
  requestJson<Schedule>('/api/admin/schedules', { method: 'POST', body: JSON.stringify(payload) })

export const updateAdminSchedule = (id: number, payload: ScheduleRequest) =>
  requestJson<Schedule>(`/api/admin/schedules/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

export const deleteAdminSchedule = (id: number) => requestJson<null>(`/api/admin/schedules/${id}`, { method: 'DELETE' })

export const getAdminSlots = (scheduleId: number) => requestJson<Slot[]>(`/api/admin/schedules/${scheduleId}/slots`, { method: 'GET' })

export const createAdminSlot = (scheduleId: number, payload: SlotRequest) =>
  requestJson<Slot>(`/api/admin/schedules/${scheduleId}/slots`, { method: 'POST', body: JSON.stringify(payload) })

export const updateAdminSlotStatus = (slotId: number, status: number) =>
  requestJson<null>(`/api/admin/schedules/slots/${slotId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

export const updateAdminSlot = (slotId: number, status: number) =>
  requestJson<Slot>(`/api/admin/schedules/slots/${slotId}`, { method: 'PUT', body: JSON.stringify({ status }) })

export const deleteAdminSlot = (slotId: number) => requestJson<null>(`/api/admin/schedules/slots/${slotId}`, { method: 'DELETE' })

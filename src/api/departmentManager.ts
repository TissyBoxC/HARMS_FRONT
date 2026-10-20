import { requestJson } from './http'
import type {
  DepartmentManagerDoctor,
  DepartmentManagerDoctorUpdateRequest,
  DepartmentManagerPatient,
  DepartmentManagerPatientDetail,
  DepartmentManagerScope,
  Schedule,
  ScheduleRequest,
  Slot,
  SlotRequest,
} from '@/types/user'

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })

  return search.toString()
}

export const getDepartmentManagerScope = () =>
  requestJson<DepartmentManagerScope>('/api/departments/manager/scope', { method: 'GET' })

export const getDepartmentManagerDoctors = (keyword = '') => {
  const query = buildQuery({ keyword })
  return requestJson<DepartmentManagerDoctor[]>(
    `/api/departments/manager/doctors${query ? `?${query}` : ''}`,
    { method: 'GET' },
  )
}

export const getDepartmentManagerDoctor = (doctorId: number) =>
  requestJson<DepartmentManagerDoctor>(`/api/departments/manager/doctors/${doctorId}`, {
    method: 'GET',
  })

export const updateDepartmentManagerDoctor = (
  doctorId: number,
  payload: DepartmentManagerDoctorUpdateRequest,
) =>
  requestJson<DepartmentManagerDoctor>(`/api/departments/manager/doctors/${doctorId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const getDepartmentManagerSchedules = (doctorId?: number, scheduleDate?: string) => {
  const query = buildQuery({ doctor_id: doctorId, schedule_date: scheduleDate })
  return requestJson<Schedule[]>(
    `/api/departments/manager/schedules${query ? `?${query}` : ''}`,
    { method: 'GET' },
  )
}

export const getDepartmentManagerSchedule = (scheduleId: number) =>
  requestJson<Schedule>(`/api/departments/manager/schedules/${scheduleId}`, {
    method: 'GET',
  })

export const createDepartmentManagerSchedule = (payload: ScheduleRequest) =>
  requestJson<Schedule>('/api/departments/manager/schedules', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateDepartmentManagerSchedule = (scheduleId: number, payload: ScheduleRequest) =>
  requestJson<Schedule>(`/api/departments/manager/schedules/${scheduleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteDepartmentManagerSchedule = (scheduleId: number) =>
  requestJson<null>(`/api/departments/manager/schedules/${scheduleId}`, {
    method: 'DELETE',
  })

export const getDepartmentManagerSlots = (scheduleId: number) =>
  requestJson<Slot[]>(`/api/departments/manager/schedules/${scheduleId}/slots`, {
    method: 'GET',
  })

export const createDepartmentManagerSlot = (scheduleId: number, payload: SlotRequest) =>
  requestJson<Slot>(`/api/departments/manager/schedules/${scheduleId}/slots`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateDepartmentManagerSlotStatus = (slotId: number, status: number) =>
  requestJson<null>(`/api/departments/manager/slots/${slotId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })

export const getDepartmentManagerPatients = (keyword = '') => {
  const query = buildQuery({ keyword })
  return requestJson<DepartmentManagerPatient[]>(
    `/api/departments/manager/patients${query ? `?${query}` : ''}`,
    { method: 'GET' },
  )
}

export const getDepartmentManagerPatient = (patientId: number) =>
  requestJson<DepartmentManagerPatientDetail>(
    `/api/departments/manager/patients/${patientId}`,
    { method: 'GET' },
  )

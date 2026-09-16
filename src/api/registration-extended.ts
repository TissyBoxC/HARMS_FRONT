import { requestJson } from './http'

const query = (params: Record<string, unknown>) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') search.set(key, String(value)) })
  return search.toString()
}

export const getRegistrationPatients = (keyword?: string) => requestJson<Record<string, unknown>[]>(`/api/registration/patients${query({ keyword }) ? `?${query({ keyword })}` : ''}`, { method: 'GET' })
export const getRegistrationPatient = (id: number) => requestJson<Record<string, unknown>>(`/api/registration/patients/${id}`, { method: 'GET' })
export const createRegistrationAppointment = (payload: { patient_id: number; schedule_id: number; slot_id?: number | null; remark?: string }) => requestJson<Record<string, unknown>>('/api/registration/appointments', { method: 'POST', body: JSON.stringify(payload) })
export const refundRegistrationAppointment = (id: number) => requestJson<null>(`/api/registration/appointments/${id}/refund`, { method: 'POST' })
export const callRegistrationQueue = (id: number) => requestJson<Record<string, unknown>>(`/api/registration/queue/${id}/call-next`, { method: 'POST' })
export const markRegistrationNoShow = (id: number) => requestJson<null>(`/api/registration/queue/${id}/mark-no-show`, { method: 'POST' })
export const requeueRegistration = (id: number) => requestJson<Record<string, unknown>>(`/api/registration/queue/${id}/requeue`, { method: 'POST' })

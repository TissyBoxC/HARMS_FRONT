import { requestJson } from './http'
import type { PatientProfile, PatientProfileUpdateRequest } from '@/types/user'

export const getPatientProfile = () => requestJson<PatientProfile>('/api/patient/profile', { method: 'GET' })

export const updatePatientProfile = (payload: PatientProfileUpdateRequest) => requestJson<PatientProfile>('/api/patient/profile', { method: 'PUT', body: JSON.stringify(payload) })

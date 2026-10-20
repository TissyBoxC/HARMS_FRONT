import { requestJson } from './http'
import type { PatientProfile, PatientProfileUpdateRequest } from '@/types/user'

/**
 * 患者个人资料接口
 *
 * 患者只能读取和修改当前 Session 对应自己的资料。
 */
export const getPatientProfile = () => requestJson<PatientProfile>('/api/patient/profile', { method: 'GET' })

export const updatePatientProfile = (payload: PatientProfileUpdateRequest) =>
  requestJson<PatientProfile>('/api/patient/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

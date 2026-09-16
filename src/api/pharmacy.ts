import { requestJson } from './http'

export const getPharmacyPrescriptions = (status?: number) => requestJson<Record<string, unknown>[]>(`/api/pharmacy/prescriptions${status ? `?status=${status}` : ''}`, { method: 'GET' })
export const getPharmacyPrescription = (id: number) => requestJson<Record<string, unknown>>(`/api/pharmacy/prescriptions/${id}`, { method: 'GET' })
export const dispensePharmacyPrescription = (id: number) => requestJson<null>(`/api/pharmacy/prescriptions/${id}/dispense`, { method: 'POST' })

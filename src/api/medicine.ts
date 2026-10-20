import { requestJson } from './http'
import type { Medicine } from '@/types/user'

export interface MedicineQuery {
  page?: number
  page_size?: number
  keyword?: string
  status?: number
  low_stock_only?: boolean
}

export interface MedicinePayload {
  medicine_code: string
  name: string
  specification?: string
  unit: string
  unit_price: number
  stock_quantity: number
  warning_quantity: number
  manufacturer?: string
  status: number
  remark?: string
}

const toQuery = (params: MedicineQuery) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })

  return search.toString()
}

const toMedicineSearchPath = (keyword?: string) => {
  const search = new URLSearchParams()
  const normalized = keyword?.trim()

  if (normalized) {
    search.set('keyword', normalized)
  }

  const suffix = search.toString()
  return `/api/doctor/medicines${suffix ? `?${suffix}` : ''}`
}

export const getPharmacyMedicines = (params: MedicineQuery = {}) =>
  requestJson<{ page: number; page_size: number; total: number; items: Medicine[] }>(
    `/api/pharmacy/medicines${toQuery(params) ? `?${toQuery(params)}` : ''}`,
    { method: 'GET' },
  )

export const getPharmacyMedicine = (id: number) =>
  requestJson<Medicine>(`/api/pharmacy/medicines/${id}`, { method: 'GET' })

export const createPharmacyMedicine = (payload: MedicinePayload) =>
  requestJson<Medicine>('/api/pharmacy/medicines', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updatePharmacyMedicine = (id: number, payload: MedicinePayload) =>
  requestJson<Medicine>(`/api/pharmacy/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const stockInPharmacyMedicine = (id: number, quantity: number) =>
  requestJson<Medicine>(`/api/pharmacy/medicines/${id}/stock-in`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  })

export const searchDoctorMedicines = (keyword?: string, signal?: AbortSignal) =>
  requestJson<Medicine[]>(toMedicineSearchPath(keyword), { method: 'GET', signal })

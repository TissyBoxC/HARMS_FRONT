import { requestJson } from './http'

/**
 * 药房接口
 *
 * 药房工作人员按状态查询处方、查看处方明细并确认发药。
 */
export interface PharmacyPrescriptionQuery {
  status?: number
  payment_status?: number
}

// 药房列表需要同时按处方状态和支付状态筛选，避免未支付处方进入发药流程。
export const getPharmacyPrescriptions = (params: PharmacyPrescriptionQuery = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })

  const suffix = search.toString() ? `?${search.toString()}` : ''
  return requestJson<Record<string, unknown>[]>(`/api/pharmacy/prescriptions${suffix}`, {
    method: 'GET',
  })
}

export const getPharmacyPrescription = (id: number) =>
  requestJson<Record<string, unknown>>(`/api/pharmacy/prescriptions/${id}`, {
    method: 'GET',
  })

export const dispensePharmacyPrescription = (id: number) =>
  requestJson<null>(`/api/pharmacy/prescriptions/${id}/dispense`, {
    method: 'POST',
  })

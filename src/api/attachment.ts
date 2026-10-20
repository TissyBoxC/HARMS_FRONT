import { ApiError, requestJson } from './http'
import type { MedicalAttachment } from '@/types/user'

/**
 * 医疗附件接口
 *
 * 查询和删除医疗附件，并处理多部分表单上传。
 */
export const getMedicalAttachments = (params: { patient_id?: number; visit_id?: number } = {}) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.set(key, String(value))
    }
  })

  const suffix = search.toString() ? `?${search.toString()}` : ''
  return requestJson<MedicalAttachment[]>(`/api/medical/attachments${suffix}`, { method: 'GET' })
}

export const getMedicalAttachment = (id: number) =>
  requestJson<MedicalAttachment>(`/api/medical/attachments/${id}`, { method: 'GET' })

export const deleteMedicalAttachment = (id: number) =>
  requestJson<null>(`/api/medical/attachments/${id}`, { method: 'DELETE' })

// 上传接口使用 FormData，因此不复用 JSON 请求头。
export const uploadMedicalAttachment = async (
  file: File,
  patientId: number,
  visitId?: number,
  attachmentType = 'MEDICAL_RECORD',
  description?: string,
) => {
  const data = new FormData()
  data.append('file', file)
  data.append('patient_id', String(patientId))

  if (visitId !== undefined) {
    data.append('visit_id', String(visitId))
  }

  data.append('attachment_type', attachmentType)

  if (description) {
    data.append('description', description)
  }

  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const response = await fetch(`${base}/api/medical/attachments`, {
    method: 'POST',
    body: data,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  const text = await response.text()
  let payload: unknown = null

  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload
        ? String((payload as { message?: unknown }).message)
        : '附件上传失败，请稍后重试。'
    throw new ApiError(response.status, message, payload)
  }

  return payload as MedicalAttachment
}

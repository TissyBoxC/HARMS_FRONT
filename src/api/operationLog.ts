import { requestJson } from './http'
import type { OperationLogRecord } from '@/types/user'

export interface OperationLogQuery { user_id?: number; operation_type?: string; target_type?: string; target_id?: number; start_time?: string; end_time?: string; limit?: number }
export const getOperationLogs = (query: OperationLogQuery = {}) => {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params.set(key, String(value)) })
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return requestJson<OperationLogRecord[]>(`/api/admin/operation-logs${suffix}`, { method: 'GET' })
}
export const getOperationLog = (id: number) => requestJson<OperationLogRecord>(`/api/admin/operation-logs/${id}`, { method: 'GET' })
export const getOperationLogsPaged = (page = 1, page_size = 20) => requestJson<{ page: number; page_size: number; total: number; items: OperationLogRecord[] }>(`/api/admin/operation-logs/paged?page=${page}&page_size=${page_size}`, { method: 'GET' })

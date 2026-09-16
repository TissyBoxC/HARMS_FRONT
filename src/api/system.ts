import { requestJson } from './http'

const query = (params: Record<string, unknown>) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') search.set(key, String(value)) })
  return search.toString()
}

export const getSystemHealth = () => requestJson<Record<string, unknown>>('/api/system/health', { method: 'GET' })
export const getSystemMetrics = () => requestJson<Record<string, unknown>>('/api/system/metrics', { method: 'GET' })
export const getSystemNotifications = () => requestJson<Record<string, unknown>[]>('/api/system/notifications', { method: 'GET' })
export const readSystemNotification = (id: number) => requestJson<null>(`/api/system/notifications/${id}/read`, { method: 'POST' })
export const getSystemConfig = () => requestJson<Record<string, unknown>[]>('/api/system/config', { method: 'GET' })
export const updateSystemConfig = (key: string, payload: { config_value: string; description?: string }) => requestJson<Record<string, unknown>>(`/api/system/config/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify(payload) })

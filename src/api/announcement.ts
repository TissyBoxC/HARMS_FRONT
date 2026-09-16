import { requestJson } from './http'

export const getPublicAnnouncements = () => requestJson<Record<string, unknown>[]>('/api/public/announcements', { method: 'GET' })
export const getPublicAnnouncement = (id: number) => requestJson<Record<string, unknown>>(`/api/public/announcements/${id}`, { method: 'GET' })
export const getAdminAnnouncements = () => requestJson<Record<string, unknown>[]>('/api/admin/announcements', { method: 'GET' })
export const createAdminAnnouncement = (payload: { title: string; content: string }) => requestJson<Record<string, unknown>>('/api/admin/announcements', { method: 'POST', body: JSON.stringify(payload) })
export const updateAdminAnnouncement = (id: number, payload: { title: string; content: string }) => requestJson<Record<string, unknown>>(`/api/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const publishAdminAnnouncement = (id: number) => requestJson<Record<string, unknown>>(`/api/admin/announcements/${id}/publish`, { method: 'POST' })
export const retractAdminAnnouncement = (id: number) => requestJson<Record<string, unknown>>(`/api/admin/announcements/${id}/retract`, { method: 'POST' })

import { requestJson } from './http'
import type { AppointmentRecord } from '@/types/user'

/**
 * 管理员预约接口
 *
 * 为管理员预约列表、详情和迁移页面提供统一的预约查询能力。
 */
export const getAdminAppointments = () =>
  requestJson<AppointmentRecord[]>('/api/admin/appointments', { method: 'GET' })

// 按页码和预约状态查询管理员预约，供列表页分页展示。
export const getAdminAppointmentsPage = (page = 1, page_size = 20, status?: number) =>
  requestJson<{ page: number; page_size: number; total: number; items: AppointmentRecord[] }>(
    `/api/admin/appointments/page?page=${page}&page_size=${page_size}${status === undefined ? '' : `&status=${status}`}`,
    { method: 'GET' },
  )

// 根据预约主键读取管理员预约详情。
export const getAdminAppointment = (id: number) =>
  requestJson<AppointmentRecord>(`/api/admin/appointments/${id}`, { method: 'GET' })

/** 修改管理员预约，用于预约迁移和预约信息维护。 */
export const updateAdminAppointment = (id: number, payload: Record<string, unknown>) =>
  requestJson<AppointmentRecord>(`/api/admin/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/**
 * 管理员扩展接口
 *
 * 汇总账号分页、角色权限、统计支付以及通知和数据维护等管理功能。
 */
import { requestJson } from './http'
import type { AppointmentRecord, PermissionCatalogItem } from '@/types/user'

// 统一过滤空查询条件，避免向接口发送无意义参数。
const query = (params: Record<string, unknown>) => {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })

  return search.toString()
}

// 账号管理
/** 创建药房账号。 */
export const createAdminPharmacy = (payload: { username: string; password: string }) =>
  requestJson<Record<string, unknown>>('/api/admin/pharmacy', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/** 按分页和筛选条件查询管理员可见的系统账号。 */
export const getAdminUsersPage = (
  params: { page?: number; page_size?: number; user_type?: number; status?: number; keyword?: string } = {},
) =>
  requestJson<Record<string, unknown>>(`/api/admin/users/page${query(params) ? `?${query(params)}` : ''}`, {
    method: 'GET',
  })

/** 修改指定账号的用户名或启用状态。 */
export const updateAdminUser = (id: number, payload: { username?: string; status?: number }) =>
  requestJson<Record<string, unknown>>(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** 删除指定账号。 */
export const deleteAdminUser = (id: number) =>
  requestJson<null>(`/api/admin/users/${id}`, { method: 'DELETE' })

/** 恢复已删除的账号。 */
export const restoreAdminUser = (id: number) =>
  requestJson<Record<string, unknown>>(`/api/admin/users/${id}/restore`, { method: 'POST' })

/** 查询指定账号已分配的角色。 */
export const getAdminUserRolesDetail = (userId: number) =>
  requestJson<Record<string, unknown>[]>(`/api/admin/users/${userId}/roles`, { method: 'GET' })

/** 为指定账号分配角色。 */
export const assignAdminRole = (userId: number, role_code: string) =>
  requestJson<Record<string, unknown>>(`/api/admin/users/${userId}/roles`, {
    method: 'POST',
    body: JSON.stringify({ role_code }),
  })

/** 移除指定账号的角色。 */
export const removeAdminRole = (userId: number, roleId: number) =>
  requestJson<null>(`/api/admin/users/${userId}/roles/${roleId}`, { method: 'DELETE' })

// 角色与权限维护
/** 查询系统角色目录。 */
export const getAdminRoles = () => requestJson<Record<string, unknown>[]>('/api/admin/roles', { method: 'GET' })

/** 创建角色。 */
export const createAdminRole = (payload: Record<string, unknown>) =>
  requestJson<Record<string, unknown>>('/api/admin/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/** 修改角色信息。 */
export const updateAdminRole = (id: number, payload: Record<string, unknown>) =>
  requestJson<Record<string, unknown>>(`/api/admin/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** 删除角色。 */
export const deleteAdminRole = (id: number) =>
  requestJson<null>(`/api/admin/roles/${id}`, { method: 'DELETE' })

/** 查询指定角色拥有的权限。 */
export const getAdminRolePermissions = (id: number) =>
  requestJson<Record<string, unknown>[]>(`/api/admin/roles/${id}/permissions`, { method: 'GET' })

/** 给角色分配权限。 */
export const assignAdminPermission = (roleId: number, permission_code: string) =>
  requestJson<Record<string, unknown>>(`/api/admin/roles/${roleId}/permissions`, {
    method: 'POST',
    body: JSON.stringify({ permission_code }),
  })

/** 移除角色权限。 */
export const removeAdminPermission = (roleId: number, permissionId: number) =>
  requestJson<null>(`/api/admin/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' })

/** 查询权限目录。 */
export const getAdminPermissions = () =>
  requestJson<PermissionCatalogItem[]>('/api/admin/permissions', { method: 'GET' })

/** 创建权限。 */
export const createAdminPermission = (payload: Record<string, unknown>) =>
  requestJson<Record<string, unknown>>('/api/admin/permissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

/** 修改权限信息。 */
export const updateAdminPermission = (id: number, payload: Record<string, unknown>) =>
  requestJson<Record<string, unknown>>(`/api/admin/permissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** 删除权限。 */
export const deleteAdminPermission = (id: number) =>
  requestJson<null>(`/api/admin/permissions/${id}`, { method: 'DELETE' })

// 统计与支付
/** 查询管理工作台统计数据。 */
export const getAdminStatistics = () =>
  requestJson<Record<string, unknown>>('/api/admin/statistics', { method: 'GET' })

/** 按分页和支付状态查询支付记录。 */
export const getAdminPayments = (params: { page?: number; page_size?: number; status?: number } = {}) =>
  requestJson<Record<string, unknown>>(`/api/admin/payments${query(params) ? `?${query(params)}` : ''}`, {
    method: 'GET',
  })

// 预约与排班运维
/** 修改管理员预约信息。 */
export const updateAdminAppointment = (id: number, payload: Record<string, unknown>) =>
  requestJson<AppointmentRecord>(`/api/admin/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** 取消管理员预约，可同时记录取消原因。 */
export const cancelAdminAppointment = (id: number, reason?: string) =>
  requestJson<null>(`/api/admin/appointments/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify(reason ? { reason } : {}),
  })

/** 将超时预约标记为失效。 */
export const expireAdminAppointment = (id: number) =>
  requestJson<null>(`/api/admin/appointments/${id}/expire`, { method: 'POST' })

/** 管理员停诊指定排班。 */
export const stopAdminSchedule = (id: number) =>
  requestJson<null>(`/api/admin/schedules/${id}/stop`, { method: 'POST' })

/** 修改指定排班状态。 */
export const updateAdminScheduleStatus = (id: number, status: number) =>
  requestJson<null>(`/api/admin/schedules/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })

/** 保留旧页面使用的停诊入口。 */
export const updateAdminScheduleStop = (id: number) =>
  requestJson<null>(`/api/admin/schedules/${id}/stop`, { method: 'POST' })

// 通知与数据一致性
/** 查询待发送、发送成功或失败的通知记录。 */
export const getNotificationOutbox = (params: { status?: number; limit?: number } = {}) =>
  requestJson<Record<string, unknown>[]>(
    `/api/admin/notification-outbox${query(params) ? `?${query(params)}` : ''}`,
    { method: 'GET' },
  )

/** 模拟发送指定通知。 */
export const sendNotificationOutbox = (id: number) =>
  requestJson<null>(`/api/admin/notification-outbox/${id}/send`, { method: 'POST' })

/** 重试失败通知。 */
export const retryNotificationOutbox = (id: number) =>
  requestJson<null>(`/api/admin/notification-outbox/${id}/retry`, { method: 'POST' })

/** 检查排班、号源和支付等数据的异常情况。 */
export const getDataConsistency = () =>
  requestJson<Record<string, unknown>>('/api/admin/data-consistency', { method: 'GET' })

/** 执行已支持的数据一致性修复。 */
export const repairDataConsistency = () =>
  requestJson<Record<string, unknown>>('/api/admin/data-consistency/repair', { method: 'POST' })

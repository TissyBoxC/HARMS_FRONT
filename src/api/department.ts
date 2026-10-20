import { requestJson } from './http'
import type { Department } from '@/types/user'

/**
 * 科室接口
 *
 * 提供公开科室查询以及管理员对科室的新增、修改和删除能力。
 */
export const getPublicDepartments = () => requestJson<Department[]>('/api/public/departments', { method: 'GET' })

export const getPublicDepartment = (id: number) => requestJson<Department>(`/api/public/departments/${id}`, { method: 'GET' })

export const getAdminDepartments = () => requestJson<Department[]>('/api/departments', { method: 'GET' })

export const getAdminDepartment = (id: number) => requestJson<Department>(`/api/departments/${id}`, { method: 'GET' })

export const createDepartment = (payload: Omit<Department, 'id' | 'created_at' | 'updated_at'>) =>
  requestJson<Department>('/api/departments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateDepartment = (id: number, payload: Omit<Department, 'id' | 'created_at' | 'updated_at'>) =>
  requestJson<Department>(`/api/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteDepartment = (id: number) =>
  requestJson<null>(`/api/departments/${id}`, { method: 'DELETE' })

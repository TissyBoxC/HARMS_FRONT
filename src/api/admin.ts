/**
 * 管理员核心接口
 *
 * 统一维护账号、患者、医生、科室管理员和排班相关请求。
 */
import { requestJson } from './http'
import type {
  AdminCreateAccountResult,
  AdminCreateDoctorRequest,
  AdminCreatePatientRequest,
  AdminCreateRegistrationRequest,
  AdminDoctorUpdateRequest,
  AdminPatientUpdateRequest,
  AdminUserSummary,
  DirectPermissionRecord,
  DoctorProfile,
  PatientProfile,
  Schedule,
  ScheduleRequest,
  Slot,
  SlotRequest,
} from '@/types/user'

/** 查询全部账号摘要，供账户筛选和权限维护使用。 */
export const getAdminUsers = () =>
  requestJson<AdminUserSummary[]>('/api/admin/users', { method: 'GET' })

/** 查询单个账号的摘要信息。 */
export const getAdminUser = (userId: number) =>
  requestJson<AdminUserSummary>(`/api/admin/users/${userId}`, { method: 'GET' })

/** 读取患者详情，用于管理员编辑前回填表单。 */
export const getAdminPatient = (patientId: number) =>
  requestJson<PatientProfile>(`/api/admin/patients/${patientId}`, { method: 'GET' })

/** 读取医生详情，用于管理员编辑前回填表单。 */
export const getAdminDoctor = (doctorId: number) =>
  requestJson<DoctorProfile>(`/api/admin/doctors/${doctorId}`, { method: 'GET' })

/** 查询账号已分配的权限角色编码。 */
export const getAdminUserRoles = (userId: number) =>
  requestJson<string[]>(`/api/admin/users/${userId}/roles`, { method: 'GET' })

/** 查询账号当前生效的权限编码。 */
export const getAdminUserPermissions = (userId: number) =>
  requestJson<string[]>(`/api/admin/users/${userId}/permissions`, { method: 'GET' })

/** 查询账号通过用户直授权限获得的权限明细。 */
export const getAdminUserDirectPermissions = (userId: number) =>
  requestJson<DirectPermissionRecord[]>(`/api/admin/users/${userId}/direct-permissions`, {
    method: 'GET',
  })

/** 直接给账号授予一个权限。 */
export const assignAdminUserPermission = (userId: number, permissionCode: string) =>
  requestJson<DirectPermissionRecord>(`/api/admin/users/${userId}/permissions`, {
    method: 'POST',
    body: JSON.stringify({ permission_code: permissionCode }),
  })

/** 移除账号的一条直授权限。 */
export const removeAdminUserPermission = (userId: number, permissionId: number) =>
  requestJson<null>(`/api/admin/users/${userId}/permissions/${permissionId}`, {
    method: 'DELETE',
  })

/** 更新患者资料。 */
export const updateAdminPatient = (
  patientId: number,
  payload: AdminPatientUpdateRequest,
) =>
  requestJson<Record<string, unknown>>(`/api/admin/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** 更新医生执业资料。 */
export const updateAdminDoctor = (
  doctorId: number,
  payload: AdminDoctorUpdateRequest,
) =>
  requestJson<Record<string, unknown>>(`/api/admin/doctors/${doctorId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

/** 启用或停用医生账号。 */
export const updateAdminDoctorStatus = (doctorId: number, status: number) =>
  requestJson<null>(`/api/admin/doctors/${doctorId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })

/** 创建患者账号及患者资料。 */
export const createAdminPatient = (payload: AdminCreatePatientRequest) =>
  requestJson<AdminCreateAccountResult>('/api/admin/patients', { method: 'POST', body: JSON.stringify(payload) })

/** 创建医生账号及医生资料。 */
export const createAdminDoctor = (payload: AdminCreateDoctorRequest) =>
  requestJson<AdminCreateAccountResult>('/api/admin/doctors', { method: 'POST', body: JSON.stringify(payload) })

/** 创建挂号员账号。 */
export const createAdminRegistration = (payload: AdminCreateRegistrationRequest) =>
  requestJson<AdminCreateAccountResult>('/api/admin/registrations', { method: 'POST', body: JSON.stringify(payload) })

/** 修改账号启用状态。 */
export const updateAdminUserStatus = (userId: number, status: number) =>
  requestJson<null>(`/api/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

/** 重置账号密码。 */
export const resetAdminUserPassword = (userId: number, password: string) =>
  requestJson<null>(`/api/admin/users/${userId}/password`, { method: 'PUT', body: JSON.stringify({ password }) })

/** 授予或取消科室管理权限，并可绑定科室负责人对应的科室。 */
export const setDepartmentManager = (
  userId: number,
  enabled: boolean,
  departmentId?: number | null,
) =>
  requestJson<null>(`/api/admin/users/${userId}/department-manager`, {
    method: 'PUT',
    body: JSON.stringify({
      enabled,
      ...(enabled && departmentId ? { department_id: departmentId } : {}),
    }),
  })

/** 查询管理员可见的全部排班。 */
export const getAdminSchedules = () => requestJson<Schedule[]>('/api/admin/schedules', { method: 'GET' })

/** 查询单条排班详情。 */
export const getAdminSchedule = (scheduleId: number) => requestJson<Schedule>(`/api/admin/schedules/${scheduleId}`, { method: 'GET' })

/** 新建排班。 */
export const createAdminSchedule = (payload: ScheduleRequest) =>
  requestJson<Schedule>('/api/admin/schedules', { method: 'POST', body: JSON.stringify(payload) })

/** 修改排班。 */
export const updateAdminSchedule = (id: number, payload: ScheduleRequest) =>
  requestJson<Schedule>(`/api/admin/schedules/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

/** 删除排班。 */
export const deleteAdminSchedule = (id: number) => requestJson<null>(`/api/admin/schedules/${id}`, { method: 'DELETE' })

/** 查询指定排班下的时间段。 */
export const getAdminSlots = (scheduleId: number) => requestJson<Slot[]>(`/api/admin/schedules/${scheduleId}/slots`, { method: 'GET' })

/** 新增时间段。 */
export const createAdminSlot = (scheduleId: number, payload: SlotRequest) =>
  requestJson<Slot>(`/api/admin/schedules/${scheduleId}/slots`, { method: 'POST', body: JSON.stringify(payload) })

/** 切换时间段状态。 */
export const updateAdminSlotStatus = (slotId: number, status: number) =>
  requestJson<null>(`/api/admin/schedules/slots/${slotId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })

/** 更新时间段排班信息。 */
export const updateAdminSlot = (slotId: number, status: number) =>
  requestJson<Slot>(`/api/admin/schedules/slots/${slotId}`, { method: 'PUT', body: JSON.stringify({ status }) })

/** 删除时间段。 */
export const deleteAdminSlot = (slotId: number) => requestJson<null>(`/api/admin/schedules/slots/${slotId}`, { method: 'DELETE' })

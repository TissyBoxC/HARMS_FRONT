import { requestJson } from './http'
import type { ScheduleRequestRecord, ScheduleRequestPayload } from '@/types/user'

/**
 * 排班申请接口
 *
 * 医生提交和取消排班申请，管理员或科室负责人查询、审核申请。
 */
export const getDoctorScheduleRequests = (status?: number) =>
  requestJson<ScheduleRequestRecord[]>(
    `/api/doctor/schedule-requests${status === undefined ? '' : `?status=${status}`}`,
    { method: 'GET' },
  )

export const getDoctorScheduleRequest = (id: number) =>
  requestJson<ScheduleRequestRecord>(`/api/doctor/schedule-requests/${id}`, {
    method: 'GET',
  })

export const cancelDoctorScheduleRequest = (id: number) =>
  requestJson<ScheduleRequestRecord>(`/api/doctor/schedule-requests/${id}`, {
    method: 'DELETE',
  })

export const createDoctorScheduleRequest = (payload: ScheduleRequestPayload) =>
  requestJson<ScheduleRequestRecord>('/api/doctor/schedules', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateDoctorScheduleRequest = (
  scheduleId: number,
  payload: ScheduleRequestPayload,
) =>
  requestJson<ScheduleRequestRecord>(`/api/doctor/schedules/${scheduleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteDoctorScheduleRequest = (scheduleId: number) =>
  requestJson<ScheduleRequestRecord>(`/api/doctor/schedules/${scheduleId}`, {
    method: 'DELETE',
  })

// 管理端查询默认不限定状态，由页面按 tab 传入 0 到 3。
export const getScheduleRequests = (status?: number, departmentId?: number) => {
  const search = new URLSearchParams()

  if (status !== undefined) {
    search.set('status', String(status))
  }
  if (departmentId !== undefined) {
    search.set('department_id', String(departmentId))
  }

  const suffix = search.toString() ? `?${search.toString()}` : ''
  return requestJson<ScheduleRequestRecord[]>(`/api/schedule-requests${suffix}`, {
    method: 'GET',
  })
}

export const approveScheduleRequest = (id: number, reviewRemark?: string) =>
  requestJson<ScheduleRequestRecord>(`/api/schedule-requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(reviewRemark ? { review_remark: reviewRemark } : {}),
  })

export const rejectScheduleRequest = (id: number, reviewRemark: string) =>
  requestJson<ScheduleRequestRecord>(`/api/schedule-requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ review_remark: reviewRemark }),
  })

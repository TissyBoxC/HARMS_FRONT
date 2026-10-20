import { requestJson } from './http'
import type {
  LoginCredentials,
  LoginResult,
  PatientRegisterRequest,
  RegisterResult,
} from '@/types/user'

/**
 * 用户认证接口
 *
 * 包含登录、当前用户查询、退出登录和患者注册。
 */
export const loginUser = (payload: LoginCredentials) =>
  requestJson<LoginResult>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getCurrentUser = () => requestJson<LoginResult>('/api/users/me', { method: 'GET' })

export const logoutUser = () => requestJson<null>('/api/users/logout', { method: 'POST' })

export const registerPatient = (payload: PatientRegisterRequest) =>
  requestJson<RegisterResult>('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

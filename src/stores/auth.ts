import { computed, ref } from 'vue'
import { ApiError } from '@/api/http'
import { getCurrentUser, loginUser, logoutUser } from '@/api/user'
import { getDepartmentManagerScope } from '@/api/departmentManager'
import { getScheduleRequests } from '@/api/scheduleApproval'
import type { LoginCredentials, LoginResult } from '@/types/user'

/**
 * 用户认证状态
 *
 * 使用服务端 Session 作为登录凭证，并在当前标签页保存用户资料快照，
 * 用于刷新页面后恢复工作台入口；快照不包含密码或 Cookie 内容。
 */
const currentUser = ref<LoginResult | null>(null)
const isRestoring = ref(false)
const departmentManageAccess = ref(false)
const scheduleReviewAccess = ref(false)
const SESSION_SNAPSHOT_KEY = 'clark.auth.user'
const DEPARTMENT_MANAGE_ACCESS_KEY = 'clark.auth.department-manage'
const SCHEDULE_REVIEW_ACCESS_KEY = 'clark.auth.schedule-review'

// 读取当前标签页的用户快照，并校验最低限度字段，避免损坏数据进入认证状态。
const readSessionSnapshot = (): LoginResult | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_SNAPSHOT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LoginResult
    if (!parsed || typeof parsed.user_id !== 'number' || !parsed.primary_role) return null
    return parsed
  } catch {
    return null
  }
}

// 登录、退出和 Session 失效时同步更新当前标签页快照。
const writeSessionSnapshot = (user: LoginResult | null) => {
  try {
    if (user) sessionStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(SESSION_SNAPSHOT_KEY)
  } catch {
    return
  }
}

const readAccessFlag = (key: string) => {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

const writeAccessFlags = (manageAccess: boolean, reviewAccess: boolean) => {
  try {
    sessionStorage.setItem(DEPARTMENT_MANAGE_ACCESS_KEY, manageAccess ? '1' : '0')
    sessionStorage.setItem(SCHEDULE_REVIEW_ACCESS_KEY, reviewAccess ? '1' : '0')
  } catch {
    return
  }
}

currentUser.value = readSessionSnapshot()
departmentManageAccess.value = readAccessFlag(DEPARTMENT_MANAGE_ACCESS_KEY)
scheduleReviewAccess.value = readAccessFlag(SCHEDULE_REVIEW_ACCESS_KEY)
let hasRestored = false

// 根据主角色返回对应工作台入口
const rolePath = (role: string) => {
  if (role === 'PATIENT') return '/patient/home'
  if (role === 'DOCTOR') return '/doctor/home'
  if (role === 'ADMIN') return '/admin/home'
  if (role === 'REGISTRATION') return '/registration/home'
  if (role === 'PHARMACY') return '/pharmacy/home'
  return '/access-pending'
}

// 刷新页面或首次进入受保护路由时，优先向服务端确认当前 Session。
const restoreSession = async () => {
  if (hasRestored || isRestoring.value) return currentUser.value
  isRestoring.value = true
  try {
    currentUser.value = await getCurrentUser()
    const [manageAccess, reviewAccess] = await Promise.all([
      canManageDepartments(),
      canReviewScheduleRequests(),
    ])
    departmentManageAccess.value = manageAccess
    scheduleReviewAccess.value = reviewAccess
    writeAccessFlags(manageAccess, reviewAccess)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      currentUser.value = null
      writeSessionSnapshot(null)
      hasRestored = true
    } else {
      hasRestored = true
    }
  } finally {
    isRestoring.value = false
  }
  return currentUser.value
}

// 登录成功后保存服务端返回的用户资料和角色信息。
const signIn = async (credentials: LoginCredentials) => {
  currentUser.value = await loginUser(credentials)
  const [manageAccess, reviewAccess] = await Promise.all([
    canManageDepartments(),
    canReviewScheduleRequests(),
  ])
  departmentManageAccess.value = manageAccess
  scheduleReviewAccess.value = reviewAccess
  writeAccessFlags(manageAccess, reviewAccess)
  writeSessionSnapshot(currentUser.value)
  hasRestored = true
  return currentUser.value
}

const canManageDepartments = async () => {
  try {
    await getDepartmentManagerScope()
    return true
  } catch {
    return false
  }
}

const canReviewScheduleRequests = async () => {
  try {
    await getScheduleRequests(0)
    return true
  } catch {
    return false
  }
}

// 无论服务端退出接口是否成功，本地认证状态都需要立即清理。
const signOut = async () => {
  try {
    await logoutUser()
  } finally {
    currentUser.value = null
    departmentManageAccess.value = false
    scheduleReviewAccess.value = false
    writeAccessFlags(false, false)
    writeSessionSnapshot(null)
    hasRestored = true
  }
}

export const useAuth = () => ({
  currentUser,
  isAuthenticated: computed(() => Boolean(currentUser.value)),
  isRestoring,
  departmentManageAccess,
  scheduleReviewAccess,
  rolePath,
  restoreSession,
  signIn,
  signOut,
})

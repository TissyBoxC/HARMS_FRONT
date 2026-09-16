import { computed, ref } from 'vue'
import { ApiError } from '@/api/http'
import { getCurrentUser, loginUser, logoutUser } from '@/api/user'
import type { LoginCredentials, LoginResult } from '@/types/user'

const currentUser = ref<LoginResult | null>(null)
const isRestoring = ref(false)
const SESSION_SNAPSHOT_KEY = 'clark.auth.user'

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

const writeSessionSnapshot = (user: LoginResult | null) => {
  try {
    if (user) sessionStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(SESSION_SNAPSHOT_KEY)
  } catch {
    return
  }
}

currentUser.value = readSessionSnapshot()
let hasRestored = false

const rolePath = (role: string) => {
  if (role === 'PATIENT') return '/patient/home'
  if (role === 'DOCTOR') return '/doctor/home'
  if (role === 'ADMIN') return '/admin/home'
  if (role === 'REGISTRATION') return '/registration/home'
  if (role === 'PHARMACY') return '/pharmacy/home'
  if (role === 'DEPARTMENT_MANAGER') return '/department/home'
  return '/access-pending'
}

const restoreSession = async () => {
  if (hasRestored || isRestoring.value) return currentUser.value
  isRestoring.value = true
  try {
    currentUser.value = await getCurrentUser()
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

const signIn = async (credentials: LoginCredentials) => {
  currentUser.value = await loginUser(credentials)
  writeSessionSnapshot(currentUser.value)
  hasRestored = true
  return currentUser.value
}

const signOut = async () => {
  try {
    await logoutUser()
  } finally {
    currentUser.value = null
    writeSessionSnapshot(null)
    hasRestored = true
  }
}

export const useAuth = () => ({
  currentUser,
  isAuthenticated: computed(() => Boolean(currentUser.value)),
  isRestoring,
  rolePath,
  restoreSession,
  signIn,
  signOut,
})

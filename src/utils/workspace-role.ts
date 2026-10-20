import type { LoginResult } from '@/types/user'

export type WorkspaceRole =
  | 'patient'
  | 'doctor'
  | 'admin'
  | 'registration'
  | 'department'
  | 'pharmacy'

export const resolveWorkspaceRole = (user: LoginResult | null): WorkspaceRole => {
  if (!user) {
    return 'department'
  }

  if (user.primary_role === 'ADMIN' || user.role_codes.includes('ADMIN')) {
    return 'admin'
  }

  if (user.primary_role === 'DOCTOR' || user.role_codes.includes('DOCTOR')) {
    return 'doctor'
  }

  if (user.primary_role === 'PATIENT') {
    return 'patient'
  }

  if (user.primary_role === 'REGISTRATION') {
    return 'registration'
  }

  if (user.primary_role === 'PHARMACY') {
    return 'pharmacy'
  }

  return 'department'
}

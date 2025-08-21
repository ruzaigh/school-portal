import type { User as FirebaseUser } from 'firebase/auth'

export type UserRole = 'PARENT' | 'TEACHER' | 'ADMIN'

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified: boolean
  role?: UserRole
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginFormData {
  email: string
  password: string
}


export interface AuthError {
  code: string
  message: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  needsSetup: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setupUserRole: (role: UserRole, requestAdmin?: boolean) => Promise<void>
  clearError: () => void
}

export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  emailVerified: firebaseUser.emailVerified
})

// User Management Types for Admin
export interface UserManagementData {
  email: string
  displayName: string
  role: UserRole
}

export interface InviteUserFormData {
  email: string
  displayName: string
  role: UserRole
}

export interface ManagedUser {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified: boolean
  role?: UserRole
  createdAt?: string
  lastSignIn?: string
  disabled?: boolean
  status?: 'active' | 'disabled'
  setupRequested?: boolean
  requestedRole?: UserRole
}

export interface UserManagementContextType {
  users: ManagedUser[]
  loading: boolean
  error: string | null
  inviteUser: (userData: UserManagementData) => Promise<void>
  deleteUser: (uid: string) => Promise<void>
  resendInvite: (email: string) => Promise<void>
  fetchUsers: () => Promise<void>
  clearError: () => void
}
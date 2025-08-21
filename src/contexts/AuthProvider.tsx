import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { auth } from '../firebase/config'
import { AuthContext } from './AuthContext'
import type { AuthContextType, User, UserRole } from '../types/auth'
import { convertFirebaseUser } from '../types/auth'
import { authService } from '../services/authService'
import { userManagementService } from '../services/userManagementService'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch user metadata from Firestore
          const userMetadata = await userManagementService.getUserMetadata(firebaseUser.uid)
          
          if (userMetadata && userMetadata.role) {
            // User has complete profile with role
            const user = {
              ...convertFirebaseUser(firebaseUser),
              role: userMetadata.role
            }
            setUser(user)
            setNeedsSetup(false)
          } else {
            // User exists in Firebase Auth but not in Firestore - needs setup
            const user = convertFirebaseUser(firebaseUser)
            setUser(user)
            setNeedsSetup(true)
          }
        } catch (err) {
          console.error('Error fetching user metadata:', err)
          // On error, assume user needs setup if they can authenticate
          const user = convertFirebaseUser(firebaseUser)
          setUser(user)
          setNeedsSetup(true)
        }
      } else {
        setUser(null)
        setNeedsSetup(false)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await authService.login(email, password)
    } catch (err) {
      setError((err as Error).message)
      throw err
    } finally {
      setLoading(false)
    }
  }


  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await authService.logout()
    } catch (err) {
      setError((err as Error).message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setError(null)
      await authService.resetPassword(email)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const setupUserRole = async (role: UserRole, requestAdmin: boolean = false): Promise<void> => {
    try {
      setError(null)
      if (!user) throw new Error('No authenticated user')
      
      await userManagementService.setupUserRole(
        user.uid,
        user.email || '',
        user.displayName || user.email || '',
        role,
        requestAdmin
      )
      
      // Refresh user data after setup
      const userMetadata = await userManagementService.getUserMetadata(user.uid)
      if (userMetadata && userMetadata.role) {
        setUser({
          ...user,
          role: userMetadata.role
        })
        setNeedsSetup(false)
      }
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    needsSetup,
    login,
    logout,
    resetPassword,
    setupUserRole,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import AuthPage from './AuthPage'
import UserSetup from './UserSetup'
import LoadingSpinner from '../ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, needsSetup } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  if (needsSetup) {
    return <UserSetup />
  }

  return <>{children}</>
}
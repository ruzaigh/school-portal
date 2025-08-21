import { useState } from 'react'
import { UserCheck, Shield, Users, BookOpen, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types/auth'
import Card from '../ui/Card'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import Alert from '../ui/Alert'

interface UserSetupProps {
  className?: string
}

export default function UserSetup({ className = '' }: UserSetupProps) {
  const { user, setupUserRole, loading, error } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>('PARENT')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) return

    try {
      setIsSubmitting(true)
      // Check if user wants to request admin access
      const requestAdmin = selectedRole === 'ADMIN'
      await setupUserRole(selectedRole, requestAdmin)
    } catch (err) {
      console.error('Error setting up user role:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleOptions = [
    {
      role: 'PARENT' as UserRole,
      title: 'Parent',
      description: 'View your children\'s grades, download materials, and stay updated with school events.',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      role: 'TEACHER' as UserRole,
      title: 'Teacher', 
      description: 'Manage student grades, upload materials, and communicate with parents.',
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Administrator',
      description: 'Full system access including user management and administrative functions.',
      icon: Shield,
      color: 'text-purple-600'
    }
  ]

  if (loading || isSubmitting) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {isSubmitting ? 'Setting up your account...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${className}`}>
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to the School Portal
          </h1>
          <p className="text-gray-600">
            Hi {user?.displayName || user?.email}, please select your role to complete your account setup.
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-6" />
        )}

        <div className="space-y-4 mb-8">
          {roleOptions.map(({ role, title, description, icon: Icon, color }) => (
            <div
              key={role}
              className={`
                relative rounded-lg border-2 cursor-pointer transition-colors p-4
                ${selectedRole === role 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => setSelectedRole(role)}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-6 h-6 mt-1 ${color}`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => setSelectedRole(role)}
                      className="text-blue-600"
                    />
                  </div>
                  <p className="text-gray-600 mt-1">
                    {description}
                  </p>
                  {role === 'ADMIN' && (
                    <div className="flex items-center space-x-1 mt-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">
                        Admin access requires approval if other admins exist
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Setting up...' : 'Complete Setup'}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to use the school portal in accordance with your selected role.
            {selectedRole === 'ADMIN' && ' Administrator access will be reviewed by existing admins.'}
          </p>
        </div>
      </Card>
    </div>
  )
}
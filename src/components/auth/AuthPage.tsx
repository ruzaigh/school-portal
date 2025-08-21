import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import LoginForm from './LoginForm'
import Card from '../ui/Card'
import Alert from '../ui/Alert'
import { useAuth } from '../../hooks/useAuth'

export default function AuthPage() {
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const { resetPassword } = useAuth()

  const handleForgotPassword = async (email: string) => {
    try {
      await resetPassword(email)
      setResetMessage(`Password reset email sent to ${email}. Please check your inbox.`)
    } catch {
      setResetMessage('Failed to send password reset email. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">School Portal</h1>
          <p className="text-gray-600">
            Welcome back! Sign in to your account
          </p>
        </div>

        {/* Reset Password Message */}
        {resetMessage && (
          <div className="mb-6">
            <Alert 
              type="info" 
              message={resetMessage}
              onClose={() => setResetMessage(null)}
            />
          </div>
        )}

        {/* Auth Form */}
        <Card className="p-6">
          <LoginForm onForgotPassword={handleForgotPassword} />
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; 2024 School Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
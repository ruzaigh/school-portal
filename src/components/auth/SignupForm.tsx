import { useState } from 'react'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { SignupFormData } from '../../types/auth'
import Button from '../ui/Button'
import Input from '../ui/Input'
import LoadingSpinner from '../ui/LoadingSpinner'
import Alert from '../ui/Alert'

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signup, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<SignupFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const errors: Partial<SignupFormData> = {}

    if (!formData.displayName.trim()) {
      errors.displayName = 'Full name is required'
    } else if (formData.displayName.trim().length < 2) {
      errors.displayName = 'Full name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      setSuccess(null)
      clearError()
      await signup(formData.email, formData.password, formData.displayName)
      setSuccess('Account created successfully! Please check your email to verify your account.')
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
      })
    } catch {
      // Error is handled by the AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear confirm password error if passwords match
    if (field === 'password' && formData.confirmPassword && value === formData.confirmPassword) {
      setFormErrors(prev => ({ ...prev, confirmPassword: undefined }))
    }
    if (field === 'confirmPassword' && formData.password && value === formData.password) {
      setFormErrors(prev => ({ ...prev, confirmPassword: undefined }))
    }
    if (error) {
      clearError()
    }
    if (success) {
      setSuccess(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={clearError}
        />
      )}

      {success && (
        <Alert 
          type="success" 
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      <Input
        label="Full Name"
        value={formData.displayName}
        onChange={(value) => handleChange('displayName', value)}
        placeholder="Enter your full name"
        error={formErrors.displayName}
        disabled={isSubmitting || loading}
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => handleChange('email', value)}
        placeholder="Enter your email"
        error={formErrors.email}
        disabled={isSubmitting || loading}
        required
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={(value) => handleChange('password', value)}
          placeholder="Create a password"
          error={formErrors.password}
          disabled={isSubmitting || loading}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
          disabled={isSubmitting || loading}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(value) => handleChange('confirmPassword', value)}
          placeholder="Confirm your password"
          error={formErrors.confirmPassword}
          disabled={isSubmitting || loading}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
          disabled={isSubmitting || loading}
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting || loading}
      >
        {isSubmitting || loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus size={16} />
            Create Account
          </>
        )}
      </Button>

      <div className="text-center">
        <div className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-medium"
            disabled={isSubmitting || loading}
          >
            Sign in
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        By creating an account, you agree to receive email notifications and communications from the school portal.
      </div>
    </form>
  )
}
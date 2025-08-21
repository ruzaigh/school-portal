import { useState, useEffect } from 'react'
import { UserPlus, Mail, Trash2, Users, AlertCircle, Check, Clock, CheckCircle, XCircle } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import Modal from './ui/Modal'
import Alert from './ui/Alert'
import LoadingSpinner from './ui/LoadingSpinner'
import type { InviteUserFormData, ManagedUser, UserRole } from '../types/auth'
import { userManagementService } from '../services/userManagementService'

export default function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Modal and form states
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState<InviteUserFormData>({
    email: '',
    displayName: '',
    role: 'PARENT'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedUsers = await userManagementService.fetchUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const validateInviteForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!inviteForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!inviteForm.displayName.trim()) {
      errors.displayName = 'Display name is required'
    } else if (inviteForm.displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters'
    }

    if (!inviteForm.role) {
      errors.role = 'Role is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateInviteForm()) return

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)
      
      await userManagementService.inviteUser({
        email: inviteForm.email,
        displayName: inviteForm.displayName,
        role: inviteForm.role
      })

      setSuccess(`Invitation sent to ${inviteForm.email}. They will receive a password reset email to set up their account.`)
      setShowInviteModal(false)
      setInviteForm({ email: '', displayName: '', role: 'PARENT' })
      setFormErrors({})
      
      // Refresh users list
      await fetchUsers()
      
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      await userManagementService.deleteUser(uid)
      setSuccess(`User ${email} has been disabled successfully.`)
      await fetchUsers()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleResendInvite = async (email: string) => {
    try {
      setError(null)
      setSuccess(null)
      await userManagementService.resendInvite(email)
      setSuccess(`Password reset email sent to ${email}.`)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleFormChange = (field: keyof InviteUserFormData, value: string) => {
    setInviteForm(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleApproveRole = async (uid: string, approvedRole: UserRole) => {
    try {
      setError(null)
      setSuccess(null)
      await userManagementService.approveUserRole(uid, approvedRole)
      setSuccess(`User role approved as ${approvedRole}`)
      await fetchUsers()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleRejectRole = async (uid: string) => {
    try {
      setError(null)
      setSuccess(null)
      await userManagementService.approveUserRole(uid, 'PARENT') // Default to PARENT role
      setSuccess('Role request rejected - user assigned PARENT role')
      await fetchUsers()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800'
      case 'PARENT':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and invitations</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowInviteModal(true)}
          disabled={loading}
        >
          <UserPlus size={16} />
          Invite User
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Pending Role Requests */}
      {users.some(user => user.setupRequested && user.requestedRole) && (
        <Card className="border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-amber-600" size={20} />
            <h2 className="text-lg font-semibold text-amber-800">
              Pending Role Requests
            </h2>
          </div>
          <div className="space-y-3">
            {users
              .filter(user => user.setupRequested && user.requestedRole)
              .map((user) => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {user.displayName || 'No Name'}
                    </h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Requesting {user.requestedRole} access
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApproveRole(user.uid, user.requestedRole!)}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectRole(user.uid)}
                    >
                      <XCircle size={16} />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-gray-500" />
          <h3 className="text-lg font-semibold">Current Users ({users.length})</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Refresh'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No users found. Start by inviting your first user.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.uid}
                className={`flex justify-between items-center p-4 rounded-lg border ${
                  user.disabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-medium ${user.disabled ? 'text-gray-500' : 'text-gray-900'}`}>
                      {user.displayName || 'No Name'}
                    </h4>
                    {user.role && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    )}
                    {user.setupRequested && user.requestedRole && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock size={12} />
                          Requesting {user.requestedRole}
                        </span>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveRole(user.uid, user.requestedRole!)}
                          className="text-xs py-1 px-2"
                        >
                          <CheckCircle size={12} />
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectRole(user.uid)}
                          className="text-xs py-1 px-2"
                        >
                          <XCircle size={12} />
                          Reject
                        </Button>
                      </div>
                    )}
                    {user.emailVerified && (
                      <Check size={16} className="text-green-600" />
                    )}
                    {user.disabled && (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                  </div>
                  <p className={`text-sm ${user.disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user.email}
                  </p>
                  {user.createdAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!user.disabled && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvite(user.email || '')}
                        disabled={!user.email}
                      >
                        <Mail size={16} />
                        Resend
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user.uid, user.email || '')}
                      >
                        <Trash2 size={16} />
                        Disable
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Invite User Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => !isSubmitting && setShowInviteModal(false)}
        title="Invite New User"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(value) => handleFormChange('email', value)}
            placeholder="user@example.com"
            error={formErrors.email}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Display Name"
            value={inviteForm.displayName}
            onChange={(value) => handleFormChange('displayName', value)}
            placeholder="John Doe"
            error={formErrors.displayName}
            disabled={isSubmitting}
            required
          />

          <Select
            label="Role"
            value={inviteForm.role}
            onChange={(value) => handleFormChange('role', value)}
            options={[
              { value: 'PARENT', label: 'Parent' },
              { value: 'TEACHER', label: 'Teacher' },
              { value: 'ADMIN', label: 'Admin' }
            ]}
            error={formErrors.role}
            disabled={isSubmitting}
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How invitations work:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>User account will be created with a temporary password</li>
                  <li>A password reset email will be sent for initial setup</li>
                  <li>User must click the link in their email to set their password</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
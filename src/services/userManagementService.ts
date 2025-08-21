import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  updateDoc,
  getDoc
} from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import type { UserManagementData, ManagedUser, UserRole } from '../types/auth'

// Helper function to generate a temporary password
const generateTempPassword = (): string => {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()
}

export const userManagementService = {
  /**
   * Create a new user account and send invite email
   * Note: This creates a user with a temporary password and immediately sends a password reset email
   */
  async inviteUser(userData: UserManagementData): Promise<void> {
    try {
      const tempPassword = generateTempPassword()
      
      // Create user with temporary password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        tempPassword
      )
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: userData.displayName
      })

      // Store user metadata in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.uid,
        disabled: false
      })

      // Send password reset email for initial setup
      await sendPasswordResetEmail(auth, userData.email)
      
    } catch (error) {
      throw new Error(getUserManagementErrorMessage((error as { code: string }).code))
    }
  },

  /**
   * Fetch all managed users from Firestore
   */
  async fetchUsers(): Promise<ManagedUser[]> {
    try {
      const usersCollection = collection(db, 'users')
      const usersQuery = query(usersCollection, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(usersQuery)
      
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as ManagedUser))
    } catch (error) {
      throw new Error(getUserManagementErrorMessage((error as { code: string }).code))
    }
  },

  /**
   * Delete a user account and remove from Firestore
   * Note: This only removes the user from Firestore as Firebase client SDK 
   * doesn't allow deleting other users' accounts
   */
  async deleteUser(uid: string): Promise<void> {
    try {
      // Remove user metadata from Firestore
      await deleteDoc(doc(db, 'users', uid))
      
      // Mark user as disabled in Firestore instead of actual deletion
      // since client SDK can't delete other users
      await setDoc(doc(db, 'users', uid), {
        disabled: true,
        disabledAt: new Date().toISOString(),
        disabledBy: auth.currentUser?.uid
      }, { merge: true })
      
    } catch (error) {
      throw new Error(getUserManagementErrorMessage((error as { code: string }).code))
    }
  },

  /**
   * Resend password reset email to a user
   */
  async resendInvite(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw new Error(getUserManagementErrorMessage((error as { code: string }).code))
    }
  },

  /**
   * Update user role and metadata
   */
  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid
      })
    } catch (error) {
      throw new Error(getUserManagementErrorMessage((error as { code: string }).code))
    }
  },

  /**
   * Get user metadata from Firestore
   */
  async getUserMetadata(uid: string): Promise<ManagedUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() } as ManagedUser
      }
      return null
    } catch (error) {
      throw new Error(getUserManagementErrorMessage((error as { code: string }).code))
    }
  },

  /**
   * Create user document for self-setup (for existing Firebase Auth users)
   */
  async setupUserRole(uid: string, email: string, displayName: string, role: UserRole, requestAdmin: boolean = false): Promise<void> {
    try {
      const userData: Partial<ManagedUser> & {
        uid: string
        email: string
        displayName: string
        emailVerified: boolean
        createdAt: string
        createdBy: string
        status: 'active' | 'disabled'
      } = {
        uid,
        email,
        displayName,
        emailVerified: true, // Assume verified if they can log in
        createdAt: new Date().toISOString(),
        createdBy: uid, // Self-created
        status: 'active'
      }

      // Handle admin role requests differently
      if (role === 'ADMIN' || requestAdmin) {
        // Check if there are any existing admins
        const usersCollection = collection(db, 'users')
        const adminQuery = query(usersCollection, orderBy('createdAt', 'asc'))
        const snapshot = await getDocs(adminQuery)
        const existingAdmins = snapshot.docs.filter(doc => doc.data().role === 'ADMIN')

        // If no admins exist, allow first user to become admin
        // Check for environment variable override
        const allowFirstAdmin = import.meta.env.VITE_ALLOW_FIRST_ADMIN === 'true'
        
        if (existingAdmins.length === 0 || allowFirstAdmin) {
          userData.role = 'ADMIN'
        } else {
          // Request admin access - requires approval
          userData.role = 'PARENT' // Default role while waiting
          userData.setupRequested = true
          userData.requestedRole = 'ADMIN'
        }
      } else {
        userData.role = role
      }

      await setDoc(doc(db, 'users', uid), userData)
    } catch (error) {
      throw new Error(getUserManagementErrorMessage((error as { code: string }).code))
    }
  },

  /**
   * Approve user role request (admin only)
   */
  async approveUserRole(uid: string, approvedRole: UserRole): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: approvedRole,
        setupRequested: false,
        requestedRole: null,
        approvedAt: new Date().toISOString(),
        approvedBy: auth.currentUser?.uid
      })
    } catch (error) {
      throw new Error(getUserManagementErrorMessage((error as { code: string }).code))
    }
  }
}

function getUserManagementErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'A user with this email already exists.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/user-not-found':
      return 'User not found.'
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'permission-denied':
      return 'You do not have permission to perform this action.'
    case 'not-found':
      return 'User data not found.'
    case 'unavailable':
      return 'Service temporarily unavailable. Please try again.'
    default:
      return 'An error occurred while managing users. Please try again.'
  }
}
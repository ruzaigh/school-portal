import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { auth } from '../firebase/config'
import type { User } from '../types/auth'
import { convertFirebaseUser } from '../types/auth'

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return convertFirebaseUser(userCredential.user)
    } catch (error) {
      throw new Error(getAuthErrorMessage((error as { code: string }).code))
    }
  },

  async signup(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      await updateProfile(userCredential.user, {
        displayName
      })
      
      await sendEmailVerification(userCredential.user)
      
      return convertFirebaseUser({
        ...userCredential.user,
        displayName
      } as FirebaseUser)
    } catch (error) {
      throw new Error(getAuthErrorMessage((error as { code: string }).code))
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      throw new Error(getAuthErrorMessage((error as { code: string }).code))
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw new Error(getAuthErrorMessage((error as { code: string }).code))
    }
  },

  async resendVerificationEmail(user: FirebaseUser): Promise<void> {
    try {
      await sendEmailVerification(user)
    } catch (error) {
      throw new Error(getAuthErrorMessage((error as { code: string }).code))
    }
  }
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.'
    default:
      return 'An error occurred. Please try again.'
  }
}
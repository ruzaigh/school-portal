# Firebase Setup for Admin-Only Authentication

This document outlines the Firebase configuration required for the admin-only authentication system with user management.

## Firebase Configuration Required

### 1. Firestore Database
Enable Firestore Database in your Firebase project to store user management data.

### 2. Authentication Configuration
- Enable Email/Password authentication method in Firebase Auth
- Disable self-registration in Firebase Auth Console (under Settings > Sign-in method > Email/Password)
- Configure password policy as needed

### 3. Firestore Security Rules
Deploy the provided `firestore.rules` file to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

### 4. Environment Variables
Ensure these Firebase configuration variables are set in your `.env` file:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## User Management Flow

### Admin Invite Process
1. Admin fills out the invite form (email, display name, role)
2. System creates a Firebase Auth user with a temporary password
3. User metadata is stored in Firestore `/users/{uid}` collection
4. Password reset email is automatically sent to the new user
5. User clicks the password reset link to set their actual password

### Data Structure
User documents in Firestore `/users/{uid}`:
```json
{
  "uid": "firebase-user-uid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "admin|teacher|student",
  "emailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "admin-user-uid",
  "disabled": false
}
```

## Security Considerations

### Current Limitations
- Firebase Client SDK doesn't support admin user creation - using temporary password workaround
- User deletion only disables users in Firestore (Firebase Auth accounts remain)
- Admin role verification is basic - enhance for production use

### Production Enhancements Needed
1. **Firebase Admin SDK**: For proper user creation and management
2. **Role-based Security**: Implement proper admin role checking in security rules
3. **Audit Logging**: Track all user management actions
4. **Email Templates**: Customize password reset email templates
5. **User Approval**: Add approval workflow for sensitive operations

## Testing the System

1. **Initial Admin Setup**: Create the first admin user manually through Firebase Console
2. **Login Flow**: Verify only login is available (no signup)
3. **User Invites**: Test the complete invite flow:
   - Admin invites new user
   - Email is sent
   - User sets password via reset link
   - User can log in successfully
4. **User Management**: Test user listing, resend invites, and disabling users

## Deployment Checklist

- [ ] Firestore database enabled
- [ ] Email/Password auth enabled
- [ ] Self-registration disabled in Firebase Auth
- [ ] Security rules deployed
- [ ] Environment variables configured
- [ ] First admin user created manually
- [ ] Email templates customized (optional)
- [ ] Testing completed on all user management flows
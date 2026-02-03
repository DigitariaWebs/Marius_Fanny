# Auth Workflow TODO List

## 🔐 Core Authentication

### Session Management
- [ ] Implement persistent sessions (JWT with refresh tokens or secure cookies)
- [ ] Configure session expiration (7 days with 30-day absolute max)
- [ ] Add auto-refresh mechanism for active users
- [ ] Store session state in frontend (localStorage/sessionStorage + context)

### Protected Routes
- [ ] Create `ProtectedRoute` component wrapper
- [ ] Implement auth state check before rendering protected pages
- [ ] Redirect unauthenticated users to `/login`
- [ ] Preserve intended destination URL for post-login redirect

### Public Routes Guard
- [ ] Create `PublicRoute` component wrapper for login/signup pages
- [ ] Check if user is already authenticated
- [ ] Redirect authenticated users from `/login`, `/signup` to `/user`
- [ ] Allow access to `/forgot-password` and `/verify-email` regardless of auth state

---

## 📝 Signup Flow

### Frontend
- [ ] Create signup form with fields:
  - [ ] Name (required)
  - [ ] Email (required, valid format)
  - [ ] Password (required, min 8 chars)
  - [ ] Confirm Password (required, must match)
- [ ] Add real-time validation:
  - [ ] Email format validation
  - [ ] Password strength indicator (weak/medium/strong)
  - [ ] Password requirements display (min length, uppercase, lowercase, number, special char)
  - [ ] Password match validation
- [ ] Show loading state during submission
- [ ] Handle success → redirect to verification page
- [ ] Handle errors (email already exists, network errors)

### Backend
- [ ] Validate email uniqueness
- [ ] Hash password securely (already done with bcrypt)
- [ ] Create user account in database
- [ ] Generate 6-digit verification code
- [ ] Store verification code with expiration (24 hours) in database
- [ ] Send verification email via `sendVerificationCodeEmail`
- [ ] Return success response without auto-login

---

## ✉️ Email Verification Flow

### Frontend
- [ ] Create verification page (`/verify-email`)
- [ ] Display user email (from signup or session)
- [ ] Add 6-digit code input field (OTP-style input)
- [ ] Add "Resend Code" button with cooldown timer (60 seconds)
- [ ] Show loading state during verification
- [ ] Handle success → auto-login and redirect to `/user`
- [ ] Handle errors (invalid code, expired code, network errors)
- [ ] Block access to protected routes until verified

### Backend
- [ ] Create `POST /api/auth/verify-email` endpoint
- [ ] Validate verification code format
- [ ] Check code exists and matches user email
- [ ] Check code hasn't expired
- [ ] Mark user as verified in database (`emailVerified` field)
- [ ] Invalidate used verification code
- [ ] Create session for user (auto-login)
- [ ] Return session token
- [ ] Create `POST /api/auth/resend-verification` endpoint
- [ ] Rate limit resend requests (max 3 per 10 minutes)
- [ ] Generate new verification code
- [ ] Invalidate old codes
- [ ] Send new verification email

### Database
- [ ] Add verification codes collection/table:
  - [ ] userId/email
  - [ ] code (6 digits)
  - [ ] expiresAt
  - [ ] createdAt
- [ ] Add `emailVerified` boolean field to users
- [ ] Add index on code for fast lookups
- [ ] Add TTL index for auto-cleanup of expired codes

---

## 🔑 Login Flow

### Frontend
- [ ] Create login form with fields:
  - [ ] Email (required, valid format)
  - [ ] Password (required)
  - [ ] "Remember me" checkbox (optional)
- [ ] Add form validation
- [ ] Show loading state during submission
- [ ] Handle success scenarios:
  - [ ] If verified → redirect to `/user` (or saved destination)
  - [ ] If not verified → redirect to `/verify-email`
- [ ] Handle errors (invalid credentials, account not found, network errors)
- [ ] Add "Forgot Password?" link
- [ ] Add "Don't have an account? Sign up" link

### Backend
- [ ] Create/verify `POST /api/auth/login` endpoint exists
- [ ] Validate email and password
- [ ] Check user exists
- [ ] Verify password hash
- [ ] Check if email is verified
- [ ] Create session if verified
- [ ] Return session token + user data
- [ ] Return `emailVerified: false` status if not verified
- [ ] Rate limit login attempts (max 5 per 10 minutes per email)

---

## 🔄 Forgot Password Flow

### Frontend
- [ ] Create forgot password page (`/forgot-password`)
- [ ] Step 1: Request reset
  - [ ] Email input field
  - [ ] Submit button
  - [ ] Show success message after submission
- [ ] Step 2: Enter reset code (`/reset-password`)
  - [ ] 6-digit code input (OTP-style)
  - [ ] New password field
  - [ ] Confirm new password field
  - [ ] Password strength indicator
  - [ ] "Resend Code" button with cooldown
  - [ ] Submit button
- [ ] Handle success → redirect to login with success message
- [ ] Handle errors (invalid code, expired code, passwords don't match)

### Backend
- [ ] Create `POST /api/auth/forgot-password` endpoint
- [ ] Validate email exists
- [ ] Generate 6-digit reset code
- [ ] Store code with expiration (1 hour) in database
- [ ] Send password reset email with code
- [ ] Rate limit requests (max 3 per 10 minutes per email)
- [ ] Create `POST /api/auth/reset-password` endpoint
- [ ] Validate reset code
- [ ] Check code hasn't expired
- [ ] Validate new password strength
- [ ] Hash new password
- [ ] Update user password
- [ ] Invalidate reset code
- [ ] Invalidate all existing sessions for user
- [ ] Return success response
- [ ] Create `POST /api/auth/resend-reset-code` endpoint
- [ ] Similar to resend verification

### Database
- [ ] Add password reset codes collection/table:
  - [ ] userId/email
  - [ ] code (6 digits)
  - [ ] expiresAt (1 hour)
  - [ ] createdAt
- [ ] Add index on code for fast lookups
- [ ] Add TTL index for auto-cleanup

---

## 🛡️ Form Validation

### Password Validation Rules
- [ ] Minimum 8 characters
- [ ] Maximum 128 characters
- [ ] At least one uppercase letter
- [ ] At least one lowercase letter
- [ ] At least one number
- [ ] At least one special character
- [ ] Not in common passwords list (optional)

### Email Validation
- [ ] Valid email format (regex)
- [ ] No spaces
- [ ] Lowercase normalization

### Frontend Validation Library
- [ ] Install validation library (e.g., Zod, Yup, or react-hook-form)
- [ ] Create reusable validation schemas
- [ ] Show inline error messages
- [ ] Disable submit until form is valid

### Backend Validation
- [ ] Validate all inputs server-side (never trust client)
- [ ] Sanitize inputs to prevent injection attacks
- [ ] Return clear, actionable error messages
- [ ] Use consistent error response format

---

## 🎨 UI/UX Enhancements

- [ ] Add loading spinners/skeletons
- [ ] Add success/error toast notifications
- [ ] Add smooth page transitions
- [ ] Make forms keyboard accessible (Enter to submit)
- [ ] Add "Show/Hide Password" toggle
- [ ] Add email autocomplete
- [ ] Style OTP input fields (auto-focus next field)
- [ ] Add countdown timer display for resend buttons
- [ ] Add password strength meter visualization
- [ ] Add "Back to Login" links on all auth pages

---

## 🧪 Testing (Optional but Recommended)

- [ ] Test signup with valid data
- [ ] Test signup with duplicate email
- [ ] Test signup with weak password
- [ ] Test email verification with valid code
- [ ] Test email verification with expired code
- [ ] Test login with verified account
- [ ] Test login with unverified account
- [ ] Test login with wrong password
- [ ] Test protected route access without auth
- [ ] Test protected route access with auth
- [ ] Test forgot password flow
- [ ] Test reset password with valid code
- [ ] Test reset password with expired code
- [ ] Test session persistence across page refresh
- [ ] Test logout functionality

---

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Implement rate limiting on all auth endpoints
- [ ] Hash passwords with bcrypt (salt rounds >= 10)
- [ ] Use secure session tokens (httpOnly cookies or secure JWT)
- [ ] Set appropriate CORS policies
- [ ] Sanitize all user inputs
- [ ] Add CSRF protection
- [ ] Implement account lockout after failed attempts
- [ ] Log authentication events for audit
- [ ] Never expose sensitive errors to client
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
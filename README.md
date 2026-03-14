# PikNGo - Highway Food Discovery App

## Current Status: Email & OTP Login Milestone
The project is currently at the stable milestone where **Email & Phone OTP Login** is fully functional with a premium UI.

### Completed Features:
- **Authentication System**:
  - Phone OTP Login (Simulated)
  - Email OTP Login (SMTP Integrated for real emails)
  - Password-based Login
  - Forgot/Reset Password via Email
- **Premium UI/UX**:
  - Dark/Light Theme Support
  - Glassmorphism Design
  - Smooth Animations

### Next Steps:
- Address Management System
- Restaurant Discovery & Geolocation
- Order Flow Implementation

### Deployment Notes:
- Backend: Run `com.pikngo.user_service.UserServiceApplication`
- Frontend: `npm run dev` in `/frontend`
- **SMTP Setup**: Update `application.properties` with your email and app password to receive real OTPs.
3. **Frontend**: Geolocation will prompt the user for access to show relevant nearby results.

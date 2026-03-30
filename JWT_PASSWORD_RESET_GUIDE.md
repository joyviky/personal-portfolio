# 🔐 JWT & Password Reset Guide

## 📚 Part 1: Understanding JWT (JSON Web Token)

### **What is JWT?**

JWT is like a **digital ID card** that proves you are logged in without storing your password.

```
┌─────────────────────────┐
│   JWT Token             │
│                         │
│ eyJhbGc.eyJpc3M.SflKxw │ ← Long encoded string
│                         │
│ It contains:            │
│ • Your ID               │
│ • When it expires       │
│ • A secret signature    │
└─────────────────────────┘
```

### **JWT Secret (`JWT_SECRET`)**

**What is it?**
- A secret password that ONLY your server knows
- Used to sign and verify tokens
- Like a seal on an envelope - proves no one tampered with it

**Where to find it:**
```
File: /server/.env

JWT_SECRET=portfolio_demo_secret_key_12345_change_in_production
                 ↑
        This is YOUR secret key
```

**How to generate a strong one:**
```
Option 1 - Use this online generator:
https://randomkeygen.com/ (pick "CodeIgniter Encryption Keys")

Option 2 - Use command line:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Example output:
a7f8d9e3c2b1f4a9e5c2d8f1b3a6e9c2f5a8b1e4d7c0f3a6b9e2c5d8f1a4
```

### **JWT Expire (`JWT_EXPIRE`)**

**What is it?**
- How long your login token stays valid
- After expiry, you need to login again

**Common values:**
```
JWT_EXPIRE=1h        → 1 hour (most secure, annoying)
JWT_EXPIRE=7d        → 7 days (current setting)
JWT_EXPIRE=30d       → 30 days (less secure)
JWT_EXPIRE=90d       → 90 days (easy but risky)
```

**Where to find it:**
```
File: /server/.env

JWT_EXPIRE=7d
             ↑
      Token valid for 7 days
```

### **How JWT Works**

```
LOGIN PROCESS:
─────────────

1. You enter password: admin123
   ↓
2. Backend checks: "Is this correct?" ✅
   ↓
3. Backend creates TOKEN:
   {
     id: "admin-123",
     email: "admin@portfolio.com",
     iat: 1700000000,          ← Created at
     exp: 1700604800           ← Expires at (7 days later)
   }
   ↓
4. Backend signs it with JWT_SECRET (adds signature)
   ↓
5. Sends TOKEN to frontend
   ↓
6. Frontend stores in localStorage:
   {
     token: "eyJhbGc.eyJpc3M.SflKxw"
   }

NEXT REQUEST PROCESS:
────────────────────

1. You edit a skill → request to backend
   ↓
2. Frontend adds token to request:
   Authorization: Bearer eyJhbGc.eyJpc3M.SflKxw
   ↓
3. Backend receives request
   ↓
4. Backend verifies token:
   - Is signature valid? (check with JWT_SECRET) ✅
   - Is it expired? (check exp date) ✅
   - Is user ID valid? ✅
   ↓
5. All checks pass → Allow request ✅
   ↓
6. Update your skill in database

TOKEN EXPIRES:
──────────────

1. You login on Day 1
   ↓
2. Token expires on Day 8
   ↓
3. You try to edit something on Day 9
   ↓
4. Backend checks: "Is token valid?"
   ↓
5. Nope, it's expired! ❌
   ↓
6. Backend says: "Please login again"
   ↓
7. You click "Login" and authenticate again
   ↓
8. Get new fresh token ✅
```

---

## 🔐 Part 2: Password Reset System

### **Overview**

Your portfolio has **3 security features:**

1. **Login Password** - Default: `admin123`
2. **Password Reset** - Reset via email code
3. **Change Password** - Change while logged in

### **How Password Reset Works**

```
STEP 1: REQUEST RESET
──────────────────────

You: "I forgot my password"
     Click "Forgot Password?" on login page
     ↓
App: "What email?"
     You: admin@portfolio.com
     ↓
Backend:
  1. Generates random 6-digit code: 347892
  2. Generates reset token: a7f8d9e3c2b1f4a9e5c2d8f1b3...
  3. Saves to MongoDB with 1-hour expiry
  4. Sends email with code
     ↓
You: Check email inbox
     Copy code: 347892

STEP 2: VERIFY CODE
────────────────────

You: Enter 6-digit code: 347892
     ↓
Backend:
  1. Find reset record with this code ✓
  2. Check: Is it expired? (Nope ✓)
  3. Check: Is it already used? (Nope ✓)
  4. All good! ✓

STEP 3: SET NEW PASSWORD
─────────────────────────

You: Enter new password: MyNewPassword123
     Re-enter: MyNewPassword123
     ↓
Backend:
  1. Hashes password with bcrypt (one-way encryption)
  2. Saves to database
  3. Marks reset token as "used" (can't be reused!)
  4. Returns: "✅ Password changed successfully!"
     ↓
You: Can now login with new password!
```

### **Security: Your Portfolio Data is SAFE**

```
DATABASE STRUCTURE:
──────────────────

MongoDB
├── Admin Collection        ← Password stored here
│   └── { email, password }
│
├── Profile Collection      ← Your info (NOT affected by password reset!)
│   └── { name, bio, avatar, socials }
│
├── Skills Collection       ← Your skills (NOT affected!)
│   └── { name, category, level }
│
├── Projects Collection     ← Your projects (NOT affected!)
│   └── { title, description, image }
│
└── PasswordReset Collection ← Temporary reset tokens
    └── { email, resetToken, resetCode, expiresAt }


⚠️ WHEN YOU RESET PASSWORD:
───────────────────────────

Only the Admin Collection is modified:
✓ Admin password updated

Everything else stays the same:
✓ Skills remain
✓ Projects remain
✓ Profile info remains
✓ All data persists

Think of it like:
• Passwords = House Keys 🔑
• Portfolio Data = Furniture in House 🛋️

Changing your keys doesn't affect your furniture!
```

---

## 🔧 Part 3: Password Reset Implementation

### **Files Created/Modified**

**New Model:**
```
/server/models/PasswordReset.js
├── email (your email)
├── resetToken (unique 64-char code)
├── resetCode (6-digit code)
├── expiresAt (1 hour from now)
└── used (false until you reset)
```

**New API Endpoints:**
```
POST /api/auth/forgot-password
   Request: { email }
   Response: { message, demoCode }
   
POST /api/auth/reset-password
   Request: { email, resetCode, newPassword }
   Response: { message, success }
   
POST /api/auth/change-password
   Request: { currentPassword, newPassword }
   Response: { message, success }
   Headers: Authorization: Bearer token
```

**New Frontend Page:**
```
/client/src/pages/ForgotPassword.jsx
├── Step 1: Enter email
├── Step 2: Enter 6-digit code
├── Step 3: Enter new password
└── Step 4: Success!
```

### **Updated Login Page**
```
Old: [Authenticate Button]

New: [Authenticate Button]
     [Forgot Password?] ← NEW
     [Back to site]
```

---

## 🔑 Part 4: Changing Your Password

### **Option 1: Via Password Reset (Forgot Password)**

```
Login Page → "Forgot Password?" → Email code → Reset password
```

### **Option 2: Via Admin Dashboard (While Logged In)**

**Coming Soon Feature - Endpoint exists:**
```
PUT /api/auth/change-password
   Request: { currentPassword, newPassword }
   Returns: { message, success }
```

---

## ⚙️ Part 5: Configuration

### **Email Settings (in .env)**

```env
EMAIL_USER=vignesh4485849@gmail.com
EMAIL_PASS=pjiuegjjanufzwwf
ADMIN_EMAIL=vignesh4485849@gmail.com
```

**Important:**
- ✅ Currently uses your Gmail with App Password
- ✅ All reset codes go to your email
- ✅ Emails work in development & production

**For Production - Change to your domain email:**
```
Consider using SendGrid, Mailgun, or AWS SES
(More reliable than Gmail for production)
```

### **JWT Settings (in .env)**

**Development:**
```env
JWT_SECRET=portfolio_demo_secret_key_12345_change_in_production
JWT_EXPIRE=7d
```

**Production - MUST CHANGE:**
```env
JWT_SECRET=a7f8d9e3c2b1f4a9e5c2d8f1b3a6e9c2f5a8b1e4d7c0f3a6b9e2c5d8f1a4
JWT_EXPIRE=7d
NODE_ENV=production
```

---

## 📱 Part 6: User Flow

### **First Login (Demo)**
```
Visit: http://localhost:5173/admin
Enter: admin123
→ You're logged in! Token saved.
→ Dashboard opens
```

### **Forgot Password Flow**
```
1. Click "Forgot Password?" on login
2. Enter: admin@portfolio.com
3. Check email for 6-digit code
4. Enter code on app
5. Set new password
6. Success! Login with new password
```

### **Token Expiry Flow**
```
Day 1: Login → Get token → Valid for 7 days
Day 8: Try to edit skill → Token expired ❌
       → Backend says "Please login again"
       → Redirect to login page
       → Login again → Get new token ✅
```

---

## 🚨 Security Best Practices

### **For Your Eyes Only - Secrets to Protect**

```
❌ DON'T expose:
  • JWT_SECRET
  • EMAIL_PASS
  • MongoDB URI (in production)

✅ DO:
  • Keep .env file locally
  • Use environment variables in production
  • Change JWT_SECRET before deploying
  • Change admin password from "admin123"
  • Use strong passwords (8+ chars, mix of letters/numbers/symbols)
```

### **Password Reset Security**

```
✅ Reset codes expire after 1 hour
✅ Codes are 6 digits (1 in 1,000,000 combinations)
✅ Codes marked as "used" after successful reset
✅ Emails sent securely via Gmail SMTP
✅ New password hashed with bcrypt (one-way encryption)

⚠️ For Production:
  • Consider 2FA (Two-Factor Authentication)
  • Log password change events
  • Notify user when password changed
```

---

## 🧪 Testing Password Reset Locally

### **Step 1: Make sure MongoDB is running**
```bash
mongo

# In another terminal, should show "Connected"
```

### **Step 2: Start backend**
```bash
cd server
npm start

# Should show:
# ✅ Server running on port 5001
```

### **Step 3: Start frontend**
```bash
cd client
npm run dev

# Should show:
# ✅ Local: http://localhost:5173
```

### **Step 4: Test password reset**
```
1. Go to http://localhost:5173/admin
2. Click "Forgot Password?"
3. Enter email: admin@portfolio.com
4. Backend will show demo code in console
   (For testing, code is returned in response)
5. Enter the code
6. Enter new password
7. Success!
```

---

## 📚 Reference: JWT Token Anatomy

```
JWT Structure: [Header].[Payload].[Signature]

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
       ↑
    HEADER: Algorithm (HS256) + Type (JWT)

.eyJzdWIiOiIxMjM0NTY3ODkwIn0
       ↑
    PAYLOAD: Your ID, email, exp, iat

.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
       ↑
    SIGNATURE: Hash of (Header.Payload.SECRET)
               Only server can create this!

VERIFICATION:
1. Receive token from client
2. Split by "."
3. Calculate hash: HMAC-SHA256(header.payload, JWT_SECRET)
4. Compare with received signature
5. If match → Token valid ✅
6. If no match → Token tampered (reject) ❌
```

---

## 🎯 Summary

| Concept | Meaning | Where |
|---------|---------|-------|
| **JWT_SECRET** | Secret key to sign tokens | `.env` |
| **JWT_EXPIRE** | How long tokens are valid | `.env` |
| **Login Token** | Proves you're logged in | localStorage |
| **Reset Code** | 6-digit code to reset password | Email |
| **Reset Token** | Long code in URL/backend | Database |
| **Bcrypt** | One-way password encryption | Database |

---

## 🚀 Next Steps

1. ✅ Password reset implemented
2. ✅ Emails configured
3. ⬜ (Optional) Add "Change Password" to dashboard
4. ⬜ (Optional) Add 2FA (Two-Factor Auth)
5. ⬜ (Optional) Password strength validator

**Your portfolio is now secure with password reset functionality!** 🔐


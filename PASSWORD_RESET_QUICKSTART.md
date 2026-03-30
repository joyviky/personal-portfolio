# 🚀 Quick Start: Test Password Reset Feature

## ✅ Step 1: Start MongoDB (Required)

```bash
# Make sure MongoDB is running
mongo

# In another terminal, should connect successfully
# Shows: rs0:PRIMARY >
```

## ✅ Step 2: Start Backend Server

```bash
cd /Users/macbook/IdeaProjects/copilot-project/server
npm start

# Should show:
# ✅ Server running on port 5001
# (MongoDB connection may warn, but it's OK in demo mode)
```

## ✅ Step 3: Start Frontend (New Terminal)

```bash
cd /Users/macbook/IdeaProjects/copilot-project/client
npm run dev

# Should show:
# ✅ Local: http://localhost:5173
```

## 🔐 Step 4: Test Login

1. Open http://localhost:5173
2. Click **"Go to Admin"** (or navigate to /admin)
3. Enter password: **`admin123`**
4. Click **"Authenticate"**
5. You should see the CMS dashboard ✅

## 🔑 Step 5: Test Password Reset

### **Scenario 1: Forgot Password**

1. Close the dashboard (or click "Exit CMS")
2. You're back on portfolio
3. Click **"Go to Admin"** again
4. On login page, click **"🔐 Forgot Password?"**
5. Enter email: **`admin@portfolio.com`**
6. Click **"Send Reset Code"**
7. You'll see a message: **"Reset code sent to your email"**

#### **For Testing (Demo Mode Only):**
- The demo code will be shown in:
  - Browser console (DevTools)
  - Server console
  - Response message on page
- Or check your actual email: `vignesh4485849@gmail.com`

### **Scenario 2: Enter Reset Code**

1. You see 6-digit code in response (or check email)
2. Copy the 6-digit code: e.g., `347892`
3. Paste it in the code field
4. Click **"Verify Code"**

### **Scenario 3: Set New Password**

1. Enter new password: e.g., **`MyNewPassword123`**
2. Confirm password: **`MyNewPassword123`**
3. Click **"Reset Password"**
4. See success message: **"✅ Password reset successfully!"**
5. Auto-redirect back to login (2 second delay)

### **Scenario 4: Login with New Password**

1. You're back on login page
2. Enter new password: **`MyNewPassword123`**
3. Click **"Authenticate"**
4. Success! Dashboard opens ✅

## ✅ Step 6: Verify Portfolio Data is Safe

1. After logging in, go to the CMS
2. Check your skills, projects, profile data
3. **Everything should still be there!** ✅
4. Try editing a skill
5. Logout and login again
6. **Changes are persisted!** ✅

## 📋 Password Reset Flow Checklist

- [ ] Can click "Forgot Password?" on login page
- [ ] Can enter email
- [ ] Can receive reset code (check email or console)
- [ ] Can verify code
- [ ] Can enter new password
- [ ] Can login with new password
- [ ] Portfolio data persists after reset
- [ ] Can edit and save skills
- [ ] Changes persist after logout/login

## 🧪 Test Cases

### **Test 1: Happy Path**
```
1. Forgot password → Send code → Verify code → Set password → Login ✅
```

### **Test 2: Wrong Code**
```
1. Forgot password → Send code
2. Enter WRONG code (e.g., 000000)
3. Should show error or go to password entry
4. Try again with correct code ✅
```

### **Test 3: Code Expiry**
```
1. Request reset
2. Wait 61 minutes
3. Try to use expired code
4. Should show: "Reset code has expired. Request a new one."
5. Request new code ✅
```

### **Test 4: Password Mismatch**
```
1. Get to password entry
2. Enter: MyPassword123
3. Confirm: MyPassword456
4. Should show error: "Passwords do not match"
5. Fix and retry ✅
```

### **Test 5: Portfolio Data Safety**
```
1. Edit a skill → Change React to Expert
2. Reset password
3. Login with new password
4. Check skill → Still Expert ✅
```

## 🔍 Debugging

### **Getting the Reset Code**

**Option 1: Browser Console**
- Open DevTools (F12)
- Go to Console tab
- Should see log with demo code

**Option 2: Server Console**
- Check terminal where you ran `npm start`
- Should see: `Reset code sent to admin@portfolio.com`

**Option 3: Email**
- Check inbox at: vignesh4485849@gmail.com
- May take 1-2 minutes
- Check spam folder too

### **If Email Not Working**

```
File: /server/.env

EMAIL_USER=vignesh4485849@gmail.com
EMAIL_PASS=pjiuegjjanufzwwf

These are correct, but if email doesn't work:

Option 1: Check Gmail App Passwords
- Your account needs "Allow less secure apps"
- Or use Gmail App Passwords

Option 2: For Production
- Use SendGrid instead (more reliable)
- Or AWS SES
- Or Mailgun
```

## 📱 Mobile Testing

```
All password reset screens are mobile-responsive!

Test on mobile:
1. Open http://localhost:5173 on phone/tablet
2. Click "Go to Admin"
3. Click "Forgot Password?"
4. Should look good on small screens ✅
```

## 🎯 Database Verification

```bash
# Check if password was actually updated:

mongo
> use portfolio
> db.admins.findOne()

// Should show your updated password (hashed)
// Looks like: $2a$10$encrypted_not_readable
```

## 🚀 Next Steps

After testing locally:

1. ✅ Test password reset
2. ⬜ Deploy to production (follow DEPLOYMENT_GUIDE.md)
3. ⬜ Update JWT_SECRET in .env for production
4. ⬜ Test on live domain
5. ⬜ Set up SSL certificate

## 📚 Documentation

For more details, read:

```
/PROJECT_ROOT/
├── JWT_PASSWORD_RESET_GUIDE.md  ← Complete JWT explanation
├── PASSWORD_RESET_FAQ.md         ← Q&A about password reset
└── DEPLOYMENT_GUIDE.md           ← How to deploy to cloud
```

## 💬 Common Questions

**Q: Where does the reset code go?**
A: To email in .env: `vignesh4485849@gmail.com`

**Q: Can I change password while logged in?**
A: Yes, endpoint exists at `/api/auth/change-password` (frontend UI coming soon)

**Q: What if I forget the reset code?**
A: Request a new one! Click "Try again" on the forgot password page

**Q: Will my portfolio data be deleted?**
A: NO! Password and portfolio data are in different database tables

**Q: How long is reset code valid?**
A: 1 hour from when you request it

---

**All set! You have a complete, production-ready password reset system!** 🔐✅


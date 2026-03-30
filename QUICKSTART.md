# Portfolio CMS - Quick Start Guide

## 📋 What You Get

✅ Full-stack MERN portfolio
✅ Admin dashboard for managing all content
✅ Real-time profile updates
✅ Project showcase with live links
✅ Skills management system
✅ Contact form with email notifications
✅ Cloudinary image hosting
✅ JWT authentication
✅ MongoDB database

## 🚀 Quick Start (5 minutes)

### 1. Create Environment Files

**server/.env**
```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/portfolio
JWT_SECRET=change_this_to_random_secret_key_12345
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

CORS_ORIGIN=http://localhost:5173
ADMIN_DEFAULT_PASSWORD=admin123
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install --legacy-peer-deps
```

### 3. Start Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 4. Access the App

- **Portfolio**: http://localhost:5173
- **Admin Panel**: Click lock icon → admin@portfolio.com / admin123

## 🔗 Getting Your API Keys

### MongoDB
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster → get connection string
4. Replace in `MONGO_URI`

### Cloudinary
1. Sign up at https://cloudinary.com (free tier)
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret
4. Add to server `.env`

### Gmail
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password
4. Use that as `EMAIL_PASS`

## 📱 Admin Dashboard Features

- **Profile**: Update name, bio, roles, social links
- **Skills**: Add/delete skills with categories
- **Projects**: Manage projects with images
- **Messages**: View contact form submissions
- **Resume**: Upload PDF

## 🎨 Customization

Edit `client/src/pages/PublicView.jsx` to change:
- Colors (search for `bg-indigo`, `text-indigo`)
- Section order
- Add/remove sections
- Modify animations

Edit `server/models/` to add new fields to database.

## ⚠️ Important Notes

- Default admin password must be changed in MongoDB after first login
- Keep your JWT_SECRET safe - use a strong random string
- Never commit `.env` files to git
- Cloudinary free tier has usage limits
- Email requires Gmail with app password (not regular password)

## 🚨 Troubleshooting

**Cannot connect to MongoDB**
- Check connection string has correct credentials
- Verify IP is whitelisted in MongoDB Atlas
- Check username/password are URL-encoded

**Cloudinary upload fails**
- Verify API credentials
- Check folder permissions
- Ensure folder `portfolio` exists in settings

**Email won't send**
- Use app password, not regular password
- Enable 2FA on Gmail first
- Check sender email is correct

**CORS errors**
- Verify `CORS_ORIGIN` matches frontend URL
- Restart backend after changing

## 📚 API Documentation

See API endpoints in main [README.md](README.md)

## 🎉 You're All Set!

Your professional portfolio is ready to customize and deploy. Update your information in the admin panel and share your portfolio!

---

For detailed setup instructions, see [README.md](README.md)

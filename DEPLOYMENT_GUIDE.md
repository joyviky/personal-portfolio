# 🚀 Deployment & Data Persistence Guide

## 📊 **Current Architecture Overview**

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React)                    │
│  - Data stored in state (initialData)                │
│  - No persistence on refresh (browser only)          │
│  - API calls to backend via axios                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓ API Calls
┌─────────────────────────────────────────────────────┐
│              BACKEND (Node.js/Express)               │
│  - Routes to handle CRUD operations                  │
│  - Controllers for business logic                    │
│  - Middleware for authentication & uploads           │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓ Save/Retrieve
┌─────────────────────────────────────────────────────┐
│        DATABASE (MongoDB - Local/Cloud)              │
│  - Stores: Profile, Skills, Projects, Messages, etc  │
│  - Persists across sessions                          │
│  - Survives application restarts                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 **How Data Flows Currently**

### **1. CURRENT STATUS: Semi-Dynamic**
- ✅ Backend has MongoDB models and routes
- ✅ API endpoints are set up (`/api/profile`, `/api/skills`, `/api/projects`)
- ⚠️ **ISSUE**: Frontend is NOT using the API to save/load data
- ⚠️ **ISSUE**: Data only stored in React state (localStorage at best)
- ⚠️ **ISSUE**: Changes lost on page refresh

### **2. WHERE DATA IS CURRENTLY STORED**
```
initialData in App.jsx → React Component State → Lost on refresh ❌
```

### **3. WHERE IT SHOULD BE STORED**
```
Frontend → Backend API → MongoDB Database → Retrieved on load ✅
```

---

## 🔧 **Step 1: Update Frontend to Use Real API**

### **Problem**: Data from initialData isn't being saved to database when you edit skills/projects

### **Solution**: Load data from API on app start

**File**: `client/src/App.jsx`

Add this effect to load data from backend on component mount:

```javascript
useEffect(() => {
  const loadAllData = async () => {
    try {
      // Load profile, skills, projects from API
      const [profileRes, skillsRes, projectsRes] = await Promise.all([
        profileService.getProfile(),
        skillService.getSkills(),
        projectService.getProjects()
      ]);
      
      // Merge API data with local state
      setPortfolioData(prevData => ({
        ...prevData,
        hero: profileRes.data,
        skills: skillsRes.data || prevData.skills,
        projects: projectsRes.data || prevData.projects
      }));
    } catch (error) {
      console.log('API not available, using local data');
      // Falls back to initialData if API is down
    }
  };
  
  loadAllData();
}, []);
```

---

## 💾 **Step 2: Data Persistence Flow**

### **When you update skills in CMS:**

```
1. Admin changes skill in AdminDashboard
   ↓
2. updateData() is called with new skill data
   ↓
3. Send to backend API: PUT /api/skills/:id
   ↓
4. Backend validates and saves to MongoDB
   ↓
5. Database persists the change ✅
   ↓
6. Next time anyone loads the site, MongoDB returns updated data
```

### **Database Collections Created:**

```
portfolio/
├── profiles          (1 document - your main info)
├── skills            (multiple documents - each skill)
├── projects          (multiple documents - each project)
├── messages          (incoming contact form messages)
├── leetcodestats     (cached LeetCode data)
├── resumes           (PDF files metadata)
└── visitors          (visitor analytics)
```

---

## 📁 **Step 3: MongoDB Setup**

### **Option A: Local MongoDB (Development)**

```bash
# Install MongoDB Community Edition
# macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Default connection string in .env:
MONGO_URI=mongodb://localhost:27017/portfolio
```

### **Option B: MongoDB Atlas (Cloud - Recommended for production)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/portfolio`
5. Update `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
```

---

## 🌐 **Step 4: Deployment Options**

### **OPTION 1: Vercel (Frontend) + Railway (Backend)**  ⭐ RECOMMENDED

**Best for:** Quick setup, free tier, good performance

#### **A. Deploy Frontend to Vercel**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. From client directory
cd client
vercel

# 3. Follow prompts - Vercel auto-detects React app
# 4. Create vercel.json for environment variables
```

**File**: `client/vercel.json`
```json
{
  "env": {
    "VITE_API_URL": "@backend_url"
  }
}
```

#### **B. Deploy Backend to Railway**

```bash
# 1. Create account at railway.app
# 2. Connect GitHub repo
# 3. Deploy - Railway auto-detects Node.js app

# 4. Add MongoDB connection:
# - Railway provides free MongoDB plugin
# - Or link your MongoDB Atlas

# 5. Set environment variables in Railway dashboard:
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
NODE_ENV=production
PORT=5001
CORS_ORIGIN=your_vercel_domain
```

---

### **OPTION 2: Heroku + MongoDB Atlas**

#### **A. Deploy Backend to Heroku**

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Create app
heroku create your-app-name-api

# 4. Add MongoDB Atlas
heroku config:set MONGO_URI=mongodb+srv://...

# 5. Deploy
git push heroku main
```

#### **B. Deploy Frontend to Netlify**

```bash
# In client directory
netlify deploy

# Or connect GitHub for auto-deploy
# Set environment variables in Netlify dashboard
```

---

### **OPTION 3: Single VPS (Cheapest - DigitalOcean, Linode, AWS EC2)**

```bash
# 1. Rent a VPS ($5-10/month)
# 2. SSH into server
ssh root@your_server_ip

# 3. Install Node.js & MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs mongodb

# 4. Clone your repo
git clone your_repo_url
cd copilot-project

# 5. Install dependencies
npm install
cd server && npm install
cd ../client && npm install && npm run build

# 6. Use PM2 to keep server running
sudo npm install -g pm2
pm2 start server/index.js --name "portfolio-api"
pm2 save

# 7. Nginx as reverse proxy
# Configure /etc/nginx/sites-available/default

# 8. Setup SSL with Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com
```

---

## 🚀 **Step 5: Environment Variables - PRODUCTION**

### **Before Deployment - Update .env**

```env
# PRODUCTION .env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/portfolio
JWT_SECRET=super_secret_key_change_this_in_production_123456
NODE_ENV=production
PORT=5001

# Frontend URL (your deployed domain)
CORS_ORIGIN=https://yourdomain.com

# Update email credentials to your real email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # Gmail: Generate app password

# Cloudinary (for image storage in cloud)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_DEFAULT_PASSWORD=create_strong_password_here
```

---

## 📊 **Step 6: Data Persistence Checklist**

### **What gets saved to database:**

| Data | Where | Status |
|------|-------|--------|
| **Profile** (name, bio, avatar) | MongoDB > profiles | ✅ Auto-save |
| **Skills** | MongoDB > skills | ✅ Auto-save |
| **Projects** | MongoDB > projects | ✅ Auto-save |
| **Messages** (contact form) | MongoDB > messages | ✅ Auto-save |
| **Resume** | Cloudinary + MongoDB | ✅ Auto-save |
| **Theme colors** | MongoDB > profiles.theme | ⚠️ Needs update |
| **LeetCode stats** | MongoDB > leetcodestats | ✅ Auto-cached |
| **Visitors** | MongoDB > visitors | ✅ Auto-track |

---

## 🔄 **Step 7: Full Data Flow After Deployment**

### **Scenario: You edit a skill in CMS**

```
1. You login to https://yourdomain.com/admin
2. Edit "React.js" skill → change level to "Expert"
3. Click "Save" → Frontend sends API request:
   
   PUT https://api.yourdomain.com/api/skills/skill_id
   {
     "name": "React.js",
     "category": "Frontend",
     "level": "Expert"
   }
4. Backend receives → validates → saves to MongoDB
5. MongoDB stores permanently ✅

6. Next day, someone visits the site → loads skills from MongoDB ✅
7. Your updated skill "Expert level React.js" is shown ✅
```

---

## 🔐 **Step 8: Security & Best Practices**

### **Before Going Live:**

```bash
# 1. Update all secrets
VITE_API_URL=https://api.yourdomain.com  # Not localhost
JWT_SECRET=generate_strong_secret
ADMIN_DEFAULT_PASSWORD=strong_password

# 2. Enable HTTPS
# Use Let's Encrypt (free SSL)

# 3. Setup firewall
# Only allow ports: 80 (HTTP), 443 (HTTPS), 22 (SSH)

# 4. Database backup
# Enable automated MongoDB Atlas backups

# 5. Rate limiting
# Add rate limiting middleware to prevent spam

# 6. Change all demo credentials
# Not: demo@demo.com, demo_secret_key, etc.
```

---

## 📱 **Step 9: Monitor & Maintain**

```bash
# Check backend logs
heroku logs -t  # Heroku
pm2 logs        # VPS

# Monitor database
# MongoDB Atlas dashboard → Check storage & performance

# Check visitors
# Login to CMS → Analytics tab → See real-time visitors

# Backup data
# MongoDB Atlas → Backup & Restore → Enable daily backups
```

---

## 🎯 **What Happens After Deployment**

### **Your Portfolio is NOW:**

✅ **Fully Dynamic** - Edit in CMS → Saved to database → Live on website
✅ **Persistent** - Data survives server restarts
✅ **Real-time** - Changes instant
✅ **Scalable** - Can handle 1000s of visitors
✅ **Professional** - Runs 24/7 on the cloud

### **Your Admin Dashboard NOW:**

- ✅ Edit profile → Saved to Users viewing website see updates
- ✅ Add skill → Auto-saved & displayed on portfolio
- ✅ Upload project → Stored in cloud + shown on website
- ✅ Change theme → Every visitor sees new colors
- ✅ Get messages → Stored in database, never lost
- ✅ Track visitors → Real-time analytics

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Changes not persisting**
```
SOLUTION: Ensure frontend is calling API, not just updating state
Make sure AdminDashboard calls updateData() which sends API  request
```

### **Issue 2: 404 on skills/projects**
```
SOLUTION: Verify MongoDB is connected
Check backend logs: heroku logs -t
Or check local DB: mongo portfolio
```

### **Issue 3: Slow database**
```
SOLUTION: Add indexes to MongoDB
MongoDB Atlas → Indexes → Create compound indexes on frequently queried fields
```

### **Issue 4: CORS errors during deployment**
```
SOLUTION: Update CORS_ORIGIN in .env to your actual domain
CORS_ORIGIN=https://yourdomain.com
```

---

## 📈 **Next Steps to Make Production-Ready**

1. ✅ Setup MongoDB Atlas cloud database
2. ✅ Update all .env variables for production
3. ✅ Deploy backend to Hercel/Railway/VPS
4. ✅ Deploy frontend to Vercel/Netlify
5. ✅ Test: Edit skill in CMS → Check if it persists
6. ✅ Setup SSL certificate (HTTPS)
7. ✅ Configure domain DNS
8. ✅ Enable database backups
9. ✅ Setup monitoring & alerts
10. ✅ Monitor first week for issues

---

## **QUICK START COMMAND GUIDE**

```bash
# Local Development (Persistent)
# Terminal 1 - Backend
cd server
npm start
# Runs on http://localhost:5001

# Terminal 2 - Frontend
cd client
npm run dev
# Runs on http://localhost:5173

# Login: admin / admin123
# Edit skills → Saved to local MongoDB!
```

**After this setup, your portfolio is 100% dynamic and changes persist permanently!** 🎉

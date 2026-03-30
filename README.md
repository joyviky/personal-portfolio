# 🎨 Professional MERN Portfolio with Dynamic Admin CMS

A fully responsive, production-ready portfolio website built with React, Node.js, Express, and MongoDB. Features a beautiful dark-themed UI with a powerful admin dashboard for managing all content without coding.

## ✨ Features

### 🎯 Frontend (React + Tailwind CSS)
- **Premium Dark UI** - Modern glassmorphism design with smooth animations
- **Hero Section** - Typing animation, profile image, social links
- **Skills Section** - Dynamic skill cards with categories and levels
- **Projects Showcase** - Featured projects with hover effects and live/GitHub links
- **Resume Management** - Download capability with file management
  **Contact Form** - Email messaging with admin notifications
- **Responsive Design** - Mobile-first approach, works perfectly on all devices
- **Smooth Animations** - Framer Motion & custom CSS animations

### 🔐 Admin Dashboard
- **Secure Authentication** - JWT-based login system
- **Profile Management** - Edit name, bio, roles, social links
- **Skill Management** - Add/edit/delete skills with categories
- **Project Management** - Full CRUD for projects with image uploads
- **Message Management** - View and manage contact form submissions
- **Cloudinary Integration** - Cloud-based file uploads for images

### 🗄️ Backend (Node.js + Express + MongoDB)
- **RESTful API** - Well-structured endpoints for all features
- **Authentication** - JWT token-based secure access
- **Database Models** - Optimized MongoDB schemas
- **File Uploads** - Cloudinary integration for media management
- **Email Notifications** - Automatic email alerts for new messages
- **Error Handling** - Comprehensive error management and validation

## 📋 Project Structure

```
copilot-project/
├── server/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── Admin.js             # Admin user schema
│   │   ├── Profile.js           # Hero section data
│   │   ├── Skill.js             # Skills data
│   │   ├── Project.js           # Projects data
│   │   ├── Resume.js            # Resume file data
│   │   ├── Message.js           # Contact form messages
│   │   └── LeetCodeStats.js     # Cached LeetCode stats
│   ├── controllers/
│   │   ├── authController.js    # Login & authentication
│   │   ├── profileController.js # Profile CRUD
│   │   ├── skillController.js   # Skills CRUD
│   │   ├── projectController.js # Projects CRUD
│   │   ├── messageController.js # Messages & email
│   │   └── leetcodeController.js # LeetCode API integration
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── upload.js            # Cloudinary upload middleware
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── profile.js           # Profile endpoints
│   │   ├── skills.js            # Skills endpoints
│   │   ├── projects.js          # Projects endpoints
│   │   ├── messages.js          # Messages endpoints
│   │   └── leetcode.js          # LeetCode endpoints
│   ├── index.js                 # Main server file
│   ├── .env.example             # Environment variables template
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── PublicView.jsx      # Portfolio homepage
│   │   │   ├── AdminLogin.jsx      # Admin login page
│   │   │   └── AdminDashboard.jsx  # Admin CMS dashboard
│   │   ├── components/
│   │   │   ├── BentoCard.jsx       # Card component
│   │   │   ├── CircularProgress.jsx # Progress indicator
│   │   │   └── TypingAnimation.jsx  # Typing effect
│   │   ├── services/
│   │   │   └── api.js              # API calls & axios setup
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Tailwind styles
│   ├── .env.example                # Environment variables
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── package.json
│
└── README.md
```

## 🚀 Prerequisites

Before getting started, ensure you have:
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)
- Cloudinary account (free tier for file uploads)
- Gmail account (for email notifications)

## 🔧 Setup Instructions

### 1. Clone & Install Dependencies

```bash
# Navigate to server directory
cd server
npm install

# Navigate to client directory
cd ../client
npm install
```

### 2. Backend Configuration

Create `.env` file in the `server/` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_me
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Cloudinary Configuration (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_google_app_password

# Admin Default Password
ADMIN_DEFAULT_PASSWORD=admin123

# Optional: LeetCode Username
LEETCODE_USERNAME=your_leetcode_username
```

**Getting Gmail App Password:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select Mail and Windows Computer
4. Copy the generated 16-character password

### 3. Frontend Configuration

Create `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup

1. Create a MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Update `MONGO_URI` in server `.env`

### 5. Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, and API Secret
4. Update in server `.env`

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🔐 Admin Login Credentials

- **Email:** admin@portfolio.com
- **Password:** admin123

**Important:** Change these credentials in MongoDB immediately after first login!

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login to admin panel
- `GET /api/auth/me` - Get current admin (protected)

### Profile
- `GET /api/profile` - Get profile data
- `PUT /api/profile` - Update profile (protected)
- `POST /api/profile/resume` - Upload resume (protected)

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill (protected)
- `PUT /api/skills/:id` - Update skill (protected)
- `DELETE /api/skills/:id` - Delete skill (protected)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)

### Messages
- `POST /api/messages` - Submit contact form (public)
- `GET /api/messages` - Get all messages (protected)
- `PUT /api/messages/:id/read` - Mark message as read (protected)
- `DELETE /api/messages/:id` - Delete message (protected)

### LeetCode
- `GET /api/leetcode?username=<username>` - Fetch LeetCode stats

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.js` to customize the color scheme:
```js
theme: {
  extend: {
    colors: {
      indigo: { ... },
      purple: { ... },
    },
  },
},
```

### Modifying Sections
- Hero Section: `client/src/pages/PublicView.jsx` (lines 100-180)
- Skills Section: (lines 262-305)
- Projects Section: (lines 307-395)
- Resume Section: (lines 397-450)
- Contact Section: (lines 452-530)

### Adding New Features
1. Create API endpoint in backend
2. Add service method in `client/src/services/api.js`
3. Create React component using the service
4. Add admin panel controls in `AdminDashboard.jsx`

## 📦 Deployment

### Deploy Backend (Heroku, Railway, Render)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Deploy Frontend (Vercel, Netlify)
1. Build the project: `npm run build`
2. Deploy `dist/` folder to hosting platform
3. Update `VITE_API_URL` to production backend URL

**Example for Vercel:**
```bash
npm install -g vercel
vercel
# Follow prompts and deploy
```

## 🐛 Troubleshooting

### Cloudinary Upload Fails
- Check API credentials
- Ensure folder path exists in Cloudinary

### Email Not Sending
- Verify Gmail app password is correct
- Enable "Less secure apps" if needed (though app password is better)

### MongoDB Connection Error
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure MongoDB credentials are URL-encoded

### CORS Error
- Update `CORS_ORIGIN` in server `.env` to match frontend URL
- Add `/api` prefix to all API calls

## 📞 Support & Contact

For issues or questions:
1. Check the troubleshooting section
2. Review environment variables
3. Check browser console for errors
4. Verify all dependencies are installed

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Visitor analytics
- [ ] Blog section
- [ ] AI chatbot
- [ ] Timeline/Journey section
- [ ] Social media feed integration
- [ ] Google Analytics integration
- [ ] Multi-language support

---

**Made with ❤️ for developers who want their portfolio to stand out.**

#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Portfolio CMS Setup Guide ===${NC}\n"

echo -e "${YELLOW}Step 1: Server Configuration${NC}"
echo "Create a .env file in the server/ directory with the following variables:"
cat > server/.env.example << 'EOF'
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
JWT_SECRET=your_super_secret_jwt_key_here_change_me
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

LEETCODE_USERNAME=your_leetcode_username

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_google_app_password

ADMIN_DEFAULT_PASSWORD=admin123

CORS_ORIGIN=http://localhost:5173
EOF
echo -e "${GREEN}✓ server/.env.example created${NC}\n"

echo -e "${YELLOW}Step 2: Client Configuration${NC}"
cat > client/.env.example << 'EOF'
VITE_API_URL=http://localhost:5000/api
EOF
echo -e "${GREEN}✓ client/.env.example created${NC}\n"

echo -e "${YELLOW}Step 3: Installation${NC}"
echo "Run these commands to install dependencies:"
echo -e "${BLUE}cd server && npm install${NC}"
echo -e "${BLUE}cd ../client && npm install --legacy-peer-deps${NC}\n"

echo -e "${YELLOW}Step 4: Create .env files${NC}"
echo "Copy the .env.example files and fill in your credentials:"
echo -e "${BLUE}cp server/.env.example server/.env${NC}"
echo -e "${BLUE}cp client/.env.example client/.env${NC}\n"

echo -e "${YELLOW}Step 5: Start Development Servers${NC}"
echo "Terminal 1: cd server && npm run dev"
echo "Terminal 2: cd client && npm run dev\n"

echo -e "${GREEN}Setup complete! Visit http://localhost:5173${NC}"
echo -e "${BLUE}Admin Login: admin@portfolio.com / admin123${NC}\n"

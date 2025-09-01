# Free Deployment Guide

## 1. MongoDB Atlas Setup
1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create new cluster (M0 Sandbox - FREE)
4. Create database user
5. Whitelist IP (0.0.0.0/0 for all IPs)
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/ecommerce`

## 2. Backend Deployment (Railway)
1. Go to https://railway.app
2. Connect GitHub account
3. Deploy from GitHub repo
4. Add environment variables:
   - NODE_ENV=production
   - MONGODB_URI=your_atlas_connection_string
   - JWT_SECRET=your_secret_key
   - CLOUDINARY_CLOUD_NAME=dq2w8ojur
   - CLOUDINARY_API_KEY=835656277611691
   - CLOUDINARY_API_SECRET=guvrgOt6JygWSFPFcOL1Wd8NTpM
   - EMAIL_USER=brandrkhanofficial@gmail.com
   - EMAIL_PASS=qiye hnss llxz kevg
   - PAYFAST_MERCHANT_ID=10039387
   - PAYFAST_MERCHANT_KEY=3dwzhbs5xcnpi
   - PAYFAST_PASSPHRASE=umarcheemapunjabian

## 3. Frontend Deployment (Vercel)
1. Go to https://vercel.com
2. Connect GitHub account
3. Import frontend folder
4. Add environment variables:
   - VITE_API_URL=your_railway_backend_url

## 4. Alternative: Render (Backend)
1. Go to https://render.com
2. Connect GitHub
3. Create Web Service
4. Add environment variables (same as Railway)

## 5. Alternative: Netlify (Frontend)
1. Go to https://netlify.com
2. Drag & drop build folder or connect GitHub
3. Add environment variables
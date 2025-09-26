# BrandsRkhan E-commerce Platform

A full-stack e-commerce platform for premium products with React frontend and Node.js backend.

## Project Structure

```
saad website ecomerce/
├── backend/           # Node.js Backend API
│   ├── config/        # Database & app configuration
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Authentication & validation
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── utils/         # Helper functions
│   ├── server.js      # Main server file
│   └── package.json   # Backend dependencies
│
├── frontend/          # React Frontend
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── vite.config.js # Vite configuration
│
└── README.md          # This file
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
MONGODB_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:5000
```

## Deployment

Update environment variables with your production URLs when deploying to cloud platforms.

## Features

- User authentication & authorization
- Product catalog with categories
- Shopping cart & checkout
- Order management
- Admin dashboard
- Email notifications
- PDF invoice generation
- Offer & discount system
- Payment integration (PayFast)
- Image upload (Cloudinary)

## Tech Stack

**Frontend:** React, Material-UI, Redux Toolkit, Vite
**Backend:** Node.js, Express, MongoDB, JWT
**Services:** Cloudinary, NodeMailer, PDFKit
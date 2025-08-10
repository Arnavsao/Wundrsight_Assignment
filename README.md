# Wundrsight - Appointment Booking App

A full-stack appointment booking application built with the MERN stack for a small clinic.

## Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with role-based access control
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (Frontend) + Render (Backend) + MongoDB Atlas

### Trade-offs Made

- **MongoDB over PostgreSQL**: Chose MongoDB for faster development and flexible schema, though PostgreSQL would be better for complex relationships and ACID compliance
- **JWT over Sessions**: JWT for stateless authentication, though sessions would provide better security control
- **Vite over Create React App**: Faster build times and modern tooling

## Project Structure

```
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared types and utilities
└── docs/            # Documentation and API specs
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Vercel account (free tier)
- Render account (free tier)

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/slots` - Get available time slots
- `POST /api/book` - Book an appointment
- `GET /api/my-bookings` - Get user's bookings (Patient only)
- `GET /api/all-bookings` - Get all bookings (Admin only)

## Test Credentials

- **Patient**: patient@example.com / Passw0rd!
- **Admin**: admin@example.com / Passw0rd!

## Deployment Steps

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy with Node.js build command: `npm start`

### Frontend (Vercel)
1. Import GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

## Known Limitations & Next Steps

- Basic error handling and validation
- No rate limiting implemented
- Limited timezone support (UTC only)
- Basic UI without advanced features

### With 2 More Hours:
- Implement rate limiting and brute force protection
- Add comprehensive error handling and logging
- Implement real-time updates with WebSockets
- Add comprehensive testing suite
- Enhance UI/UX with better styling and animations

## Verification Commands

```bash
# Register a new user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get available slots
curl -X GET "http://localhost:5000/api/slots?from=2025-01-20&to=2025-01-27"

# Book a slot (use token from login)
curl -X POST http://localhost:5000/api/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"slotId":"SLOT_ID_HERE"}'

# Get user bookings
curl -X GET http://localhost:5000/api/my-bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

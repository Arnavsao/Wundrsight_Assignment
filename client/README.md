# Wundrsight Frontend

A React-based frontend for the Wundrsight Appointment Booking App.

## Features

- **User Authentication**: Login and registration with JWT tokens
- **Patient Dashboard**: View available slots, book appointments, and manage bookings
- **Admin Dashboard**: View all bookings and manage booking statuses
- **Responsive Design**: Built with Tailwind CSS for mobile-first design
- **Real-time Updates**: Instant feedback with toast notifications
- **Protected Routes**: Role-based access control (Patient vs Admin)

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see server README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend URL:
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── context/            # React context providers
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── PatientDashboard.jsx
│   └── AdminDashboard.jsx
├── utils/              # Utility functions
│   └── api.js
├── hooks/              # Custom React hooks
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Test Accounts

- **Patient**: patient@example.com / Passw0rd!
- **Admin**: admin@example.com / Passw0rd!

## Features in Detail

### Authentication
- JWT-based authentication
- Persistent login state
- Role-based access control
- Automatic token refresh handling

### Patient Features
- View available slots for next 7 days
- Book available time slots
- View personal booking history
- Cancel confirmed bookings

### Admin Features
- View all patient bookings
- Update booking statuses
- Manage appointment confirmations
- Overview of clinic schedule

## API Integration

The frontend integrates with the backend API endpoints:

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/slots/next-week` - Available slots
- `POST /api/book` - Book appointment
- `GET /api/my-bookings` - User's bookings
- `GET /api/all-bookings` - All bookings (admin)
- `PATCH /api/bookings/:id/status` - Update status (admin)

## Styling

Built with Tailwind CSS v4 for:
- Responsive design
- Consistent spacing and colors
- Modern UI components
- Dark/light theme support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Code Style
- ESLint configuration included
- Prettier formatting
- Component-based architecture
- Custom hooks for reusable logic

### State Management
- React Context for global state
- Local state for component-specific data
- Optimistic updates for better UX

## Deployment

The app can be deployed to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static hosting service

Build command: `npm run build`
Output directory: `dist/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

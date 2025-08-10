const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const slotRoutes = require('./routes/slots');
const bookingRoutes = require('./routes/bookings');
const { seedAdminUser, generateSlots } = require('./utils/seeder');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});
app.use('/api/', limiter);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

app.use('/api', authRoutes);
app.use('/api', slotRoutes);
app.use('/api', bookingRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    });
  }
  
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists'
      }
    });
  }
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong on our end'
    }
  });
});

const startServer = async () => {
  try {
    // Always start listening on the port first
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });

    // Then try to connect to database
    try {
      await connectDB();
      console.log('✅ Database connected successfully');
      
      // Only seed data in development
      if (process.env.NODE_ENV !== 'production') {
        await seedAdminUser();
        await generateSlots();
        console.log('✅ Development data seeded');
      }
    } catch (dbError) {
      console.error('⚠️ Database connection failed:', dbError.message);
      console.log('🔄 Server will continue running without database connection');
      console.log('📝 Make sure MONGODB_URI environment variable is set');
    }

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

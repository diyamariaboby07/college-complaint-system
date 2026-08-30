import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { User } from './models/User.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

initSocket(io);

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or allowed origins
      if (!origin || [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'].includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/local
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'College Complaint Management System API',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Helper to ensure at least 1 Admin account exists on server start
const ensureDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Campus Administrator',
        email: 'admin@college.edu',
        password: 'Admin@123',
        department: 'Administration',
        role: 'admin',
      });
      console.log('🛡️ Default Admin created: admin@college.edu / Admin@123');
    }
  } catch (err) {
    console.warn('Admin account verification warning:', err.message);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();

  const listen = (portToTry) => {
    server.listen(portToTry, () => {
      console.log(`
🚀 ============================================================
🎓 College Complaint Management System — Server Active
📡 Port: ${portToTry}
🌍 Client URL: ${env.CLIENT_URL}
🔗 Health: http://localhost:${portToTry}/api/health
============================================================
      `);
    });

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${portToTry} is in use, attempting port ${portToTry + 1}...`);
        setTimeout(() => {
          server.close();
          listen(portToTry + 1);
        }, 1000);
      } else {
        console.error('Server error:', e);
      }
    });
  };

  listen(Number(env.PORT) || 5000);
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

export { app, server };

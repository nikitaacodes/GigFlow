import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from './models/User.js';

// Store user socket connections: userId -> socketId
const userSockets = new Map();

// Export function to emit notifications
let emitNotificationFunction = null;

// Socket.io authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    // Get token from handshake auth, query, or cookies
    let token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    // If no token in auth/query, try to get from cookies
    if (!token && socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      token = cookies.token;
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    // Store socket connection
    userSockets.set(userId, socket.id);
    console.log(`User connected: ${socket.user.name} (${userId})`);

    // Handle disconnect
    socket.on('disconnect', () => {
      userSockets.delete(userId);
      console.log(`User disconnected: ${socket.user.name} (${userId})`);
    });
  });

  // Function to emit notification to a specific user
  emitNotificationFunction = (userId, notification) => {
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('notification', notification);
      console.log(`Notification sent to user ${userId}:`, notification);
    } else {
      console.log(`User ${userId} is not connected. Notification will be lost.`);
    }
  };

  return { io };
};

// Export function to emit notifications
export const emitNotification = (userId, notification) => {
  if (emitNotificationFunction) {
    emitNotificationFunction(userId, notification);
  } else {
    console.error('Socket.io not initialized. Cannot send notification.');
  }
};

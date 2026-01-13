import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  const socketOptions = {
    transports: ['websocket', 'polling'],
    withCredentials: true, // This ensures cookies are sent
  };

  // Only add token to auth if provided (for non-HttpOnly cookie scenarios)
  if (token) {
    socketOptions.auth = { token };
  }
  
  socket = io(serverUrl, socketOptions);

  socket.on('connect', () => {
    console.log('Socket.io connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket.io disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

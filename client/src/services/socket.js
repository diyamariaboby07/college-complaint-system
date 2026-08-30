import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

let socket = null;

export const initSocketClient = (user) => {
  if (socket) {
    socket.disconnect();
  }

  try {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server:', socket.id);
      if (user && user._id) {
        socket.emit('join', user._id);
        if (user.role === 'admin') {
          socket.emit('join_admin');
        }
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection note (polling fallback active):', err.message);
    });

    return socket;
  } catch (err) {
    console.warn('Socket initialization error:', err);
    return null;
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

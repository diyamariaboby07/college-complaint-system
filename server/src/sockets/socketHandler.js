let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join user-specific private room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 Socket ${socket.id} joined room user:${userId}`);
      }
    });

    // Join admin room
    socket.on('join_admin', () => {
      socket.join('admin:room');
      console.log(`🛡️ Socket ${socket.id} joined admin:room`);
    });

    socket.on('leave', (userId) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

/**
 * Emit event to specific user and admin room
 */
export const emitSocketEvent = ({ event, data, userId = null, notifyAdmin = false }) => {
  if (!ioInstance) return;

  try {
    if (userId) {
      ioInstance.to(`user:${userId}`).emit(event, data);
    }
    if (notifyAdmin) {
      ioInstance.to('admin:room').emit(event, data);
    }
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }
};

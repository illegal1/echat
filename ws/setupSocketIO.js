const { Server } = require('socket.io');

const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connecion', (socket) => {
    console.log(`A user connected with socket ID: ${socket.id}`);

    socket.on('join-room', (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on('send-message', (data) => {
      console.log(`Message recieved for room ${data.room}: ${data.message}`);

      io.to(data.room).emit('send-message-response', {
        message: data.message,
        author: data.author,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected ${socket.id}`);
    });
  });
};

module.exports = setupSocketIO;

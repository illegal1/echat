const WebSocket = require('ws');
const { v4: uuid } = require('uuid');
const { handleJoinRoom, handleChat } = require('../controllers/chatController');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ noServer: true });
  const clients = new Map();
  server.on('upgrade', (request, socket, head) => {
    let token;

    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookie.parse(cookieHeader);
      token = cookies.jwt;
    }

    if (!token) {
      console.log('WS Auth: No token found in cookie. Rejecting');
      socket.destroy();
      return;
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('WS Auth :Invalid Token. Rejecting');
        socket.destroy();
        return;
      }
      console.log('WS Auth: Token Verified for  user', decoded.username);
      request.user = decoded;

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  });

  //
  const connectioncb = (ws, request) => {
    const user = request.user;
    const userId = request.user.userId;
    console.log(`User connected: ${user.username}`);
    clients.set(userId, { socket: ws, user });
    ws.send(JSON.stringify({ type: 'Welcome', userId }));

    ws.on('message', async (msg) => {
      const data = JSON.parse(msg);

      if (data.type === 'JOIN_ROOM') {
        await handleJoinRoom(ws, user, data);
      }
      if (data.type === 'CHAT') {
        await handleChat(clients, userId, user, data);
      }
    });
    ws.on('close', () => {
      console.log(`User disconnected: ${userId}`);
      clients.delete(userId);
    });
  };
  wss.on('connection', connectioncb);
};

module.exports = setupWebSocket;

const WebSocket = require('ws');
const { v4: uuid } = require('uuid');
const { handleJoinRoom, handleChat } = require('../controllers/chatController');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });
  const clients = new Map();

  //
  const connectioncb = (ws) => {
    const userId = uuid();
    clients.set(userId, { socket: ws, username: null, room: null });
    console.log(`User connected: ${userId}`);
    ws.send(JSON.stringify({ type: 'Welcome', userId }));

    ws.on('message', async (msg) => {
      const data = JSON.parse(msg);
      const user = clients.get(userId);

      if (data.type === 'SET_USERNAME') {
        for (const [, value] of clients) {
          if (value.username === data.username) {
            ws.close(1000, 'Repeated Username');
            return;
          }
        }
        user.username = data.username;
        console.log(`User ${userId} set username to ${data.username}`);
      }

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

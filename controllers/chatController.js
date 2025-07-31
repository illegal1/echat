const Message = require('../models/Message');

const handleJoinRoom = async (ws, user, data) => {
  user.room = data.room;
  const messages = await Message.getRecent(user.room);
  messages.forEach((row) => {
    ws.send(
      JSON.stringify({
        type: 'CHAT',
        message: row.message,
        username: row.username,
        timestamp: row.timestamp,
      }),
    );
  });
  ws.send(JSON.stringify({ type: 'JOINED_ROOM', room: user.room }));
};

async function handleChat(clients, userId, user, data) {
  if (!user.room || !data.message) return;
  for (let [id, client] of clients) {
    if (client.room === user.room && client.socket.readyState === 1) {
      client.socket.send(
        JSON.stringify({
          type: 'CHAT',
          userId,
          username: user.username || 'Anonymous',
          message: data.message,
          timestamp: Date.now(),
          room: user.room,
        }),
      );
    }
  }
  await Message.create(user.room, user.username, data.message);
}

module.exports = { handleJoinRoom, handleChat };

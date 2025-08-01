const Message = require('../models/Message');
const Room = require('../models/Room');

module.exports.handleJoinRoom = async (ws, user, data) => {
  const { room, username, password } = data;

  user.room = data.room;
  const messages = await Message.getRecent(user.room);
  const roomData = await Room.getRoom(room);
  if (roomData.password !== password) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Wrong password' }));
    return ws.close();
  }
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

module.exports.handleChat = async function (clients, userId, user, data) {
  if (!user.room || !data.message) return;
  for (let [id, client] of clients) {
    if (client.user.room === user.room && client.socket.readyState === 1) {
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
};

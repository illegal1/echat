const Message = require('../models/Message');
const Room = require('../models/Room');
const roomState = require('../state/roomState');
const multer = require('multer');
const path = require('path');

module.exports.handleJoinRoom = async (ws, user, data, clients) => {
  const { room, username, password } = data;

  user.room = data.room;
  roomState.addUserToRoom(data.room, user.userId);
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
  const onlineUsers = roomState.getUsersInRoom(data.room);
  ws.send(
    JSON.stringify({
      type: 'JOIN_SUCCESS',
      room: user.room,
      users: onlineUsers,
    }),
  );
  onlineUsers.forEach((member) => {
    if (member.userId !== user.userId) {
      const clientSocket = clients.get(member.userId).socket;

      if (clientSocket && clientSocket.readyState === 1) {
        clientSocket.send(
          JSON.stringify({
            type: 'USER_JOINED',
            users: onlineUsers,
          }),
        );
      }
    }
  });
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

module.exports.handleLeaveRoom = async (clients, user) => {
  const onlineUsers = roomState.getUsersInRoom(user.room);
  if (!onlineUsers) return;
  onlineUsers.forEach((member) => {
    if (member.userId !== user.userId) {
      const clientSocket = clients.get(member.userId).socket;

      if (clientSocket && clientSocket.readyState === 1) {
        clientSocket.send(
          JSON.stringify({
            type: 'USER_LEFT',
            onlineUsers,
          }),
        );
      }
    }
  });
};

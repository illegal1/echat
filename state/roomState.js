const rooms = new Map();
const users = new Map();

const addUser = (userId, userDetails) => {
  users.set(userId, userDetails);
};

const removeUser = (userId) => {
  users.delete(userId);

  for (const [roomId, userSet] of rooms.entries()) {
    if (userSet.has(userId)) {
      userSet.delete(userId);
      if (userSet.size === 0) {
        rooms.delete(roomId);
      }
    }
  }
  console.log(`State: Removed user ${userId} from all rooms`);
};

const addUserToRoom = (roomName, userId) => {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(userId);
  console.log(`State: Added user ${userId} to room ${roomName}`);
};

const getUsersInRoom = (roomName) => {
  if (!rooms.has(roomName)) {
    return null;
  }
  const userIds = Array.from(rooms.get(roomName));
  return userIds
    .map((id) => users.get(id))
    .filter((user) => user !== undefined);
};

module.exports = {
  addUser,
  removeUser,
  addUserToRoom,
  getUsersInRoom,
};

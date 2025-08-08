const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Room = require('./../models/Room');
const roomState = require('../state/roomState');

module.exports.getAllRooms = catchAsync(async (req, res, next) => {
  const rows = await Room.getAllRooms();
  res.status(200).json({ status: 'success', data: rows });
});

module.exports.createRoom = catchAsync(async (req, res, next) => {
  const { name, password } = req.body;
  if (!name || !password)
    return next(new AppError(400, 'Please enter name/password'));

  const result = await Room.createRoom(name, password, req.user.id);

  res.status(200).json({ status: 'success', data: result });
});

module.exports.getOnlineUsers = catchAsync(async (req, res, next) => {
  const roomName = req.params.roomName;
  const usersInRoom = roomState.getUsersInRoom(roomName);
  if (usersInRoom === null) {
    return res
      .status(404)
      .json({ msg: `Room with Name '${roomName}' not found.` });
  }
  res.status(200).json({
    roomName,
    users: usersInRoom,
    count: usersInRoom.length,
  });
});

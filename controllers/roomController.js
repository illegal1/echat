const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Room = require('./../models/Room');

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

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const bcrypt = require('bcryptjs');

const signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return next(new AppError(400, 'Please Enter All info'));
  const user = await User.findUser(username);
  if (user.length !== 0) return next(new AppError(400, 'User already exists'));

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await User.create(username, email, hashedPassword);
  const token = jwt.sign(
    { userId: newUser.id, username: newUser.username },
    process.env.JWT_SECRET,
  );

  res.status(200).json({
    status: 'success',
    data: newUser,
    token,
  });
});

const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return next(new AppError(400, 'Please enter username/password'));

  const user = await User.findUser(username);
  if (!user) return next(new AppError(404, 'No user found'));
  if (!(await bcrypt.compare(password, user.password)))
    return next(new AppError(400, 'Wrong username/password'));

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  res.status(200).json({
    status: 'success',
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
});

module.exports = { signup, login };

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const bcrypt = require('bcryptjs');
const util = require('util');

const sendJWT = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // send only over HTTPS in production
    sameSite: 'lax', // or 'strict'
    maxAge: 60 * 60 * 1000, // 1 hour
  };
  res.cookie('jwt', token, cookieOptions);
};

module.exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return next(new AppError(400, 'Please Enter All info'));
  const user = await User.findUser(username);
  if (user) return next(new AppError(400, 'User already exists'));

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await User.create(username, email, hashedPassword);
  const token = jwt.sign(
    { userId: newUser.id, username: newUser.username },
    process.env.JWT_SECRET,
  );
  sendJWT(res, token);
  res.status(200).json({
    status: 'success',
    data: newUser,
    token,
  });
});

module.exports.login = catchAsync(async (req, res, next) => {
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
  sendJWT(res, token);

  res.status(200).json({
    status: 'success',
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
});

module.exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) return next(new AppError(403, 'Please login to continue'));
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  const currentUser = await User.findUser(decoded.username);
  if (!currentUser) return next(new AppError(401, 'User no longer exists'));

  req.user = currentUser;
  next();
});

module.exports.isLoggedIn = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) return next();
  // 2) Verify Token
  try {
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET,
    );

    // 3) Check if user still exist
    const freshUser = await User.findUser(decoded.username);
    if (!freshUser) return next();

    // THERE IS A LOGGED IN USER
    res.locals.user = freshUser;
    req.user = freshUser;
    next();
  } catch (err) {
    next();
  }
};

module.exports.redirectIfLoggedIn = (redirectPath) => {
  return (req, res, next) => {
    if (req.user) {
      return res.redirect(redirectPath);
    }
    next();
  };
};

module.exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: true,
  });
  res.redirect('/login');
});

const express = require('express');
const path = require('path');
const authController = require('./controllers/authController');
const roomController = require('./controllers/roomController');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const viewRouter = require('./routes/viewRoutes');
const chatController = require('./controllers/chatController');
const uploadController = require('./controllers/uploadController');

const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/signup', authController.isLoggedIn, authController.signup);
app.post(
  '/api/upload',
  uploadController.upload,
  uploadController.uploadFileController,
);
app.post('/api/login', authController.login);
app.get('/api/rooms', roomController.getAllRooms);
app.post('/api/rooms', authController.protect, roomController.createRoom);
app.get('/api/rooms/:roomName/users', roomController.getOnlineUsers);

app.use('/', viewRouter);
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message || 'Internal Sever Error',
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong',
    msg: err.message,
  });
});

module.exports = app;

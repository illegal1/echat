const express = require('express');
const path = require('path');
const authController = require('./controllers/authController');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Sever Error',
    stack: err.stack,
  });
});

module.exports = app;

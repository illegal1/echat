const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get(
  '/',
  authController.isLoggedIn,
  authController.protect,
  (req, res) => {
    res.render('index', { user: req.user });
  },
);

// router.use(authController.isLoggedIn);
router.get('/logout', authController.logout);

// router.use(authController.redirectIfLoggedIn('/'));

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

module.exports = router;

const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();
router.get('/profile/e', (req, res) => {
  res.render('profile');
});
router.get('/', authController.isLoggedIn, (req, res) => {
  res.render('index', {
    user: req.user
  });
});

router.get('/publication', authController.isLoggedIn, (req, res) => {
  res.render('publication', {
    user: req.user
  });
});

router.get('/profile', (req, res) => {
  res.render('profile');
});

router.get('/register', (req, res) => {
  res.render('./auth/register');
});

router.get('/registerCompany', (req, res) => {
  res.render('./auth/registerCompany');
});

router.get('/login', (req, res) => {
  res.render('./auth/login');
});


module.exports = router;
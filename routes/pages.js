const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/', authController.isLoggedIn, (req, res) => {
  res.render('index', {
    user: req.user
  });
});

router.get('/register', (req, res) => {
  res.render('./auth/register');
});

router.get('/signupCompany', (req, res) => {
  res.render('./auth/signupCompany');
});

router.get('/login', (req, res) => {
  res.render('./auth/login');
});


module.exports = router;
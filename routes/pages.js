const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/', authController.isLoggedIn, (req, res) => {
  res.render('index', {
    user: req.user
  });
});

router.get('/signup', (req, res) => {
  res.render('./auth/signup');
});

router.get('/signupCompany', (req, res) => {
  res.render('./auth/signupCompany');
});

router.get('/login', (req, res) => {
  res.render('./auth/login');
});

router.get('/editProfile', (req, res) => {
  res.render('editProfile');
});

router.get('/profile', authController.isLoggedIn, (req, res) => {
  console.log(req.user );
  if( req.user ) {
    res.render('profile', {
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
  
})

module.exports = router;
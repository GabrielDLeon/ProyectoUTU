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

router.get('/editProfile', authController.editProfile, (req, res) => {
  console.log(req.user );
  if( req.user ) {
    res.render('editProfile', {
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
  
})

module.exports = router;
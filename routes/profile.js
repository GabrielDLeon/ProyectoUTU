const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
  });

router.get('/', authController.isLoggedIn, (req, res) => {
    console.log(req.user );
    if( req.user ) {
      res.render('profile', {
        user: req.user
      });
    } else {
      res.redirect('/login');
    }
    
  })

  


router.get('/edit/:mail', authController.editUser, async (req, res) => {
    if( req.user ) {
      res.render('editProfile', {
        user: req.user
      });
    } else {
      res.redirect('/edit/:mail');
    }
  })



  router.get('/delete/:mail' , authController.deleteUser, async (req, res) => {
    res.redirect('/login')
  })


module.exports = router;
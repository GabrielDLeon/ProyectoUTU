const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");

router.get('/', authController.isLoggedIn, (req, res) => {
    console.log(req.user );
    if( req.user ) {
      res.render('profile', {
        user: req.user,
        title: "Perfil"
      });
    } else {
      res.redirect('/login');
    }
    
  })

router.post('/edit/:mail', authController.editCompany);
router.post('/edit/:mail', authController.editUser);

router.get('/editC/:mail', authController.editCompany, async (req, res) => {
  if( req.user1 ) {
    res.render('editProfileC', {
      user: req.user1
    });
  } else {
    res.redirect('/edit/:mail');
  }
})

router.get('/edit/:mail', authController.editUser, async (req, res) => {
    if( req.user ) {
      res.render('editProfile', {
        user: req.user,
        title: "Editar perfil"
      });
    } else {
      res.redirect('/edit/:mail');
    }
  })

  router.get('/delete/:mail' , authController.deleteUser, async (req, res) => {
    res.redirect('/login')
  })


module.exports = router;
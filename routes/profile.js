const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");

router.get('/', authController.isLoggedIn, (req, res) => {
    console.log(req.user);
    if( req.user ) {
      res.render('profile/profile', {
        user: req.user,
        title: "Perfil"
      });
    } else {
      res.redirect('/login');
    }
    
  })

router.get('/:nombre', authController.verTienda ,(req, res) => {
  if( req.tienda ) {
    res.render('profile/profile', {
      tienda: req.tienda,
      title: ""
    });
  } else {
    res.render('profile/profile');
  }
    })
  

router.get('/edit/:mail', authController.editUser, async (req, res) => {
    if( req.user ) {
      res.render('profile/editProfile', {
        user: req.user,
        title: "Editar perfil"
      });
    } else {
      res.redirect('/edit/:mail');
    }
  })


router.post('/edit/:mail', authController.editCompany);
router.post('/edit/:mail', authController.editUser);


  router.get('/delete/:mail' , authController.deleteUser, async (req, res) => {
    res.redirect('/login')
  })


module.exports = router;
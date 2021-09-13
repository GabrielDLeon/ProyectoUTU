const express = require('express');
const router = express.Router();
const conexion = require('../database/db');
const authController = require ('../controller/authController')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')

//router para vistas
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', (req, res) => {
    res.render('index' , {name:req.name})
})

router.get('/login', (req, res) => {
    res.render('login', {alert: false})
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/registerEmpresa', (req, res) => {
    res.render('registerEmpresa')
})

//authController.register
//router para metodos controller
 router.post('/register' , urlEncodedParser, [
     check ('name', 'Ingrese un nombre')
         .exists()
         .isLength({min:2}),
     check ('mailUsuario', 'Ingrese un E-mail válido')
         .exists()
         .isEmail()
         .normalizeEmail(),
     check ('pass', 'Ingrese una contraseña')
         .exists()
         .isLength({min:1})
 ] , (req, res) =>  {
     const errors = validationResult(req)
     if (!errors.isEmpty()) {
         const alert = errors.array()
         res.render('register', {
             alert
         })
     } 
 })
 //authController.register
//  router.post('/registerEmpresa' , urlEncodedParser, [
//      check ('name', 'Ingrese un nombre')
//          .exists()
//          .isLength({min:1}), 
//      check ('mailEmpresa', 'Ingrese un E-mail válido')
//          .exists()
//          .isEmail(),
//      check ('pass', 'Ingrese una contraseña de minimo 5 caracteres')
//          .exists()
//          .isLength({min:1}), 
//      check ('rut', 'Ingrese un RUT')
//          .exists()
//          .isNumeric(),
//      check ('razon', 'Ingrese una razon social (SRL, SA, etc)')
//          .exists()
//          .isLength({min:1})
//  ], (req, res) =>  {
//      const errors = validationResult(req);
//      console.log("ValidationResult: "+validationResult(req));
//      console.log("Errors: "+errors);
//      if (!errors.isEmpty()) {
//          console.log("Están vacios los campos")
//          const alert = errors.array()
//          res.render('registerEmpresa', {
//              alert
//          })
//      } else {
//          let consulta = authController.registerEmpresa;
//          console.log(consulta);
//          // router.post('/registerEmpresa', authController.registerEmpresa)
//          console.log("Estan llenitos de amor")
//          res.render('')
//      }
//  })


router.post('/registerEmpresa', authController.registerEmpresa)

router.post('/login', authController.login)
router.get('/logout', authController.logout)

module.exports = router
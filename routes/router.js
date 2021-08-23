const express = require('express');
const router = express.Router();
const conexion = require('../database/db');
const authController = require ('../controller/authController')

//router para vistas
router.get('/', authController.isAuthenticated, (req, res) => {
    res.render('index' , {user:req.user})
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

router.get('/loginEmpresa', (req, res) => {
    res.render('loginEmpresa')
})

//router para metodos controller
router.post('/register', authController.register)
router.post('/registerEmpresa', authController.registerEmpresa)
router.post('/loginEmpresa', authController.loginEmpresa)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

module.exports = router
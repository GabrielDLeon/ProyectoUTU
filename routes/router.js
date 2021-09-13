const express = require('express');
const router = express.Router();
const conexion = require('../database/db');
const authController = require ('../controller/authController')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

//router para vistas
//authController.isAuthenticated

router.get('/', authController.isAuthenticated ,(req, res) => {
    res.render('index' , {mail:req.mail})
})

router.get('/login', (req, res) => {
    res.render('login', {alert: false})
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/registerCompany', (req, res) => {
    res.render('registerCompany')
})

//authController.register
router.post('/register' , urlEncodedParser,  [
    check ('name', 'Ingrese un nombre')
        .exists()
        .isLength({min:2}),
    check ('mailUsuario', 'Ingrese un E-mail válido')
        .exists()
        .isEmail()
        .normalizeEmail(),
    check ('pass', 'Ingrese una contraseña')
        .exists()
        .isLength({min:1}),
    check ('pass2').custom((value, {req}) => {
            if (value !== req.body.pass) {
                throw new Error ('Las contraseñas no coinciden');
            }
            return true;
        }),
] , async (req, res) =>  {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const alert = errors.array()
        res.render('register', {
            mailUsuario: req.body.mailUsuario,
            pass: req.body.pass,
            pass2: req.body.pass2,
            name: req.body.name,
            alert
        })
    } 
})  


router.post('/edit' , urlEncodedParser,  [
    check ('name', 'Ingrese un nombre')
        .exists()
        .isLength({min:2}),
    check ('mailUsuario', 'Ingrese un E-mail válido')
        .exists()
        .isEmail()
        .normalizeEmail(),
    check ('pass', 'Ingrese una contraseña')
        .exists()
        .isLength({min:1}),
    check("pass2").custom((value, {req}) => {
        if (value !== req.body.pass) {
            throw new Error ('Las contraseñas no coinciden');
        }
        return true;
    }),
], async (req, res) =>  {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const alert = errors.array()
        res.render('edit', {
            alert
        })
    } 
}) 
//authController.register
router.post('/registerCompany', urlEncodedParser, [
    check ('name', 'Ingrese un nombre')
        .exists()
        .isLength({min:5}), 
    check ('mailEmpresa', 'Ingrese un E-mail válido')
        .exists()
        .isEmail(),
    check ('pass', 'Ingrese una contraseña de minimo 5 caracteres')
        .exists()
        .isLength({min:1}), 
    check ('rut', 'Ingrese un RUT')
        .exists()
        .isNumeric(),
    check ('razon', 'Ingrese una razon social (SRL, SA, etc)')
        .exists()
        .isLength({min:1}),
    check("pass2").custom((value, {req}) => {
            if (value !== req.body.pass) {
                throw new Error ('Las contraseñas ingresadas no coinciden');
            }
            return true;
        }),
] , (req, res) =>  {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const alert = errors.array()
        res.render('registerCompany', {
            mailEmpresa: req.body.mailEmpresa,
            rut: req.body.rut,
            razon: req.body.razon,
            pass: req.body.pass,
            pass2: req.body.pass2,
            name: req.body.name,
            alert
        })
    } 
})  
//router.post('/registerCompany', authController.registerCompany)
//router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

module.exports = router
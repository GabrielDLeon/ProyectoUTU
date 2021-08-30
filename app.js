const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express();
const {body, validationResult} = require('express-validator')




app.set('view engine' , 'ejs'); //motor de plantillas

app.use(express.static('public')) //carpeta para archivos estaticos
app.use(express.urlencoded({ extended: true })) // procesamiento de datos enviados desde formularios
app.use(express.json()); //procesamiento de datos enviados desde formularios

/*app.post('/register', [
    body ('name', 'Ingrese un nombre')
        .exists()
        .isLength({min:2}),
    body ('mailUsuario', 'Ingrese un E-mail válido')
        .exists()
        .isEmail(),
    body ('pass', 'Ingrese una contraseña')
        .exists()
        .isLength({min:1})
], (req, res)=> {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(req.body)
        const valores = req.body
        const validaciones = errors.array()
        res.render('register', {validaciones:validaciones, valores:valores})
    } else {
        res.render('index')
    }
})

app.post('/registerEmpresa', [
    body ('name', 'Ingrese un nombre')
        .exists()
        .isLength({min:5}), 
    body ('mailEmpresa', 'Ingrese un E-mail válido')
        .exists()
        .isEmail(),
    body ('pass', 'Ingrese una contraseña de minimo 5 caracteres')
        .exists()
        .isLength({min:1}), 
    body ('rut', 'Ingrese un RUT')
        .exists()
        .isNumeric(),
    body ('razon', 'Ingrese una razon social (SRL, SA, etc)')
        .exists()
        .isLength({min:1})
], (req, res)=> {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(req.body)
        const valores = req.body
        const validaciones = errors.array()
        res.render('registerEmpresa', {validaciones:validaciones, valores:valores})
    } else {
        res.render('index')
    }
})

*/

app.use(cookieParser())

dotenv.config({path: './env/.env'}) //variables de entorno

app.use('/', require('./routes/router')) //llama al router

//borra el cache luego de LOGOUT
app.use(function(req, res, next) {
    if (!req.user)
    res.header('Cache-Control' , 'private, no-cache, no-store, must-revalidate');
    next();
})

app.listen(3000, ()=>{
    console.log('server ANDA')
})
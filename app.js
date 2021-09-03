const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express();
const {body, validationResult} = require('express-validator')




app.set('view engine' , 'ejs'); //motor de plantillas

app.use(express.static('public')) //carpeta para archivos estaticos
app.use(express.urlencoded({ extended: true })) // procesamiento de datos enviados desde formularios
app.use(express.json()); //procesamiento de datos enviados desde formularios


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
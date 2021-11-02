const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

let template = 'SELECT idPregunta, publicacion.nroPublicacion, publicacion.titulo, nombreRemitente, mensaje, fechaPregunta, respuesta, fechaRespuesta, nombreRemitente FROM (view_preguntas INNER JOIN publicacion ON publicacion.nroPublicacion = view_preguntas.nroPublicacion) WHERE emailVendedor = ? ';

router.get('/:filter', authController.isLoggedIn, async (req, res) => {
    if (req.user) {
        const {email} = req.user.data;
        const {filter} = req.query;
        if (filter === 'noreply'){
            template+= 'AND respuesta = ""';
        } else if (filter == 'reply'){
            template+= 'AND respuesta != ""';
        }
        db.query(template, [email], (error, result) => {
            res.render('publication/listQuestions', {
                result,
                user: req.user,
                title: "Preguntas realizadas"
            })
        });
    } else {
        res.redirect('/login')
    }
}) 

router.get('/', authController.isLoggedIn, async (req, res) => {
    if (req.user) {
        const {email} = req.user.data;
        
        // Solo comentarios con respuesta
        // SELECT idPregunta, publicacion.nroPublicacion, publicacion.titulo, publicacion.vendedor, mensaje, fechaPregunta, respuesta, fechaRespuesta, cuenta_personal.nombre AS remitente FROM (preguntas INNER JOIN cuenta_personal ON preguntas.remitente = cuenta_personal.email INNER JOIN publicacion ON publicacion.nroPublicacion = preguntas.publicacion) WHERE vendedor = ? AND respuesta != ''

        // Solo comentarios sin respuesta
        // SELECT idPregunta, publicacion.nroPublicacion, publicacion.titulo, publicacion.vendedor, mensaje, fechaPregunta, respuesta, fechaRespuesta, cuenta_personal.nombre AS remitente FROM (preguntas INNER JOIN cuenta_personal ON preguntas.remitente = cuenta_personal.email INNER JOIN publicacion ON publicacion.nroPublicacion = preguntas.publicacion) WHERE vendedor = ? AND respuesta = ''


        db.query('SELECT idPregunta, publicacion.nroPublicacion, publicacion.titulo, nombreVendedor, mensaje, fechaPregunta, respuesta, fechaRespuesta, nombreRemitente FROM (view_preguntas INNER JOIN publicacion ON publicacion.nroPublicacion = view_preguntas.nroPublicacion) WHERE emailVendedor = ?', [email], (error, result) => {
            res.render('publication/listQuestions', {
                result,
                user: req.user,
                title: "Mis publicaciones"
            });
        });
    } else {
        res.redirect('/login')
    }
});

module.exports = router;
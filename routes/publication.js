const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

router.post('question/1', authController.isLoggedIn, async (req, res) =>{
    const {id} = req.params;
    const {mensaje, remitente} = req.body;
    const newQuestion = {
        pregunta,
        remitente: req.user
    }
    await db.query('INSERT INTO `preguntas` (`mensaje`, `remitente`, `publicacion`) VALUES ?',[newQuestion.pregunta, newQuestion.remitente, id])
    req.flash('success', 'Saved Successfully');
    res.redirect('/publication/:id');
})

router.get('/', (req, res) => {
    res.render('publication/publication', {
        user: req.user,
        title: "Klouts"
    });
});

router.get('/:id', authController.isLoggedIn, async (req, res) => {
    const {id} = req.params;
    await db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.nombre AS vendedor FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE nroPublicacion = ?',[id], (error, result) => {
        if (result.length>0){
            db.query('SELECT idPregunta, mensaje, DATE_FORMAT(fechaPregunta, "%d/%m/%Y") AS fechaPregunta, cuenta_empresa.nombre AS vendedor, cuenta_personal.nombre AS remitente, respuesta FROM (publicacion INNER JOIN preguntas ON publicacion.nroPublicacion = preguntas.publicacion INNER JOIN cuenta_personal ON cuenta_personal.email = preguntas.remitente INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE nroPublicacion = ?',[id], (error, questions) => {
                console.log(questions)
                console.log(result);
                res.render('publication/publication', {
                    user: req.user,
                    questions,
                    publication: result[0],
                    title: "Producto"
                });
            })
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
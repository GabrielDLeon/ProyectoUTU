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

function paginations(Page, quantity, query, path, callback) {
    const page = parseInt(Page);
    let end = (page * quantity);
    let start = end - quantity;
    db.query(query, [quantity, start], (error, questions) => {
        if (questions.length > 0) {
            db.query(query, [quantity, (start + quantity)], (error, existNextPage) => {
                if (existNextPage.length > 0) { var pagination = { lastPage: page - 1, actualPage: page, nextPage: page + 1, path} }
                else { var pagination = { lastPage: page - 1, actualPage: page, path} }
                return (callback(null, {
                    questions,
                    pagination,
                }))
            })
        } else {
            return callback();
        }
    });
}

router.get('/', authController.isLoggedIn, async (req, res) => {
    res.redirect('/list/questions/all');
})

router.get('/:type', authController.isLoggedIn, async (req, res) => {
    // console.log("============================");
    // console.log("PAGINA DE LISTAR PREGUNTAS");
    if (req.user) {
        const {email} = req.user.data;
        const {type} = req.params;
        if (req.query.page){ var {page} = req.query }
        else {var page = 1 }
        let conditions = 'WHERE (emailVendedor = "'+email+'")';
        let path = '/list/questions';
        if (type == 'all'){
            path+='/all?';
        } else if (type == 'reply'){
            conditions+= ' AND (respuesta != "")';
            path+='/reply?';
        } else if (type == 'noreply'){
            conditions+= ' AND (respuesta = "")';
            path+='/noreply?';
        } else {
            res.redirect('/list/questions/all?page=1');
        }
        let template = 'SELECT idPregunta, publicacion.nroPublicacion, publicacion.titulo, nombreRemitente, mensaje, fechaPregunta, respuesta, fechaRespuesta, nombreRemitente FROM (view_preguntas INNER JOIN publicacion ON publicacion.nroPublicacion = view_preguntas.nroPublicacion) '+conditions+' ORDER BY fechaPregunta DESC LIMIT ? OFFSET ?';
        paginations(page, 15, template, path, function (error, result) {
            if (result){
                res.render('publication/listQuestions', {
                    result: result.questions,
                    pagination: result.pagination,
                    user: req.user,
                    title: "Preguntas realizadas"
                });
            } else {
                res.render('publication/listQuestions', {
                    user: req.user,
                    title: "Preguntas realizadas"
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
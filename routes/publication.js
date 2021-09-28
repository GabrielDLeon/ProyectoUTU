const express = require('express');
const mysql = require("mysql");
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

router.get('/', (req, res) => {
    res.render('publication/publication', {
        user: req.user,
        title: "Klouts"
    });
});

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    await db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.nombre AS vendedor FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE nroPublicacion = ?',[id], (error, result) => {
        if (result.length>0){
            db.query('SELECT idPregunta, mensaje, fechaPregunta, horaPregunta, cuenta_personal.nombre FROM (publicacion INNER JOIN preguntas ON publicacion.nroPublicacion = preguntas.publicacion INNER JOIN cuenta_personal ON cuenta_personal.email = preguntas.remitente) WHERE nroPublicacion = ?',[id], (error, result1) => {
                console.log("preguntas:")
                console.log(result1)
                console.log(result);
                res.render('publication/publication', {
                question : result1[0],
                publication: result[0],
                title: "Producto",
            });
            })
            
        } else {
            res.redirect('/');
        }
        
    });
});


module.exports = router;
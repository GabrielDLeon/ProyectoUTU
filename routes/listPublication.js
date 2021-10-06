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

router.get('/', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        const mail = req.user.email
        db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.nombre AS vendedor FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE vendedor = ?', [mail], (error, publicacion) => {
            console.log("resultado de perfil")
            console.log(publicacion);
            res.render('publication/list', {
                publicacion,
                user: req.user,
                title: "Mis publicaciones"
            })
        });
    } else {
        res.redirect('/login')
    }
});

router.post('/delete/:nroPublicacion', authController.isLoggedIn, async (req, res) => {
    const nroPublicacion = req.params.nroPublicacion
    console.log(nroPublicacion)
    db.query('DELETE FROM publicacion WHERE nroPublicacion = ?', [nroPublicacion], (error, results) => {
        if (error) {
            console.log(error)
        } else {
            console.log(results);
            return res.redirect('/list')
        }
    })
});


module.exports = router;

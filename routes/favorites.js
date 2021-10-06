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

router.get('/', authController.isLoggedIn, async (req, res) => {
    const {email} = req.user;
    await db.query('SELECT nroPublicacion, titulo, descripcion, precio, cuenta_empresa.nombre AS vendedor FROM (favoritos INNER JOIN publicacion ON favoritos.publicacion = publicacion.nroPublicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE usuario = ?', [email], (error, result) => {
        res.render('publication/favorites', {
            result,
            user: req.user,
            title: "Mis publicaciones"
        })
    });
});

router.post('/delete/:id', authController.isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const {email} = req.user;
    await db.query('SELECT usuario, publicacion FROM (favoritos INNER JOIN cuenta_personal ON favoritos.usuario = cuenta_personal.email) WHERE publicacion = ? AND usuario = ?',[id, email], async (error, result) => {
        if (result.length>0){
            await db.query('DELETE FROM favoritos WHERE publicacion = ? AND usuario = ?', [id, email], (error) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log("Se ha eliminado correctamente de favoritos la publicación "+id)
                    return res.redirect('/favorites')
                }
            })   
        } else {
            return res.redirect('/favorites')
        }
    })
})

module.exports = router;
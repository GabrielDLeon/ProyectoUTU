const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

router.post('/', async (req, res) => {
    const { palabra } = req.body;
    if (palabra){
        const path = '/search?key='+palabra;
        res.redirect(path);
    } else if (!palabra) {
        res.redirect('/');
    }
})

router.get('/', authController.isLoggedIn, async (req, res) => {
    const query = req.query;
    const {key} = query;
    db.query('SELECT * FROM perfil WHERE perfil.email LIKE "%"?"%"', [key], (error, shops) => {
        db.query('SELECT nroPublicacion, precio, titulo, precio-precio*descuento.porcentaje/100 AS descuento, descripcion, producto, cuenta_empresa.nombre AS vendedor, categoria, genero, material, marca FROM (publicacion LEFT JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion INNER JOIN producto ON publicacion.nroPublicacion = producto.idProducto LEFT JOIN descuento ON descuento.publication = publicacion.nroPublicacion) WHERE titulo LIKE "%"?"%" OR categoria LIKE "%"?"%" OR genero LIKE "%"?"%" OR material LIKE "%"?"%" OR marca LIKE "%"?"%" OR cuenta_empresa.nombre LIKE "%"?"%" GROUP BY nroPublicacion', [key, key, key, key, key, key], (error, recommendations) => {
            res.render('search', {
                recommendations,
                palabra: key,
                shops: shops,
                user: req.user,
                title: "Búsqueda"
            });
        });
    });
});

module.exports = router;
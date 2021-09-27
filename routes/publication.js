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
        console.log(result);
        res.render('publication/publication', {
            publication: result[0],
            title: "Producto",
        });
    });
});

module.exports = router;
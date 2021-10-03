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

// Crear una nueva publicacion
router.get('/', authController.isLoggedIn, (req, res) => {
    db.query('SELECT categoria FROM categorias', (error, categorias) => {
        db.query('SELECT material FROM materiales', (error, materiales) => {
            db.query('SELECT marca FROM marcas', (error, marcas) => {
                res.render('publication/createPublication', {
                    categorias,
                    materiales,
                    marcas,
                    user: req.user,
                    title: "Nueva publicación"
                });
            });
        });
    });
});

router.post('/', authController.isLoggedIn, async (req, res) => {
    console.log(req.body);
    user = req.user;
    const { titulo, descripcion, precio, categoria, genero, material, marca } = req.body;
    const newProduct = {
        categoria,
        genero,
        material,
        marca
    }
    const newPublication = {
        titulo,
        descripcion,
        precio,
        vendedor: req.user.email
    }
    db.query("INSERT INTO producto (categoria, genero, material, marca) VALUES (?, ?, ?, ?)", [newProduct.categoria, newProduct.genero, newProduct.material, newProduct.marca], (error, result) => {
        if (error) {
            console.log("ERROR: " + error);
        } else {
            console.log("Producto añadido correctamente!");
            const idProducto = result.insertId;
            db.query("INSERT INTO publicacion (precio, titulo, descripcion, producto, vendedor) VALUES (?, ?, ?, ?, ?)", [newPublication.precio, newPublication.titulo, newPublication.descripcion, idProducto, newPublication.vendedor], async (error, result) => {
                const idPublicacion = result.insertId;
                const path = '/publication/' + idPublicacion;
                res.redirect(path);
            });
        }
    });
})

module.exports = router;
const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();
const multer = require('multer');
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');

const upload = multer({storage:multer.memoryStorage()});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

router.get('/', authController.isLoggedIn, (req, res) => {
    if (req.user.tipo == 'empresa') {
        const query = req.query;
        if (query.newPublication){
            db.query('SELECT categoria FROM categorias', (error, categorias) => {
                db.query('SELECT material FROM materiales', (error, materiales) => {
                    db.query('SELECT marca FROM marcas', (error, marcas) => {
                        db.query('SELECT color FROM colores', (error, colores) => {
                            res.render('publication/create', {
                                categorias,
                                materiales,
                                marcas,
                                colores,
                                user: req.user,
                                query: "newPublication=true",
                                title: "Nueva publicación"
                            });
                        });
                    });
                });
            });
        } else if (query.idProducto) {
            const {idProducto} = query;
            db.query('SELECT * FROM producto WHERE idProducto = ?', [idProducto], (error, product) => {
                if (product[0]){
                    db.query('SELECT categoria FROM categorias WHERE categoria != ?', [product[0].categoria], (error, categorias) => {
                        db.query('SELECT material FROM materiales WHERE material != ?', [product[0].material], (error, materiales) => {
                            db.query('SELECT marca FROM marcas WHERE marca != ?', [product[0].marca], (error, marcas) => {
                                db.query('SELECT color FROM colores', (error, colores) => {
                                    res.render('publication/create', {
                                        product: product[0],
                                        categorias,
                                        materiales,
                                        marcas,
                                        colores,
                                        user: req.user,
                                        query: "idProducto="+idProducto,
                                        title: "Nueva publicación"
                                    });
                                });
                            });
                        });
                    });
                } else {
                    console.log("El producto que desea utilizar no existe")
                    res.redirect('/create?newPublication=true')
                }
            });
        } else {
            console.log("Qué intentas hacer? eri gei?");
            res.redirect('/create?newPublication=true')
        }
    } else {
        res.redirect('/login');
    }
})

router.post('/', upload.array("imagen", 12) , authController.isLoggedIn , async (req, res) => {
    db.query('SELECT categoria FROM categorias', (error, categorias) => {
        db.query('SELECT material FROM materiales', (error, materiales) => {
            db.query('SELECT marca FROM marcas', (error, marcas) => {
                db.query('SELECT color FROM colores', (error, colores) => {
                user = req.user;
                const { titulo, descripcion, precio, descuento, categoria, genero, material, marca } = req.body;
                
                const newProduct = {
                    categoria,
                    genero,
                    material,
                    marca
                };
                const newPublication = {
                    titulo,
                    descripcion,
                    precio,
                    descuento,
                    vendedor: req.user.email
                }

                if (!genero || !titulo || !descripcion || !precio || !material || !marca || !categoria) {
                    return res.render('publication/create', {
                        categorias,
                        materiales,
                        marcas,
                        colores,
                        user: req.user,
                        titulo: req.body.titulo,
                        descripcion: req.body.descripcion,
                        precio: req.body.precio,
                        descuento: req.body.descuento,
                        message: "Complete todos los campos antes de crear la publicación",
                        title: "Nueva publicación"
                    })
                } else {
                    db.query("INSERT INTO producto (categoria, genero, material, marca) VALUES (?, ?, ?, ?)", [newProduct.categoria, newProduct.genero, newProduct.material, newProduct.marca], (error, result) => {
                        if (error) {
                            console.log("ERROR: " + error);
                        } else {
                            const idProducto = result.insertId;
                            db.query("INSERT INTO publicacion (precio, titulo, descripcion, producto, vendedor) VALUES (?, ?, ?, ?, ?)", [newPublication.precio, newPublication.titulo, newPublication.descripcion, idProducto, newPublication.vendedor], async (error, result) => {
                                const idPublicacion = result.insertId;
                                db.query("INSERT INTO descuento VALUES (?, ?);", [idPublicacion, newPublication.descuento]);
                                if (req.files) {
                                imagenes= req.files
                                var buffer = imagenes.map((element)=>{ return _.pick(element, ['buffer'])})
                                buffer.forEach((imagen) => {
                                    resultado = imagen.buffer.toString('base64');
                                    db.query("INSERT INTO fotos VALUES (?, ?);", [idPublicacion, resultado]);
                                })
                                }
                                const path = '/publication/' + idPublicacion;
                                res.redirect(path);
                            });
                        }
                    });
                }
            })
        })
        });
    });
});

module.exports = router;
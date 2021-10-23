const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();
const multer = require('multer');
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');
var path = require('path');
var filtro; 
const upload = multer({storage:multer.memoryStorage(), fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.svg' && ext !== '.jpeg') {
        filtro = false;
    } else{
        filtro = true;
    }
    callback(null, true)
}});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

router.get('/', authController.isLoggedIn, (req, res) => {
    if (req.user.data.tipo == 'empresa') {
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


router.post('/', upload.array("imagen", 12), authController.isLoggedIn, async (req, res) => {
    const { titulo, descripcion, precio, descuento, categoria, genero, material, marca } = req.body;
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
            message: "Por favor complete todos los campos antes de crear la publicación",
            title: "Nueva publicación"
        })
    }
    else if (filtro == false) {
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
            message: "Compruebe la extensión de las imagenes que quiere subir (solo válidas .png, .jpg, .jpeg, .svg)",
            title: "Nueva publicación"
        })
    } else {
        db.query('SELECT * FROM marcas WHERE marca = ?', [marca], (error, result) => {
            if (result.length > 0) {
                console.log("la marca existe y no se va a crear")
            } else {
                console.log("la marca no existe y se va a crear")
                db.query('INSERT INTO marcas (marca) VALUES (?)', [marca])
            }
        })
        db.query('SELECT categoria FROM categorias', (error, categorias) => {
            db.query('SELECT material FROM materiales', (error, materiales) => {
                db.query('SELECT marca FROM marcas', (error, marcas) => {
                    db.query('SELECT color FROM colores', (error, colores) => {
                        const newProduct = {
                            categoria,
                            genero,
                            material,
                            marca
                        };
                        const currentDate = new Date();
                        const newPublication = {
                            titulo,
                            descripcion,
                            precio,
                            descuento,
                            vendedor: req.user.data.email,
                            fecha: currentDate
                        }
                        db.query("INSERT INTO producto (categoria, genero, material, marca) VALUES (?, ?, ?, ?)", [newProduct.categoria, newProduct.genero, newProduct.material, newProduct.marca], (error, result) => {
                            if (error) {
                                console.log("ERROR: " + error);
                            } else {
                                const idProducto = result.insertId;
                                db.query("INSERT INTO publicacion (precio, titulo, descripcion, producto, vendedor, fechaPublicacion) VALUES (?, ?, ?, ?, ?, ?)", [newPublication.precio, newPublication.titulo, newPublication.descripcion, idProducto, newPublication.vendedor, newPublication.fecha], async (error, result) => {
                                    const idPublicacion = result.insertId;
                                    db.query("INSERT INTO descuento VALUES (?, ?);", [idPublicacion, newPublication.descuento]);
                                    if (req.files) {
                                        imagenes = req.files

                                        var buffer = imagenes.map((element) => { return _.pick(element, ['buffer']) })
                                        buffer.forEach((imagen) => {
                                            resultado = imagen.buffer.toString('base64');
                                            db.query("INSERT INTO fotos VALUES (?, ?);", [idPublicacion, resultado]);
                                        })
                                    }
                                    return res.render('publication/create', {
                                        id: result.insertId,
                                        categorias,
                                        materiales,
                                        marcas,
                                        colores,
                                        user: req.user,
                                        titulo: req.body.titulo,
                                        descripcion: req.body.descripcion,
                                        precio: req.body.precio,
                                        descuento: req.body.descuento,
                                        success: "Publicación creada",
                                        title: "Nueva publicación"
                                    })
                                });
                            }
                        });
                    });
                });
            });
        });
    }
});

module.exports = router;
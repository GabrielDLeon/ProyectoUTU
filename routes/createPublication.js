const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();
const multer = require('multer');
var _ = require('lodash');
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

// Cargar la página de creación de publicación
router.get('/', authController.isLoggedIn, (req, res) => {
    if (req.user){
        if (req.user.data.tipo == 'empresa') {
            const query = req.query;
            if (query.idProducto) {
                const {idProducto} = query;
                db.query('SELECT * FROM productos WHERE idProducto = ?', [idProducto], (error, product) => {
                    if (product[0]){
                        db.query('SELECT color FROM colores', (error, colores) => {
                            db.query('SELECT talle FROM talles ORDER BY orden ASC', (error, talles) => {
                                const bodyRender = {
                                    colores,
                                    talles,
                                    title: "Nueva publicación"
                                }
                                res.render('publication/create', {
                                    product: product[0],
                                    bodyRender,
                                    user: req.user,
                                    query: "idProducto="+idProducto,
                                });
                            })
                        });
                    } else {
                        res.redirect('/create?newPublication=true')
                    }
                });
            } else if (query.newPublication){
                getProductPropieties(function (error, productPropieties) {
                    const { categorias, materiales, marcas, colores, talles } = productPropieties; // Datos de la BD
                    const bodyRender = {
                        categorias,
                        materiales,
                        marcas,
                        colores,
                        talles,
                        title: "Nueva publicación"
                    }
                    res.render('publication/create', {
                        bodyRender,
                        user: req.user,
                        query: "newPublication=true",
                    });
                })
            } else {
                res.redirect('/create?newPublication=true')
            }
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/login')
    }
})

// Crear la publicación y/o producto
router.post('/', upload.array("imagen", 12), authController.isLoggedIn, async (req, res) => {
    const action = req.query;
    // Cuando se crea una  publicación con un producto ya existente (que se encuentra en la BD)
    if (action.idProducto) {
        getProductPropieties(function (error, productPropieties) {
            const { colores, talles } = productPropieties; // Datos de la BD
            const { titulo, descripcion, precio, descuento } = req.body; // Datos del formulario
            const bodyRender = {
                talles,
                colores,
                titulo,
                descripcion,
                precio,
                descuento,
                title: "Nueva publicación",
            }
            if (!titulo || !descripcion || !precio) {
                return res.render('publication/create', {
                    user: req.user,
                    bodyRender,
                    message: "Por favor complete todos los campos antes de crear la publicación",
                });
            }
            else if (filtro == false) {
                return res.render('publication/create', {
                    user: req.user,
                    bodyRender,
                    message: "Compruebe la extensión de las imagenes que quiere subir (solo válidas .png, .jpg, .jpeg, .svg)",
                });
            } else {
                const currentDate = new Date();
                const newPublication = {
                    titulo,
                    descripcion,
                    precio,
                    descuento,
                    vendedor: req.user.data.email,
                    fecha: currentDate
                }
                const { idProducto } = action;
                db.query("INSERT INTO publicacion (precio, titulo, descripcion, producto, vendedor, fechaPublicacion) VALUES (?, ?, ?, ?, ?, ?)", [newPublication.precio, newPublication.titulo, newPublication.descripcion, idProducto, newPublication.vendedor, newPublication.fecha], async (error, result) => {
                    const idPublicacion = result.insertId;

                    // Insert de talles en la publicación
                    const { G, L, M, S, XL, XS, XXL, XXS, XXXL, XXXXL } = req.body
                    insertTalles(G, L, M, S, XL, XS, XXL, XXS, XXXL, XXXXL, idPublicacion);

                    // Insert de colores en la publicación
                    const { amarillo, azul, beige, blanco, bordó, gris, marrón, naranja, negro, rojo, rosado, salmón, verde, violeta } = req.body
                    insertColors(amarillo, azul, beige, blanco, bordó, gris, marrón, naranja, negro, rojo, rosado, salmón, verde, violeta, idPublicacion);

                    db.query("INSERT INTO descuento VALUES (?, ?)", [idPublicacion, newPublication.descuento]);
                    if (req.files.length > 0) {
                        imagenes = req.files
                        var buffer = imagenes.map((element) => { return _.pick(element, ['buffer']) })
                        buffer.forEach((imagen) => {
                            resultado = imagen.buffer.toString('base64');
                            db.query("INSERT INTO fotos VALUES (?, ?);", [idPublicacion, resultado]);
                        })
                    }
                    db.query('SELECT * FROM productos WHERE idProducto = ?', [idProducto], (error, product) => {
                        return res.render('publication/create', {
                            bodyRender,
                            id: idPublicacion,
                            product: product[0],
                            user: req.user,
                            success: "Publicación creada",
                        });
                    });
                });
            }
        })
    } else if (action.newPublication) {
        getProductPropieties(function (error, productPropieties) {
            const { categorias, materiales, marcas, colores, talles } = productPropieties; // Datos de la BD
            const { titulo, descripcion, precio, descuento, categoria, genero, material, marca } = req.body; // Datos del formulario
            db.query('SELECT categoria FROM categorias WHERE categoria = ?', [categoria], (error, categoriasR) => {
                db.query('SELECT material FROM materiales WHERE material = ?', [material], (error, materialesR) => {
                    const bodyRender = {
                        categorias,
                        materiales,
                        marcas,
                        talles,
                        colores,
                        titulo: req.body.titulo,
                        descripcion: req.body.descripcion,
                        precio: req.body.precio,
                        descuento: req.body.descuento,
                        material,
                        marca,
                        genero,
                        categoria,
                        title: "Nueva publicación",
                    }
                    if (!genero || !titulo || !descripcion || !precio || !material || !marca || !categoria) {
                        return res.render('publication/create', {
                            bodyRender,
                            user: req.user,
                            message: "Por favor complete todos los campos antes de crear la publicación",
                        })
                    } else if (filtro == false) {
                        return res.render('publication/create', {
                            bodyRender,
                            user: req.user,
                            message: "Compruebe la extensión de las imagenes que quiere subir (solo válidas .png, .jpg, .jpeg, .svg)",
                        })
                    } else if (categoriasR.length <= 0) {
                        return res.render('publication/create', {
                            bodyRender,
                            user: req.user,
                            message: "Esa categoria no existe, seleccione otra",
                        })
                    } else if (materialesR.length <= 0) {
                        return res.render('publication/create', {
                            bodyRender,
                            user: req.user,
                            message: "Ese material no existe, seleccione otro",
                        })
                    } else {
                        db.query('SELECT * FROM marcas WHERE marca = ?', [marca], (error, result) => {
                            if (result.length > 0) {
                            } else {
                                db.query('INSERT INTO marcas (marca) VALUES (?)', [marca])
                            }
                        });
                        const newProduct = {
                            categoria,
                            genero,
                            material,
                            marca
                        }
                        const currentDate = new Date();
                        const newPublication = {
                            titulo,
                            descripcion,
                            precio,
                            descuento,
                            vendedor: req.user.data.email,
                            fecha: currentDate
                        }

                        existProduct(newProduct.categoria, newProduct.genero, newProduct.material, newProduct.marca, function (error, idProducto) {
                            if (error) {
                                console.log("ERROR: " + error);
                            } else {
                                db.query("INSERT INTO publicacion (precio, titulo, descripcion, producto, vendedor, fechaPublicacion) VALUES (?, ?, ?, ?, ?, ?)", [newPublication.precio, newPublication.titulo, newPublication.descripcion, idProducto, newPublication.vendedor, newPublication.fecha], async (error, result) => {
                                    const idPublicacion = result.insertId;

                                    // Insert de talles en la publicación
                                    const { G, L, M, S, XL, XS, XXL, XXS, XXXL, XXXXL } = req.body
                                    insertTalles(G, L, M, S, XL, XS, XXL, XXS, XXXL, XXXXL, idPublicacion);

                                    //  Insert de colores en la publicación
                                    const { amarillo, azul, beige, blanco, bordó, gris, marrón, naranja, negro, rojo, rosado, salmón, verde, violeta } = req.body
                                    insertColors(amarillo, azul, beige, blanco, bordó, gris, marrón, naranja, negro, rojo, rosado, salmón, verde, violeta, idPublicacion);

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
                                        user: req.user,
                                        bodyRender,
                                        success: "Publicación creada",
                                    })
                                });
                            }
                        });
                    }
                });
            });
        });
    }
});

function getProductPropieties (callback) {
    db.query('SELECT categoria FROM categorias', (error, categorias) => {
        db.query('SELECT material FROM materiales', (error, materiales) => {
            db.query('SELECT marca FROM marcas', (error, marcas) => {
                db.query('SELECT color FROM colores', (error, colores) => {
                    db.query('SELECT talle FROM talles ORDER BY orden ASC', (error, talles) => {
                        const result = {
                            categorias,
                            materiales,
                            marcas,
                            colores,
                            talles,
                        }
                        return callback(null, result);
                    });
                });
            });
        });
    });
}

function insertTalles(G, L, M, S, XL, XS, XXL, XXS, XXXL, XXXXL, idPublicacion) {
    let array = [];
    if (G) array.push('G');
    if (L) array.push('L');
    if (M) array.push('M');
    if (S) array.push('S');
    if (XL) array.push('XL');
    if (XS) array.push('XS');
    if (XXL) array.push('XXL');
    if (XXS) array.push('XXS');
    if (XXXL) array.push('XXXL');
    if (XXXXL) array.push('XXXXL');
    array.forEach(talle => {
        db.query('INSERT INTO curvas VALUES (?, ?)', [talle, idPublicacion]);
    });
}

function insertColors(amarillo, azul, beige, blanco, bordó, gris, marrón, naranja, negro, rojo, rosado, salmón, verde, violeta, idPublicacion) {
    let array = [];
    if (amarillo) array.push('amarillo');
    if (azul) array.push('azul');
    if (beige) array.push('beige');
    if (blanco) array.push('blanco');
    if (bordó) array.push('bordó');
    if (gris) array.push('gris');
    if (marrón) array.push('marrón');
    if (naranja) array.push('naranja');
    if (negro) array.push('negro');
    if (rojo) array.push('rojo');
    if (rosado) array.push('rosado');
    if (salmón) array.push('salmón');
    if (verde) array.push('verde');
    if (violeta) array.push('violeta');
    array.forEach(color => {
        db.query('INSERT INTO colorpubli VALUES (?, ?)', [color, idPublicacion]);
    });
}

function existProduct(categoria, genero, material, marca, callback) {
    db.query('SELECT idProducto FROM productos WHERE categoria = ? AND genero = ? AND material = ? AND marca = ?', [categoria, genero, material, marca], (error, existProduct) => {
        if (existProduct.length > 0) {
            return callback(null, existProduct[0].idProducto)
        } else {
            db.query('INSERT INTO productos (categoria, genero, material, marca) VALUES (?, ?, ?, ?)', [categoria, genero, material, marca], (error, newProduct) => {
                const idProduct = newProduct.insertId;
                return callback(null, idProduct);
            })
        }
    })
}

module.exports = router;
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

router.get('/', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        const {email} = req.user.data;
        db.query('SELECT nroPublicacion, titulo, imagen, descuento, porcentaje, descripcion, precio, idProducto, nombreVendedor, COUNT(preguntas.idPregunta) AS cantPreguntas FROM (view_publicaciones LEFT JOIN preguntas ON preguntas.publicacion = nroPublicacion) WHERE emailVendedor = ? GROUP BY nroPublicacion;', [email], (error, publicacion) => {
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
    await db.query('SELECT nroPublicacion FROM publicacion WHERE nroPublicacion = ?', [nroPublicacion], async (error, result) => {
        if (result.length > 0) {
            await db.query('DELETE FROM publicacion WHERE nroPublicacion = ?', [nroPublicacion], (error, results) => {
                if (error) {
                    console.log(error)
                    return res.redirect('/list')
                } else {
                    return res.redirect('/list')
                }
            })
        } else {
            return res.redirect('/list')
        }
    })
});

router.get('/edit/:id', authController.isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { email } = req.user.data;
    await db.query('SELECT vendedor FROM publicacion WHERE nroPublicacion = ?', [id], (error, result) => {
        if (result.length > 0) {
            if (email === result[0].vendedor) {
                db.query('SELECT nroPublicacion, titulo, descripcion, precio, descuento, porcentaje FROM (view_publicaciones) WHERE nroPublicacion = ?;', [id], (error, result) => {
                    db.query('SELECT categoria, genero, material, marca FROM (view_publicaciones) WHERE nroPublicacion = ?', [id], (error, product) => {
                        const { categoria, genero, material, marca } = product[0];
                        db.query('SELECT categoria FROM categorias WHERE categoria != ?', [categoria], (error, categorias) => {
                            db.query('SELECT material FROM materiales WHERE material != ?', [material], (error, materiales) => {
                                db.query('SELECT marca FROM marcas WHERE marca != ?', [marca], (error, marcas) => {
                                    db.query('SELECT curvas.talle FROM (curvas INNER JOIN talles ON curvas.talle = talles.talle) WHERE publicacion = ? ORDER BY orden ASC', [id], (error, tallesSelected) => {
                                        db.query('SELECT talle FROM talles WHERE talle NOT IN (SELECT talle FROM curvas WHERE publicacion = ?) ORDER BY orden ASC', [id], (error, talles) => {
                                            db.query('SELECT color FROM colorpubli WHERE publicacion = ?', [id], (error, colorSelected) => {
                                                db.query('SELECT color FROM colores WHERE color NOT IN (SELECT color FROM colorpubli WHERE publicacion = ?)', [id], (error, colores) => {
                                                    res.render('publication/edit', {
                                                        user: req.user,
                                                        categorias,
                                                        materiales,
                                                        marcas,
                                                        genero,
                                                        tallesSelected,
                                                        talles,
                                                        colorSelected,
                                                        colores,
                                                        product: product[0],
                                                        publication: result[0],
                                                        title: "Editar publicación"
                                                    })
                                                })
                                            })
                                        });
                                    })
                                });
                            });
                        });
                    });
                })
            } else {
                res.redirect('/list');
            }
        } else {
            res.redirect('/');
        }
    });
});

router.post('/edit/:id', upload.array("imagen", 12), authController.isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, precio, descuento } = req.body;
    db.query('SELECT nroPublicacion, titulo, descripcion, precio, porcentaje, descuento FROM (view_publicaciones) WHERE nroPublicacion = ?', [id], (error, result) => {
        db.query('SELECT categoria, genero, material, marca FROM (productos INNER JOIN publicacion ON productos.idProducto = publicacion.producto) WHERE nroPublicacion = ?', [id], (error, product) => {
            const { categoria, genero, material, marca } = product[0];
            db.query('SELECT categoria FROM categorias WHERE categoria != ?', [categoria], (error, categorias) => {
                db.query('SELECT material FROM materiales WHERE material != ?', [material], (error, materiales) => {
                    db.query('SELECT marca FROM marcas WHERE marca != ?', [marca], (error, marcas) => {
                        db.query('SELECT talle FROM talles WHERE talle NOT IN (SELECT talle FROM curvas WHERE publicacion = ?) ORDER BY talle ASC', [id], (error, talles) => {
                            if (filtro == false) {
                                return res.render('publication/edit', {
                                    colores,
                                    user: req.user,
                                    categorias,
                                    talles,
                                    materiales,
                                    marcas,
                                    genero,
                                    product: product[0],
                                    publication: result[0],
                                    message: "Compruebe la extensión de las imagenes que quiere subir (solo válidas .png, .jpg, .jpeg, .svg)",
                                    title: "Editar publicación"
                                })
                            }
                            if (req.files.length > 0) {
                                db.query('DELETE FROM fotos WHERE publicacion = ?', [id])
                                imagenes = req.files
                                var buffer = imagenes.map((element) => { return _.pick(element, ['buffer']) })
                                buffer.forEach((imagen) => {
                                    resultado = imagen.buffer.toString('base64');
                                    db.query("INSERT INTO fotos VALUES (?, ?);", [id, resultado]);
                                })
                            }
                            const { categoria, genero, material, marca } = req.body;
                            db.query('SELECT categoria FROM categorias WHERE categoria = ?', [categoria], (err, cats) => {
                                db.query('SELECT material FROM materiales WHERE material = ?', [material], (err, mat) => {
                                    if (cats.length <= 0) {
                                        return res.render('publication/edit', {
                                            user: req.user,
                                            categorias,
                                            genero,
                                            talles,
                                            product: product[0],
                                            publication: result[0],
                                            msjCat: "No existe esa categoria",
                                            title: "Editar publicación"
                                        })
                                    } else if (mat.length <= 0) {
                                        return res.render('publication/edit', {
                                            user: req.user,
                                            categorias,
                                            genero,
                                            talles,
                                            product: product[0],
                                            publication: result[0],
                                            msjMat: "No existe ese material",
                                            title: "Editar publicación"
                                        })
                                    } else {
                                        db.query("INSERT INTO productos (categoria, genero, material, marca) VALUES (?, ?, ?, ?)", [categoria, genero, material, marca], (error, result) => {
                                            const insert = result.insertId
                                            if (descuento) {
                                                if (descuento.length > 0) {
                                                    db.query('UPDATE descuento SET porcentaje = ? WHERE publication = ?', [descuento, id])
                                                }
                                            }
                                            db.query('UPDATE publicacion SET titulo = ?, descripcion = ?, precio = ?, producto = ? WHERE nroPublicacion = ?', [titulo, descripcion, precio, insert, id], (error, result) => {
                                                res.redirect('/list');
                                            })
                                        })
                                    }

                                })
                            })
                        })
                        db.query('DELETE FROM curvas WHERE publicacion = ?', [id]);
                        const { G, L, M, S, XL, XS, XXL, XXS, XXXL, XXXXL } = req.body;
                        var array = [];
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
                            db.query('INSERT INTO curvas VALUES (?, ?)', [talle, id]);
                        });
                        db.query('DELETE FROM colorpubli WHERE publicacion = ?', [id]);
                        const { amarillo, azul, beige, blanco, bordó, gris, marrón, naranja, negro, rojo, rosado, salmón, verde, violeta } = req.body
                        var array2 = [];
                        if (amarillo) array2.push('amarillo');
                        if (azul) array2.push('azul');
                        if (beige) array2.push('beige');
                        if (blanco) array2.push('blanco');
                        if (bordó) array2.push('bordó');
                        if (gris) array2.push('gris');
                        if (marrón) array2.push('marrón');
                        if (naranja) array2.push('naranja');
                        if (negro) array2.push('negro');
                        if (rojo) array2.push('rojo');
                        if (rosado) array2.push('rosado');
                        if (salmón) array2.push('salmón');
                        if (verde) array2.push('verde');
                        if (violeta) array2.push('violeta');
                        array2.forEach(color => {
                            db.query('INSERT INTO colorpubli VALUES (?, ?)', [color, id]);
                        });
                    })
                })
            })
        });
    })
});

module.exports = router;

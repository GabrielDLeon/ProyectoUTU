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
    if (req.user) {
        const {email} = req.user.data;
        db.query('SELECT nroPublicacion, titulo, descripcion, precio, idProducto, nombreVendedor, COUNT(preguntas.idPregunta) AS cantPreguntas FROM (view_publicaciones LEFT JOIN preguntas ON preguntas.publicacion = nroPublicacion) WHERE emailVendedor = ? GROUP BY nroPublicacion;', [email], (error, publicacion) => {
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
    await db.query('DELETE FROM publicacion WHERE nroPublicacion = ?', [nroPublicacion], (error, results) => {
        if (error) {
            console.log(error)
        } else {
            return res.redirect('/list')
        }
    })
});

router.get('/edit/:id', authController.isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const {email} = req.user.data;
    await db.query('SELECT vendedor FROM publicacion WHERE nroPublicacion = ?',[id], (error, result) => {
        if (result.length>0){
            if (email === result[0].vendedor){
                db.query('SELECT nroPublicacion, titulo, descripcion, precio, descuento FROM (view_publicaciones) WHERE nroPublicacion = ?;',[id], (error, result) => {
                    db.query('SELECT categoria, genero, material, marca FROM (view_publicaciones) WHERE nroPublicacion = ?',[id], (error, product) => {
                        const {categoria, genero, material, marca} = product[0];
                        db.query('SELECT categoria FROM categorias WHERE categoria != ?',[categoria], (error, categorias) => {
                            db.query('SELECT material FROM materiales WHERE material != ?',[material], (error, materiales) => {
                                db.query('SELECT marca FROM marcas WHERE marca != ?',[marca], (error, marcas) => {
                                    /*SELECT * FROM talles WHERE talle NOT IN (SELECT talle FROM curvas WHERE publicacion = 5)*/
                                    db.query('SELECT talle FROM curvas WHERE publicacion = ?', [id], (error, tallesSelected) => {
                                        db.query('SELECT talle FROM talles WHERE talle NOT IN (SELECT talle FROM curvas WHERE publicacion = ?)',[id], (error, talles) => {
                                            res.render('publication/edit', {
                                                user: req.user,
                                                categorias,
                                                materiales,
                                                marcas,
                                                genero,
                                                tallesSelected,
                                                talles,
                                                product: product[0],
                                                publication: result[0],
                                                title: "Editar publicación"
                                            })
                                        });
                                    })
                                });
                            });
                        });
                    });
                })
            } else {
                console.log("No se pudieron actualizar los datos de la publicación, esto debido a que la cuenta activa no corresponde al usuario vendedor de la publicación")
                res.redirect('/');
            }
        } else {
            console.log("No se encontró ninguna publicación");
            res.redirect('/');
        }
    })
})

router.post('/edit/:id', upload.array("imagen", 12), authController.isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, precio } = req.body;
    console.log(req.body);
    db.query('SELECT nroPublicacion, titulo, descripcion, precio, descuento FROM (view_publicaciones) WHERE nroPublicacion = ?', [id], (error, result) => {
        db.query('SELECT categoria, genero, material, marca FROM (productos INNER JOIN publicacion ON productos.idProducto = publicacion.producto) WHERE nroPublicacion = ?', [id], (error, product) => {
            const { categoria, genero, material, marca } = product[0];
            db.query('SELECT categoria FROM categorias WHERE categoria != ?', [categoria], (error, categorias) => {
                db.query('SELECT material FROM materiales WHERE material != ?', [material], (error, materiales) => {
                    db.query('SELECT marca FROM marcas WHERE marca != ?', [marca], (error, marcas) => {
                        if (filtro == false) {
                            return res.render('publication/edit', {
                                //colores,
                                user: req.user,
                                categorias,
                                materiales,
                                marcas,
                                genero,
                                product: product[0],
                                publication: result[0],
                                message: "Compruebe la extensión de las imagenes que quiere subir (solo válidas .png, .jpg, .jpeg, .svg)",
                                title: "Editar publicación"
                            })
                        }
                        // if (req.files) {
                        //     db.query('DELETE FROM fotos WHERE publicacion = ?', [id])
                        //     imagenes = req.files
                        //     var buffer = imagenes.map((element) => { return _.pick(element, ['buffer']) })
                        //     buffer.forEach((imagen) => {
                        //         resultado = imagen.buffer.toString('base64');
                        //         db.query("INSERT INTO fotos VALUES (?, ?);", [id, resultado]);
                        //     })
                        // }
                    })
                })
            })
        })
        db.query('UPDATE publicacion SET titulo = ?, descripcion = ?, precio = ? WHERE nroPublicacion = ?', [titulo, descripcion, precio, id], (error, result) => {
            console.log("Se actualizó correctamente la publicación " + id);
            res.redirect('/list');
        })
        db.query('DELETE FROM curvas WHERE publicacion = ?', [id]);
        const {G, L, M, S, XL, XS, XXL, XXS, XXXL, XXXXL} = req.body;
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
    })
})
module.exports = router;

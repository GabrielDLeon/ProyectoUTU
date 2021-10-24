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
        const {email} = req.user.data;
        db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.nombre AS vendedor, COUNT(preguntas.idPregunta) AS cantPreguntas FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN preguntas ON preguntas.publicacion = publicacion.nroPublicacion) WHERE vendedor = ? GROUP BY nroPublicacion', [email], (error, publicacion) => {
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
    console.log(id)
    const {email} = req.user.data;
    await db.query('SELECT vendedor FROM publicacion WHERE nroPublicacion = ?',[id], (error, result) => {
        if (result.length>0){
            if (email === result[0].vendedor){
                db.query('SELECT nroPublicacion AS id, precio, titulo, descripcion, porcentaje AS descuento FROM (publicacion INNER JOIN descuento ON publicacion.nroPublicacion = descuento.publication) WHERE publicacion.nroPublicacion = ?',[id], (error, result) => {
                    db.query('SELECT categoria, genero, material, marca FROM (productos INNER JOIN publicacion ON productos.idProducto = publicacion.producto) WHERE nroPublicacion = ?',[id], (error, product) => {
                        console.log(result)
                        const {categoria, genero, material, marca} = product[0];
                        db.query('SELECT categoria FROM categorias WHERE categoria != ?',[categoria], (error, categorias) => {
                            db.query('SELECT material FROM materiales WHERE material != ?',[material], (error, materiales) => {
                                db.query('SELECT marca FROM marcas WHERE marca != ?',[marca], (error, marcas) => {
                                    res.render('publication/edit', {
                                        user: req.user,
                                        categorias,
                                        materiales,
                                        marcas,
                                        genero,
                                        product: product[0],
                                        publication: result[0],
                                        title: "Editar publicación"
                                    })
                                })
                            })
                        })
                    })
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

router.post('/edit/:id', authController.isLoggedIn, async (req, res) => {
    const {id} = req.params;
    const {titulo, descripcion, precio} = req.body;
    await db.query('UPDATE publicacion SET titulo = ?, descripcion = ?, precio = ? WHERE nroPublicacion = ?',[titulo, descripcion, precio ,id], (error, result) => {
        console.log("Se actualizó correctamente la publicación "+id);
        res.redirect('/list');
    })
})

module.exports = router;

const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const { update } = require('lodash');
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

router.get('/', (req, res) => {
    res.render('publication/page', {
        user: req.user,
        title: "Klouts"
    });
});


// Enviar formulario de pregunta
router.post('/question/:id', authController.isLoggedIn, async (req, res) => {
    if (req.user){
        const { id } = req.params;
        user = req.user;
        const { mensaje } = req.body;
        const currentDate = new Date();
        const newQuestion = {
            mensaje,
            fechaPregunta: currentDate,
            remitente: req.user.email,
            publicacion: id
        };
        if (!mensaje) {
            const path = '/publication/' + id + '/#seccion-preguntas';
            return res.redirect(path);
        }
        await db.query('INSERT INTO `preguntas` (`mensaje`, `remitente`, `publicacion`, `fechaPregunta`) VALUES (?, ?, ?, ?)', [newQuestion.mensaje, newQuestion.remitente, newQuestion.publicacion, newQuestion.fechaPregunta], async (error, insert) => {
            // Envía la notificación
            await db.query('SELECT vendedor FROM publicacion WHERE nroPublicacion = ?', [id], (error, result) => {
                const idPregunta = insert.insertId;
                console.log(insert);
                const vendedor = result[0].vendedor;
                db.query('INSERT INTO notificaciones (`usuario`, `pregunta`) VALUES (?, ?)', [vendedor, idPregunta]);
                console.log("Se envió correctamente la notificación al usuario: "+vendedor)
            })
            console.log('Pregunta enviada correctamente');
            const path = '/publication/' + id + '/#seccion-preguntas';
            res.redirect(path);
        });
    } else {
        res.redirect('/login')
    }
})

// Enviar formulario de respuesta del vendedor
router.post('/answer/:id', authController.isLoggedIn, async (req, res) => {
    const { id } = req.params
    await db.query('SELECT idPregunta, nroPublicacion, mensaje, fechaPregunta, cuenta_empresa.nombre AS vendedor, cuenta_personal.nombre AS remitente, respuesta FROM (publicacion INNER JOIN preguntas ON publicacion.nroPublicacion = preguntas.publicacion INNER JOIN cuenta_personal ON cuenta_personal.email = preguntas.remitente INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE idPregunta = ? ORDER BY fechaPregunta DESC', [id], async (error, questions) => {
        const { nroPublicacion } = questions[0];
        if (questions.length > 0) {
            const { id } = req.params;
            const { idPregunta } = questions[0];
            const { respuesta } = req.body;
            if (!respuesta) {
                const path = '/publication/' + id + '/#seccion-preguntas';
                return res.redirect(path);
            }
            await db.query('UPDATE preguntas SET ? WHERE idPregunta = ?', [{ respuesta: respuesta }, idPregunta], async (error, result) => {
                // Envía la notificación
                await db.query('SELECT remitente FROM preguntas WHERE idPregunta = ?', [idPregunta], (error, result) => {
                    const {remitente} = result[0];
                    db.query('INSERT INTO notificaciones (`usuario`, `pregunta`) VALUES (?, ?)', [remitente, idPregunta]);
                    console.log("Se envió correctamente la notificación al usuario: "+remitente)
                })
                console.log('Respuesta enviada correctamente');
                const path = '/publication/' + nroPublicacion + '/#seccion-preguntas';
                return res.redirect(path);
            });
        }
    })
});

// Función que calcula el precio final a partir de un descuento
function saleCalculator (price, sale){
    const result = price - ((price * sale) / 100);
    return result;
}

// Entrar a una publicacion desde URL con el ID
router.get('/:id', authController.isLoggedIn, async (req, res) => {
    const {id} = req.params;
    if (req.user){var {email} = req.user}
    await db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.email AS vendedorEmail, cuenta_empresa.nombre AS vendedor FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE nroPublicacion = ?',[id], async (error, result) => { 
        if (result.length>0){
            await db.query('SELECT idProducto, categoria, genero, material, marca FROM (publicacion INNER JOIN producto ON publicacion.producto = producto.idProducto) WHERE publicacion.nroPublicacion = ?',[id], async (error, product) => {
                await db.query('SELECT * FROM favoritos WHERE usuario = ? AND publicacion = ?', [email, id], async (error, favorite) => {
                    await db.query('SELECT talle FROM (publicacion INNER JOIN curvas ON publicacion.nroPublicacion = curvas.publicacion) WHERE nroPublicacion = ?', [id], async (error, sizes) => {
                        await db.query('SELECT color FROM (publicacion_color INNER JOIN publicacion ON publicacion_color.publicacion = publicacion.nroPublicacion) WHERE publicacion.nroPublicacion = ?', [id], async (error, colors) => {
                            await db.query('SELECT publicacion, imagen FROM fotos WHERE publicacion = ?', [id], async (error, imagen) => {
                                await db.query('SELECT porcentaje AS descuento FROM (descuento INNER JOIN publicacion ON descuento.publication = publicacion.nroPublicacion) WHERE publicacion.nroPublicacion = ?', [id], async (error, sale) => {
                                    if (sale.length > 0) {
                                        var valor = {
                                            descuento: sale[0].descuento,
                                            final: saleCalculator(result[0].precio, sale[0].descuento)
                                        }
                                    } else {
                                        var valor = {
                                            descuento: '',
                                            final: result[0].precio,
                                        }
                                    }
                                    const vendedor = result[0].vendedorEmail;
                                    await db.query('SELECT idPregunta, mensaje, fechaPregunta, fechaRespuesta, cuenta_empresa.nombre AS vendedor, cuenta_personal.nombre AS remitente, respuesta, cuentas.tipo FROM (publicacion INNER JOIN preguntas ON publicacion.nroPublicacion = preguntas.publicacion INNER JOIN cuenta_personal ON cuenta_personal.email = preguntas.remitente INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email INNER JOIN cuentas ON cuentas.email = cuenta_empresa.email) WHERE nroPublicacion = ? ORDER BY fechaPregunta DESC', [id], async (error, questions) => {
                                        await db.query('SELECT nroPublicacion, precio, precio-precio*descuento.porcentaje/100 AS descuento, titulo, imagen FROM (publicacion LEFT JOIN fotos ON publicacion.nroPublicacion = fotos.publicacion LEFT JOIN descuento ON descuento.publication = publicacion.nroPublicacion) WHERE vendedor = ? AND nroPublicacion != ? GROUP BY nroPublicacion', [vendedor, id], async (error, recommendations) => {
                                            await db.query('SELECT * from perfil WHERE email = ?', [vendedor], (error, perfil) => {
                                                res.render('publication/page', {
                                                    user: req.user,
                                                    title: result[0].titulo,
                                                    publication: result[0],
                                                    product: product[0],
                                                    favorite: favorite[0],
                                                    colors,
                                                    sizes,
                                                    valor,
                                                    imagen,
                                                    questions,
                                                    recommendations,
                                                    perfil: perfil[0]
                                                });
                                            });
                                        });
                                    });
                                });
                            })
                        });
                    });
                })
            })
        } else {
            res.redirect('/');
        }
    });
});

// Agregar o quitar una publicación de favoritos
router.post('/addFavorite/:id', authController.isLoggedIn, async (req, res) => {
    if (req.user){
        const { id } = req.params;
        const { email } = req.user;
        const path = '/publication/' + id;
        await db.query('SELECT * FROM favoritos WHERE usuario = ? AND publicacion = ?', [email, id], async (error, result) => {
            if (result.length > 0) {
                db.query('DELETE FROM favoritos WHERE usuario = ? AND publicacion = ?', [email, id])
                console.log("Se eliminó la publicación de favoritos")
                res.redirect(path)
            } else {
                await db.query('INSERT INTO favoritos VALUES (?, ?)', [email, id])
                console.log("Se guardó la publicación como favoritos")
                res.redirect(path)
            }
        })
    } else {
        res.redirect('/login')
    }
})

module.exports = router;
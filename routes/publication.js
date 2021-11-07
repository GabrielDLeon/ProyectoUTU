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
    res.redirect('/');
});

router.get('/:nroPublicacion/comments', authController.isLoggedIn, async (req, res) => {
    const {nroPublicacion} = req.params;
    db.query('SELECT * FROM view_preguntas WHERE nroPublicacion = ? ORDER BY fechaPregunta DESC', [nroPublicacion], (error, questions) => {
        res.render('publication/questions', {
            title: "Comentarios",
            user: req.user,
            questions,
        })
    });
});

// Entrar a una publicacion desde URL con el ID
router.get('/:nroPublicacion', authController.isLoggedIn, async (req, res) => {
    const { nroPublicacion } = req.params;
    if (req.user) { var { email } = req.user.data }
    db.query('SELECT nroPublicacion, titulo, descripcion, precio, emailVendedor, nombreVendedor, fechaPublicacion, idProducto, categoria, genero, material, marca, porcentaje, descuento FROM (view_publicaciones) WHERE nroPublicacion = ?', [nroPublicacion], async (error, publication) => {
        if (publication.length > 0) {
            const { emailVendedor } = publication[0];
            await db.query('SELECT imagen FROM fotos WHERE publicacion = ?', [nroPublicacion], async (error, images) => {
                await db.query('SELECT * FROM view_preguntas WHERE nroPublicacion = ? ORDER BY fechaPregunta DESC LIMIT 8', [nroPublicacion], async (error, questions) => {
                    await db.query('SELECT color FROM (publicacion INNER JOIN colorpubli ON publicacion.nroPublicacion = colorpubli.publicacion) WHERE nroPublicacion = ?', [nroPublicacion], async (error, colors) => {
                        await db.query('SELECT COUNT(idPregunta) AS count FROM view_preguntas WHERE nroPublicacion = ?', [nroPublicacion], async (error, qLimit) => {
                            await db.query('SELECT * FROM favoritos WHERE usuario = ? AND publicacion = ?', [email, nroPublicacion], async (error, favorite) => {
                                await db.query('SELECT talles.talle FROM (talles INNER JOIN curvas ON talles.talle = curvas.talle) WHERE curvas.publicacion = ? ORDER BY orden', [nroPublicacion], async (error, sizes) => {
                                    await db.query('SELECT nroPublicacion, precio, descuento, imagen FROM (view_publicaciones) WHERE emailVendedor = ? AND nroPublicacion != ? LIMIT 6', [emailVendedor, nroPublicacion], async (error, recommendations) => {
                                        await db.query('SELECT * from perfil WHERE email = ?', [emailVendedor], (error, perfil) => {
                                            res.render('publication/page', {
                                                title: publication[0].titulo,
                                                user: req.user,
                                                publication: publication[0],
                                                images,
                                                questions,
                                                qLimit: qLimit[0],
                                                favorite,
                                                sizes,
                                                colors,
                                                recommendations,
                                                profile: perfil[0]
                                            });
                                        })
                                    });
                                });
                            });
                        });
                    })
                });
            })
        } else {
            res.redirect('/')
        }
    });
});

//Eliminar pregunta
router.post('/question/delete/:id', authController.isLoggedIn, async (req,res) => {
    if (req.user) {
        const {id} = req.params;
        db.query('SELECT * from PREGUNTAS where idPregunta = ?', [id], (error, result) =>{
            const remitente = result[0].remitente
            const user = req.user.data.email
            const nroPublicacion = result[0].publicacion;
            if (remitente == user) {
            db.query('DELETE FROM preguntas WHERE idPregunta = ?', [id])
            const path = '/publication/' + nroPublicacion + '/#seccion-preguntas';
            res.redirect(path)
            } 
        })
    } else {
        res.redirect('/')
    }
})

// Enviar formulario de pregunta
router.post('/question/:id', authController.isLoggedIn, async (req, res) => {
    if (req.user){
        const { email } = req.user.data;
        const { id } = req.params;
        const { mensaje } = req.body;
        const currentDate = new Date();
        const newQuestion = {
            mensaje,
            fechaPregunta: currentDate,
            remitente: email,
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
                const vendedor = result[0].vendedor;
                db.query('INSERT INTO notificaciones (`usuario`, `pregunta`) VALUES (?, ?)', [vendedor, idPregunta]);
            })
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
            const currentDate = new Date();
            if (!respuesta) {
                const path = '/publication/' + id + '/#seccion-preguntas';
                return res.redirect(path);
            }
            await db.query('UPDATE preguntas SET respuesta = ?, fechaRespuesta = ? WHERE idPregunta = ?', [ respuesta, currentDate, idPregunta], async (error, result) => {
                // Envía la notificación
                await db.query('SELECT remitente FROM preguntas WHERE idPregunta = ?', [idPregunta], (error, result) => {
                    const {remitente} = result[0];
                    db.query('INSERT INTO notificaciones (`usuario`, `pregunta`) VALUES (?, ?)', [remitente, idPregunta]);
                })
                // Eliminar notificación de la pregunta del vendedor
                await db.query('SELECT idNotificacion FROM notificaciones WHERE pregunta = ?', [idPregunta], (error, result) => {
                    if (result.length > 0){
                        const {idNotificacion} = result[0];
                        db.query('DELETE FROM notificaciones WHERE idNotificacion = ?', [idNotificacion]);
                    } 
                })
                const path = '/publication/' + nroPublicacion + '/#seccion-preguntas';
                return res.redirect(path);
            });
        }
    })
});

// Agregar o quitar una publicación de favoritos
router.post('/addFavorite/:id', authController.isLoggedIn, async (req, res) => {
    if (req.user){
        const { id } = req.params;
        const { email } = req.user.data;
        const path = '/publication/' + id;
        await db.query('SELECT * FROM favoritos WHERE usuario = ? AND publicacion = ?', [email, id], async (error, result) => {
            if (result.length > 0) {
                db.query('DELETE FROM favoritos WHERE usuario = ? AND publicacion = ?', [email, id])
                res.redirect(path)
            } else {
                await db.query('INSERT INTO favoritos VALUES (?, ?)', [email, id])
                res.redirect(path)
            }
        })
    } else {
        res.redirect('/login')
    }
})

module.exports = router;
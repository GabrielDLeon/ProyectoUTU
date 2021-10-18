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

router.get('/', authController.isLoggedIn, async (req, res) => {
    if (req.user){
        const user = req.user;
        const {email} = user.data;
        if (user.data.tipo == 'empresa'){
            // Listado de notificaciones para la empresa
            db.query('SELECT idNotificacion, idPregunta, mensaje, fechaPregunta, publicacion.nroPublicacion AS idPublicacion, cuenta_personal.nombre AS remitente, visto FROM (notificaciones INNER JOIN preguntas ON notificaciones.pregunta = preguntas.idPregunta INNER JOIN publicacion ON publicacion.nroPublicacion = preguntas.publicacion INNER JOIN cuenta_personal ON cuenta_personal.email = preguntas.remitente) WHERE usuario = ? ORDER BY fechaPregunta DESC',[email], (error, result) => {
                res.render('notifications', {
                    title: "Notificaciones",
                    notifications: result,
                    user,
                });
                db.query('UPDATE notificaciones SET visto = 1 WHERE visto = 0 AND usuario = ?', [email]);
            })
        } else if (user.data.tipo == 'usuario'){
            // Listado de notificaciones para el usuario
            db.query('SELECT idNotificacion, idPregunta, respuesta, fechaRespuesta, publicacion.nroPublicacion AS idPublicacion, cuenta_empresa.nombre AS vendedor, visto FROM (notificaciones INNER JOIN preguntas ON notificaciones.pregunta = preguntas.idPregunta INNER JOIN publicacion ON publicacion.nroPublicacion = preguntas.publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE usuario = ? ORDER BY fechaRespuesta DESC',[email], (error, result) => {
                res.render('notifications', {
                    title: "Notificaciones",
                    notifications: result,
                    user,
                });
                db.query('UPDATE notificaciones SET visto = 1 WHERE visto = 0 AND usuario = ?', [email]);
            })
        } else {
            // Usuario no iniciado
            console.log("No se ha iniciado sesión con un usuario");
            res.redirect('/');
        }
    } else {
        console.log("No se ha iniciado sesión con un usuario");
        res.redirect('/');
    }
});

router.post('/delete/:notification', authController.isLoggedIn, async (req, res) => {
    if (req.user) {
        const { email } = req.user.data;
        const { notification } = req.params;
        db.query('SELECT idNotificacion FROM (notificaciones INNER JOIN cuentas ON notificaciones.usuario = cuentas.email) WHERE email = ? AND idNotificacion = ?', [email, notification], async (error, result) => {
            if (result) {
                await db.query('DELETE FROM notificaciones WHERE idNotificacion = ?', [notification], (error, results) => {
                    if (error) {
                        console.log(error)
                        return res.redirect('/notifications')
                    } else {
                        console.log("Se ha eliminado correctamente la notificación " + notification)
                        return res.redirect('/notifications')
                    }
                });
            } else {
                console.log("El usuario y la notificación NO coinciden")
                res.redirect('/notifications')
            }
        })
    } else {
        console.log("No se ha iniciado sesión con un usuario");
        res.redirect('/');
    }
});

module.exports = router;
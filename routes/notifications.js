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
        const {email} = req.user.data;
        db.query('SELECT idNotificacion,  nroPublicacion, visto, idPregunta, fechaPregunta, mensaje, nombreRemitente, fechaRespuesta, respuesta, nombreVendedor, imagen FROM (notificaciones INNER JOIN view_preguntas ON notificaciones.pregunta = view_preguntas.idPregunta LEFT JOIN fotos ON fotos.publicacion = nroPublicacion) WHERE notificaciones.usuario = ? GROUP BY notificaciones.idNotificacion ORDER BY fechaPregunta DESC',[email], (error, result) => {
            res.render('notifications', {
                title: "Notificaciones",
                notifications: result,
                user: req.user,
            });
            db.query('UPDATE notificaciones SET visto = 1 WHERE visto = 0 AND usuario = ?', [email]);
        });
    } else {
        res.redirect('/login');
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
                        return res.redirect('/notifications')
                    }
                });
            } else {
                res.redirect('/notifications')
            }
        })
    } else {
        res.redirect('/');
    }
});

module.exports = router;
const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

// Cargar página Crear nuevo enlace
router.get('/newEnlace/:id', authController.isLoggedIn, async (req, res) => {
    const { email } = req.user.data;
    await db.query('SELECT cuentas.email , cuentas.password, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email) WHERE cuentas.email = ?', [email], (error, result2) => {
        if (!result2) {
            console.log(error)
        }
        const { id } = req.params;
        db.query('SELECT cuenta_empresa.email , cuenta_empresa.id FROM cuenta_empresa WHERE cuenta_empresa.email = ?', [email], async (error, result) => {
            db.query('SELECT * FROM enlaces_tipos', async (error, tipo) => {
                if (result[0].id == id) {
                    res.render('profile/newEnlace', {
                        user: req.user.data,
                        tipo,
                        title: "Agregar enlace"
                    })
                } else {
                    res.redirect('/')
                }
            });
        });
    });
});

// Crear nuevo enlace
router.post('/newEnlace/:id', authController.isLoggedIn, async (req, res) => {
    const { email } = req.user.data;
    const { tipo, link } = req.body;
    await db.query('SELECT * FROM enlaces_tipos', async (error, tipoEnlace) => {
        await db.query('SELECT tipo from enlaces WHERE tipo = ? AND propietario = ?', [tipo, email], async (error, enlaces) => {
            if (enlaces.length > 0) {
                return res.render('profile/newEnlace', {
                    name: req.body.name,
                    message: 'No puedes agregar dos enlaces para el mismo tipo de red social',
                    user: req.user.data,
                    tipoEnlace
                })
            }
            if (!link) {
                return res.render('profile/newEnlace', {
                    name: req.body.name,
                    message: 'Por favor ingrese un enlace antes de agregar',
                    user: req.user.data,
                    enlaces,
                    tipoEnlace
                })
            }
            db.query('INSERT INTO enlaces SET ?', { tipo: tipo, URL: link, propietario: email }, (error, results) => {
                if (error) {
                    console.log(error)
                } else {
                    return res.render('profile/newEnlace', {
                        user: req.user.data,
                        linkAgregado: 'Enlace agregado',
                        enlaces,
                        tipoEnlace
                    });
                }
            });
        });
    });
});

// Cargar página Editar enlace
router.get('/enlaces/edit/:id', authController.isLoggedIn, async (req, res) => {
    console.log(req.user);
    const {email} = req.user.data;
    await db.query('SELECT tipo, URL, propietario, id FROM enlaces INNER JOIN cuenta_empresa ON cuenta_empresa.email = enlaces.propietario WHERE propietario = ?', [email], (error, enlaces) => {
        db.query('SELECT * from enlaces_tipos', (error, tipos) => {
            res.render('profile/editEnlaces', {
                user: req.user.data,
                title: "Editar redes sociales",
                enlaces,
                tipos
            });
        });
    });
});

// Editar enlace
router.post('/enlaces/edit/:id', authController.isLoggedIn, async (req, res) => {
    const email = req.user.data.email
    const { Whatsapp, Instagram, Facebook } = req.body
    await db.query('SELECT tipo, URL, propietario, id FROM enlaces INNER JOIN cuenta_empresa ON cuenta_empresa.email = enlaces.propietario WHERE propietario = ?', [email], (error, enlaces) => {
        /*if (!Whatsapp || !Instagram || !Facebook) {
            res.render('profile/editEnlaces', {
              user: req.user.data,
              title: "Editar redes sociales",
              enlaces,
              message: "No puedes dejar campos vacios"
                }) 
              } else { */
        var tipo = enlaces.map((element) => { return _.pick(element, ['tipo']) })
        tipo.forEach((imagen) => {
            console.log(imagen)
            const tipos = imagen.tipo
            console.log(tipos)
            if (tipos === 'Facebook') {
                db.query('UPDATE enlaces set ? WHERE enlaces.tipo = ? AND enlaces.propietario = ? ', [{ URL: Facebook }, tipos, email]);
            }
            if (tipos === 'Instagram') {
                db.query('UPDATE enlaces set ? WHERE enlaces.tipo = ? AND enlaces.propietario = ? ', [{ URL: Instagram }, tipos, email]);
            }
            if (tipos === 'Whatsapp') {
                db.query('UPDATE enlaces set ? WHERE enlaces.tipo = ? AND enlaces.propietario = ? ', [{ URL: Whatsapp }, tipos, email]);
            }
        })
        res.redirect(req.originalUrl);

    })
});

// Eliminar enlace
router.post('/enlaces/delete/:tipo', authController.isLoggedIn, async (req, res) => {
    const {email} = req.user.data;
    const {tipo} = req.params;
    await db.query('DELETE FROM enlaces WHERE tipo = ? AND enlaces.propietario = ?', [tipo, email]);
    const path = '/profile/edit/'+req.user.data.id;
    res.redirect(path);
});

module.exports = router;
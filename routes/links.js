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

function getLinks (email, callback) {
    db.query('SELECT * FROM enlaces WHERE propietario = ? AND tipo = "whatsapp"', [email], (error, whatsapp) => {
        db.query('SELECT * FROM enlaces WHERE propietario = ? AND tipo = "facebook"', [email], (error, facebook) => {
            db.query('SELECT * FROM enlaces WHERE propietario = ? AND tipo = "instagram"', [email], (error, instagram) => {
                const result = {
                    whatsapp: whatsapp[0],
                    facebook: facebook[0],
                    instagram: instagram[0],
                }
                return callback(null, result);
            });
        });
    });
}

function numberToLink(phone, callback) {
    let number = phone.substring(1);
    let link = 'https://wa.me/598'+number;
    return callback(null, link);
}

// Cargar página Crear nuevo enlace
router.get('/newLink', authController.isLoggedIn, async (req, res) => {
    if (req.user.data.tipo == 'empresa'){
        const { email } = req.user.data;
        getLinks(email, function(error, result){
            numberToLink(result.whatsapp.URL, function(error, wpplink){
                res.render('profile/newEnlace', {
                    whatsapp: result.whatsapp,
                    facebook: result.facebook,
                    instagram: result.instagram,
                    user: req.user,
                    wpplink,
                    title: "Agregar enlace"
                });
            });
        });
    } else {
        res.redirect('/login');
    }
});

// Crear nuevo enlace
router.post('/newLink/:rs', authController.isLoggedIn, async (req, res) => {
    if (req.user){
        const { email } = req.user.data;
        const { URL } = req.body;
        const { rs } = req.params;
        db.query('SELECT * FROM enlaces WHERE propietario = ? AND tipo = ?', [email, rs], (error, result) => {
            if (result.length>0){
                let query = 'UPDATE enlaces SET URL = "'+URL+'" WHERE tipo = "'+rs+'" AND propietario = "'+email+'"';
                console.log(query);
                db.query(query);
                res.redirect('/profile/links/newLink');
            } else {
                db.query('INSERT INTO enlaces (tipo, URL, propietario) VALUES (?, ?, ?)', ['instagram', instagram, email], (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        res.render('profile/newEnlace', {
                            user: req.user,
                            linkAgregado: 'Enlace agregado',
                            title: "Agregar enlaces"
                        });
                    }
                });
            }
        });
    } else {
        res.redirect('/login');
    }
    
    // await db.query('SELECT * FROM enlaces_tipos', async (error, tipoEnlace) => {
    //     await db.query('SELECT tipo from enlaces WHERE tipo = ? AND propietario = ?', [tipo, email], async (error, enlaces) => {
    //         if (enlaces.length > 0) {
    //             return res.render('profile/newEnlace', {
    //                 name: req.body.name,
    //                 message: 'No puedes agregar dos enlaces para el mismo tipo de red social',
    //                 data: req.user.data,
    //                 user: req.user,
    //                 tipoEnlace,
    //                 title: "Agregar enlaces"
    //             })
    //         }
    //         if (!link) {
    //             return res.render('profile/newEnlace', {
    //                 name: req.body.name,
    //                 message: 'Por favor ingrese un enlace antes de agregar',
    //                 data: req.user.data,
    //                 user: req.user,
    //                 enlaces,
    //                 tipoEnlace,
    //                 title: "Agregar enlaces"
    //             })
    //         }
    //         if (!tipo) {
    //             return res.render('profile/newEnlace', {
    //                 name: req.body.name,
    //                 message: 'Por favor seleccione el tipo de enlace antes de agregar',
    //                 data: req.user.data,
    //                 user: req.user,
    //                 enlaces,
    //                 tipoEnlace,
    //                 title: "Agregar enlaces"
    //             })
    //         }
    //         db.query('INSERT INTO enlaces SET ?', { tipo: tipo, URL: link, propietario: email }, (error, results) => {
    //             if (error) {
    //                 console.log(error)
    //             } else {
                    // return res.render('profile/newEnlace', {
                    //     data: req.user.data,
                    //     user: req.user,
                    //     linkAgregado: 'Enlace agregado',
                    //     enlaces,
                    //     tipoEnlace,
                    //     title: "Agregar enlaces"
                    // });
    //             }
    //         });
    //     });
    // });
});

// Cargar página Editar enlace
router.get('/enlaces/edit/:id', authController.isLoggedIn, async (req, res) => {
    const {email} = req.user.data;
    const {id} = req.params
    await db.query('SELECT tipo, URL, propietario, id FROM enlaces INNER JOIN cuenta_empresa ON cuenta_empresa.email = enlaces.propietario WHERE propietario = ?', [email], (error, enlaces) => {    
        if (enlaces[0].id == id) {
        db.query('SELECT * from enlaces_tipos', (error, tipos) => {
            res.render('profile/editEnlaces', {
                data: req.user.data,
                user: req.user,
                title: "Editar redes sociales",
                enlaces,
                tipos
            });
        });
    } else {
        res.redirect('/')
    }
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
            const tipos = imagen.tipo
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
const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();
var _ = require('lodash');
var _ = require('lodash/core');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

// Cargar página Crear nuevo enlace
router.get('/', authController.isLoggedIn, async (req, res) => {
    if (req.user) {
        if (req.user.data.tipo == 'empresa'){
            const { email } = req.user.data;
            getLinks(email, function(error, result){
                if (result.whatsapp){
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
                } else {
                    res.render('profile/newEnlace', {
                        whatsapp: result.whatsapp,
                        facebook: result.facebook,
                        instagram: result.instagram,
                        user: req.user,
                        title: "Agregar enlace"
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/login');
    }
});

// Crear nuevo enlace
router.post('/update/:rs', authController.isLoggedIn, async (req, res) => {
    if (req.user){
        const { email } = req.user.data;
        const { URL } = req.body;
        const { rs } = req.params;
        db.query('SELECT * FROM enlaces WHERE propietario = ? AND tipo = ?', [email, rs], (error, result) => {
            getLinks(email, function(error, links){
            if (URL.length < 9) {
                return res.render('profile/newEnlace', {
                    whatsapp: links.whatsapp,
                    facebook: links.facebook,
                    instagram: links.instagram,
                    user: req.user,
                    title: "Agregar enlace",
                    message: "Ingrese un número válido"
                });
            }
            if (result.length>0){
                let query = 'UPDATE enlaces SET URL = "'+URL+'" WHERE tipo = "'+rs+'" AND propietario = "'+email+'"';
                db.query(query);
                res.redirect('/links');
            } else {
                db.query('INSERT INTO enlaces (tipo, URL, propietario) VALUES (?, ?, ?)', [rs, URL, email], (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        res.redirect('/links');
                    }
                });
            }
        });
    })
    } else {
        res.redirect('/login');
    }
});

// Eliminar enlace
router.get('/delete/:rs', authController.isLoggedIn, async (req, res) => {
    if (req.user){
        const {email} = req.user.data;
        const {rs} = req.params;
        db.query('SELECT tipo FROM enlaces WHERE tipo = ? AND propietario = ?', [rs, email], (error, result) => {
            // Si existe el enlace, eliminarlo
            if (result.length>0){
                db.query('DELETE FROM enlaces WHERE tipo = ? AND enlaces.propietario = ?', [rs, email]);
                res.redirect('/links');
            } else {
                res.redirect('/links');
            }
        })
        
    } else {
        res.redirect('/login');
    }
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

module.exports = router;
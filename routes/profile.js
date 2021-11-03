const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const multer = require('multer');
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');

const upload = multer({ storage: multer.memoryStorage() });

const db = mysql.createConnection({
   host: process.env.DATABASE_HOST,
   user: process.env.DATABASE_USER,
   password: process.env.DATABASE_PASSWORD,
   database: process.env.DATABASE
});

function paginations(page, quantity, query, path, callback) {
   let end = (page * quantity);
   let start = end - quantity;
   db.query(query, [quantity, start], (error, recommendations) => {
       if (recommendations.length > 0) {
           db.query(query, [quantity, (start + quantity)], (error, existNextPage) => {
               if (existNextPage.length > 0) { var pagination = { lastPage: page - 1, actualPage: page, nextPage: page + 1, path} }
               else { var pagination = { lastPage: page - 1, actualPage: page, path} }
               return (callback(null, {
                   recommendations,
                   pagination,
               }))
           })
       } else {
           return callback();
       }
   });
}

router.get('/', authController.isLoggedIn, async (req, res) => {
   if (req.user.data.tipo == 'empresa') {
      const { nombre } = req.user.data;
      const path = '/profile/' + nombre + '?page=1';
      res.redirect(path);
   } else {
      res.redirect('/')
   }
});

router.get('/:nombre', authController.isLoggedIn, async (req, res) => {
   const { nombre } = req.params;
   if (req.query.page) {
      await db.query('SELECT * FROM cuenta_empresa WHERE nombre = ?', [nombre], (error, search) => {
         // Verifica que exista una cuenta de empresa con ese nombre
         if (search.length > 0) {
            db.query('SELECT fotoPerfil, nombre, email, direccion, descripcion, telefono  FROM (perfil) WHERE nombre = ?', [nombre], (error, profile) => {
               const email = profile[0].email;
               db.query('SELECT tipo, URL, propietario, nombre FROM (enlaces INNER JOIN perfil ON enlaces.propietario = perfil.email) WHERE propietario = ?', [email], async (error, redes) => {
                  db.query('SELECT nroPublicacion FROM view_publicaciones WHERE view_publicaciones.nombreVendedor = ?', [nombre], (error, existPublications) => {
                     if (existPublications.length>0) {
                        const page = JSON.parse(req.query.page);
                        const query = 'SELECT nroPublicacion, precio, descuento, imagen FROM view_publicaciones WHERE view_publicaciones.nombreVendedor = "' + nombre + '" GROUP BY view_publicaciones.nroPublicacion LIMIT ? OFFSET ?';
                        let path = '/profile/' + nombre + '?';
                        paginations(page, 9, query, path, function (error, result) {
                           if (result) {
                              res.render('profile/profile', {
                                 recommendations: result.recommendations,
                                 pagination: result.pagination,
                                 profile: profile[0],
                                 data: search[0],
                                 user: req.user,
                                 title: search[0].nombre,
                                 redes
                              })
                           } else {
                              path += 'page=1';
                              res.redirect(path);
                           }
                        });
                     } else {
                        res.render('profile/profile', {
                           profile: profile[0],
                           data: search[0],
                           user: req.user,
                           title: search[0].nombre,
                           redes
                        })
                     }
                  })
               });
            });
         } else { res.redirect('/'); }
      });
   } else {
      const path = '/profile/' + nombre + '?page=1';
      res.redirect(path);
   }
});

router.get('/edit/pass/:id', authController.isLoggedIn, async (req, res) => {
   if (req.user.data.tipo == 'empresa') {
      const { email } = req.user.data;
      const { id } = req.params;
      db.query('SELECT cuentas.email, cuentas.password, cuenta_empresa.id FROM cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email WHERE cuentas.email = ?', [email], async (error, result) => {
         if (result[0].id == id) {
            res.render('profile/editAccount', {
               data: result[0],
               user: req.user,
               title: "Cambiar contraseña"
            })
         } else {
            res.redirect('/')
         }
      })
   } else if (req.user.data.tipo == 'usuario') {
      const { email } = req.user.data;
      const { id } = req.params;
      db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuentas.email = ?', [email], async (error, result) => {
         if (result[0].id == id) {
            res.render('profile/editAccount', {
               data: result[0],
               user: req.user.data,
               title: "Cambiar contraseña"
            })
         } else {
            res.redirect('/')
         }
      })
   }
});

router.post('/edit/pass/:id', authController.isLoggedIn, async (req, res) => {
   const { email } = req.user.data;
   if (req.user.data.tipo == 'empresa') {
      await db.query('SELECT cuentas.email, cuentas.password, cuenta_empresa.id FROM cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email WHERE cuentas.email = ?', [email], async (error, result) => {
         const email = result[0].email;
         const { pass, newPass, newPassConfirm } = req.body;
         if (result.length == 0 || !(await bcrypt.compare(pass, result[0].password))) {
            return res.status(401).render('profile/editAccount', {
               nombre: req.body.name,
               data: result[0],
               user: req.user,
               message: 'Contraseña incorrecta',
               title: 'Cambiar contraseña'
            })
         }
         if (newPass !== newPassConfirm) {
            return res.render('profile/editAccount', {
               data: result[0],
               message: 'Las contraseñas no coinciden',
               user: req.user,
               pass: req.body.pass,
               title: 'Cambiar contraseña'
            })
         }
         if (!newPassConfirm || !newPass || !pass) {
            return res.render('profile/editAccount', {
               user: req.user,
               message: "Complete todos los campos",
            })
         }
         let hashedPassword = await bcrypt.hash(newPass, 8);
         db.query('UPDATE cuentas set ? WHERE email = ?', [{ password: hashedPassword }, email]);
         res.redirect(req.originalUrl);
      })
   } else {
      await db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuentas.email = ?', [email], async (error, result) => {
         const email = result[0].email;
         const { pass, newPass, newPassConfirm } = req.body;
         if (result.length == 0 || !(await bcrypt.compare(pass, result[0].password))) {
            return res.status(401).render('profile/editAccount', {
               nombre: req.body.name,
               data: result[0],
               user: req.user,
               message: 'Contraseña incorrecta',
               title: 'Cambiar contraseña'
            })
         }
         if (newPass !== newPassConfirm) {
            return res.render('profile/editAccount', {
               data: result[0],
               message: 'Las contraseñas no coinciden',
               user: req.user,
               title: 'Cambiar contraseña'
            })
         }
         else if (!newPassConfirm || !newPass || !pass) {
            return res.render('profile/editAccount', {
               user: req.user,
               message: "Complete todos los campos"
            })
         }
         let hashedPassword = await bcrypt.hash(newPass, 8);
         db.query('UPDATE cuentas set ? WHERE email = ?', [{ password: hashedPassword }, email]);
         res.redirect(req.originalUrl);
      })
   }
});

router.get('/edit/:id', authController.isLoggedIn, async (req, res) => {
   const email = req.user.data.email;
   if (req.user.data.tipo == 'usuario') {
      await db.query('SELECT cuentas.email , cuentas.password, cuentas.tipo, cuenta_personal.nombre, cuenta_personal.id FROM (cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email) WHERE cuentas.email = ?', [email], (error, result2) => {
         if (!result2) {
            console.log(error)
         }
         const { email } = req.user.data;
         const { id } = req.params;
         db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id, cuentas.tipo FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?', [email], async (error, result) => {
            if (result[0].id == id) {
               res.render('profile/editProfile', {
                  data: req.user.data,
                  user: req.user,
                  title: 'Editar perfil',
                  data: req.user.data,
               })
            } else {
               res.redirect('/')
            }
         })
      })
   } if (req.user.data.tipo == 'empresa') {
      await db.query('SELECT cuentas.email , cuentas.password , cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?', [email], (error, result2) => {
         if (!result2) {
            console.log(error)
         }
         const { email } = req.user.data;
         const { id } = req.params;
         db.query('SELECT cuentas.email , cuentas.password, perfil.fotoPerfil, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id, razonSocial, descripcion, direccion, telefono FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?', [email], async (error, result) => {
            db.query('SELECT tipo, URL, propietario, id FROM enlaces INNER JOIN cuenta_empresa ON cuenta_empresa.email = enlaces.propietario WHERE propietario = ?', [email], (error, enlaces) => {
               db.query('SELECT COUNT(tipo) as redes FROM enlaces WHERE propietario = ?', [email], (error, count) => {
                  if (result[0].id == id) {
                     res.render('profile/editEmpresa', {
                        data: result[0],
                        user: req.user,
                        title: 'Editar perfil',
                        enlaces,
                        redes: count[0].redes
                     })
                  } else {
                     res.redirect('/')
                  }
               });
            });
         });
      });
   }
});

router.post('/delete/:id', authController.isLoggedIn, async (req, res) => {
   if (req.user) {
      const email = req.user.data.email
      db.query('DELETE FROM cuentas WHERE `email` = ?', [email])
      res.clearCookie('jwt')
      return res.redirect('/')
   } else {
      res.redirect('/')
   }
});

router.post('/edit/:id', upload.single("imagen"), authController.isLoggedIn, async (req, res) => {
   const { email } = req.user.data;
   if (req.user.data.tipo == 'usuario') {
      await db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?', [email], async (error, result) => {
         const { id } = req.params;
         const email = result[0].email;
         const { nombre, mail } = req.body;
         if (!nombre) {
            return res.render('profile/editProfile', {
               email: req.body.email,
               nombre: req.body.nombre,
               data: req.user.data,
               user: req.user,
               message: "Por favor, ingrese su nombre",
               title: 'Editar perfil'
            })
         }
         db.query('UPDATE cuenta_personal set ? WHERE id = ?', [{ nombre: nombre }, id]);
         if (mail != email) {
         db.query('UPDATE cuentas set ? WHERE email = ?', [{ email: mail }, email]);
         res.clearCookie('jwt');
         return res.redirect('/');
      } else {return res.redirect(req.originalUrl);}
      })
   } else if (req.user.data.tipo == 'empresa') {
      await db.query('SELECT cuentas.email , cuentas.password, perfil.fotoPerfil, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id, razonSocial, descripcion, direccion, telefono FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?', [email], async (error, result) => {
         const { id } = req.params;
         const email = result[0].email;
         const { nombre, descripcion, direccion, telefono, razon, mail } = req.body;
         if (!nombre, !email) {
            return res.render('profile/editEmpresa', {
               data: result[0],
               email: req.body.email,
               nombre: req.body.nombre,
               descripcion: req.body.descripcion,
               direccion: req.body.direccion,
               telefono: req.body.telefono,
               user: req.user,
               message: "Por favor, ingrese un nombre"
            })
         }
         else if (req.file.length > 0) {
            imagen = req.file.buffer.toString('base64');
            db.query('UPDATE perfil set ? WHERE email = ?', [{ fotoPerfil: imagen }, email]);
         }
         db.query('UPDATE perfil set ? WHERE email = ?', [{ descripcion: descripcion, direccion: direccion, telefono: telefono }, email]);
         db.query('UPDATE cuenta_empresa set ? WHERE id = ?', [{ nombre: nombre, razonSocial: razon }, id]);
         if (mail != email) {
            db.query('UPDATE cuentas SET ? WHERE email = ?', [{ email: mail }, email]);
            res.clearCookie('jwt')
            return res.redirect('/login')
         }
         res.redirect(req.originalUrl);
      });
   }
});

module.exports = router;
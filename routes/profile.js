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
// Load the FP build for immutable auto-curried iteratee-first data-last methods.
var fp = require('lodash/fp');
 
// Load method categories.
var array = require('lodash/array');
var object = require('lodash/fp/object');
 
// Cherry-pick methods for smaller browserify/rollup/webpack bundles.
var at = require('lodash/at');
var curryN = require('lodash/fp/curryN');

const upload = multer({storage:multer.memoryStorage()});

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

router.get('/', authController.isLoggedIn, async (req, res) => {
  if (req.user.tipo == 'empresa') {
    const { nombre } = req.user;
    await db.query('SELECT * FROM cuenta_empresa WHERE nombre = ?', [nombre], (error, result) => {
      if (result.length > 0) {
        const email = req.user.email;
        db.query('SELECT tipo, URL, propietario, nombre FROM enlaces INNER JOIN perfil ON enlaces.propietario = perfil.email WHERE propietario = ?', [email], async (error, redes) => {
          db.query('SELECT direccion, descripcion, telefono, fotoPerfil, nombre FROM perfil WHERE nombre = ?', [nombre], (error, result1) => {
            db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.nombre AS vendedor FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE cuenta_empresa.nombre = ?', [nombre], (error, publicacion) => {
              res.render('profile/profile', {
                publicacion,
                profile: result1[0],
                data: result[0],
                user: req.user,
                title: result[0].nombre,
                redes
              })
            });

          });
        })
      } else {
        res.redirect('/');
      }

    })
  } else {
    res.redirect('/login')
  }
});

router.get('/newEnlace/:id', authController.isLoggedIn, async (req, res) => {
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  await db.query('SELECT cuentas.email , cuentas.password, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email) WHERE cuentas.email = ?', [decoded.id], (error, result2) => {
    if (!result2) {
      console.log(error)
    }
    req.user = result2[0];
    const { email } = req.user;
    const { id } = req.params;
    db.query('SELECT cuenta_empresa.email , cuenta_empresa.id FROM cuenta_empresa WHERE cuenta_empresa.email = ?', [email], async (error, result) => {
      db.query('SELECT * FROM enlaces_tipos', async (error, tipo) => {
        if (result[0].id == id) {
          res.render('profile/newEnlace', {
            user: req.user,
            tipo,
            title: "Agregar enlace"
          })
        } else {
          res.redirect('/')
        }
      })
    })
  })
})

router.post('/newEnlace/:id', authController.isLoggedIn, async (req, res) => {
  const email = req.user.email;
  await db.query('SELECT cuentas.email, cuentas.password, cuenta_empresa.nombre, cuenta_empresa.id FROM cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email WHERE cuenta_empresa.email = ?', [email], async (error, result) => {
    const email = result[0].email
    const { tipo } = req.body;
    const { link } = req.body;
    await db.query('SELECT * FROM enlaces_tipos', async (error, tipoEnlace) => {
      await db.query('SELECT tipo from enlaces WHERE tipo = ? AND propietario = ?', [tipo,email], async (error, enlaces) => {
        if (enlaces.length > 0) {
          return res.render('profile/newEnlace', {
            name: req.body.name,
            message: 'No puedes agregar dos enlaces para el mismo tipo de red social',
            user: req.user,
            tipoEnlace
          })
        }
        if (!link) {
          return res.render('profile/newEnlace', {
            name: req.body.name,
            message: 'Ingrese un link antes de agregar',
            user: req.user,
            enlaces,
            tipoEnlace
          })
        }
        db.query('INSERT INTO enlaces SET ?', { tipo: tipo, URL: link, propietario: email }, (error, results) => {
          if (error) {
            console.log(error)
          } else {
            return res.render('profile/newEnlace', {
              user: req.user,
              linkAgregado: 'Link agregado',
              enlaces,
              tipoEnlace
            });
          }
        })
      })
    })
  })
});

router.get('/:nombre', authController.isLoggedIn, async (req, res) => {
  const { nombre } = req.params;
  await db.query('SELECT * FROM cuenta_empresa WHERE nombre = ?', [nombre], (error, result) => {
    if (result.length > 0) {
      db.query('SELECT direccion, descripcion, telefono, nombre, email FROM perfil WHERE nombre = ?', [nombre], (error, result1) => {
        const email = result1[0].email;
        db.query('SELECT tipo, URL, propietario, nombre FROM enlaces INNER JOIN perfil ON enlaces.propietario = perfil.email WHERE propietario = ?', [email], async (error, redes) => {
          db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.nombre AS vendedor FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE cuenta_empresa.nombre = ?', [nombre], (error, publicacion) => {
            res.render('profile/profile', {
              publicacion,
              profile: result1[0],
              data: result[0],
              user: req.user,
              title: result[0].nombre,
              redes
            })
          })
        })
      });
    } else { res.redirect('/'); }
  });
});

router.get('/edit/:id', authController.isLoggedIn, async (req, res) => {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    if (req.user.tipo == 'usuario') {
    await db.query('SELECT cuentas.email , cuentas.password, cuentas.tipo, cuenta_personal.nombre, cuenta_personal.id FROM (cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email) WHERE cuentas.email = ?', [decoded.id], (error, result2) => {
    if(!result2) {
      console.log(error)
    }
    req.user = result2[0];

    const {email} = req.user;
    const {id} = req.params;
     db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?',[email], async (error, result) => {
      if (result[0].id == id) {
        res.render('profile/editProfile', {
        user: req.user
        })
      } else {
        res.redirect('/')
      }
    })
  })
  } if (req.user.tipo == 'empresa') {
    await db.query('SELECT cuentas.email , cuentas.password , cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?', [decoded.id], (error, result2) => {
      if(!result2) {
        console.log(error)
      }
      req.user = result2[0];
      const {email} = req.user;
      const {id} = req.params;
       db.query('SELECT cuentas.email , cuentas.password, perfil.fotoPerfil, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id, razonSocial, descripcion, direccion, telefono FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?',[email], async (error, result) => {
        if (result[0].id == id) {
          res.render('profile/editEmpresa', {
          data: result[0],
          user: req.user,
          })
        } else {
          res.redirect('/')
        }
      })
    })
  }
})

router.post('/edit/:id', upload.single("imagen"), authController.isLoggedIn, async (req, res) => {
  const email = req.user.email;
  if (req.user.tipo == 'usuario') {
  await db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?',[email], async (error, result) => {
  const {id} = req.params;
  const email = result[0].email;
  const {nombre, pass , newPass, newPassConfirm} = req.body;
  const newData  = {
    nombre,
    newPass,
    pass,
    newPassConfirm
  };
          if( result.length == 0 || !(await bcrypt.compare(pass, result[0].password))) {
              return res.status(401).render('profile/editProfile', {
                nombre: req.body.name,
                user: req.user,
                message: 'Contraseña incorrecta'
              })
            }
            if( newPass !== newPassConfirm ) {
              return res.render('profile/editProfile', {
                name: req.body.name,
                message: 'Las contraseñas no coinciden',
                user: req.user
              })
            }
            else if (!nombre || !newPassConfirm || !newPass || !pass) {
              return res.render('profile/editProfile', {
                email: req.body.email,
                nombre: req.body.nombre,
                user: req.user,
                message: "Complete todos los campos"
              })
            } 
              let hashedPassword = await bcrypt.hash(newPass, 8);
              db.query('UPDATE cuentas set ? WHERE email = ?',[{password: hashedPassword} , email]);
              db.query('UPDATE cuenta_personal set ? WHERE id = ?',[{nombre:nombre}, id]);
              return res.render('profile/editProfile', {
                name: req.body.name,
                editCompleto: "Usuario editado correctamente",
                user: req.user
              })
            })
          } else if (req.user.tipo == 'empresa') {
            await db.query('SELECT cuentas.email , cuentas.password, perfil.fotoPerfil, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id, razonSocial, descripcion, direccion, telefono FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?',[email], async (error, result) => {
              const {id} = req.params;
              const email = result[0].email;
              const {nombre, pass , newPass, newPassConfirm, descripcion, direccion, telefono, razon} = req.body;
                      if( result.length == 0 || !(await bcrypt.compare(pass, result[0].password))) {
                          return res.status(401).render('profile/editEmpresa', {
                            nombre: req.body.name,
                            data: result[0],
                            user: req.user,
                            message: 'Contraseña incorrecta'
                          })
                        }
                        if( newPass !== newPassConfirm ) {
                          return res.render('profile/editEmpresa', {
                            name: req.body.name,
                            data: result[0],
                            message: 'Las contraseñas no coinciden',
                            user: req.user
                          })
                        }
                        else if (!nombre || !newPassConfirm || !newPass || !pass || !descripcion || !direccion) {
                          return res.render('profile/editEmpresa', {
                            data: result[0],
                            email: req.body.email,
                            nombre: req.body.nombre,
                            descripcion: req.body.descripcion,
                            direccion: req.body.direccion,
                            telefono: req.body.telefono,
                            user: req.user,
                            message: "Complete todos los campos"
                          })
                        } 
                          let hashedPassword = await bcrypt.hash(newPass, 8);
                          imagen = req.file.buffer.toString('base64');
                          db.query('UPDATE cuentas set ? WHERE email = ?',[{password: hashedPassword} , email]);
                          db.query('UPDATE cuenta_empresa set ? WHERE id = ?',[{nombre:nombre, razonSocial:razon}, id]);
                          db.query('UPDATE perfil set ? WHERE email = ?',[{descripcion:descripcion , direccion:direccion , telefono:telefono, fotoPerfil:imagen}, email]);
                          return res.render('profile/editEmpresa', {
                            name: req.body.name,
                            data: result[0],
                            editCompleto: "Datos editados correctamente",
                            user: req.user
                          })
                    })
            }
          });

router.get('/delete/:mail' , authController.deleteUser, async (req, res) => {
    res.redirect('/login')
  })


module.exports = router;
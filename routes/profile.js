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

const upload = multer({storage:multer.memoryStorage()});

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

router.get('/', authController.isLoggedIn, async (req, res) => {
  if (req.user.data.tipo == 'empresa') {
    const { nombre } = req.user.data;
    await db.query('SELECT * FROM cuenta_empresa WHERE nombre = ?', [nombre], (error, result) => {
      if (result.length > 0) {
        const {email} = req.user.data;
        db.query('SELECT tipo, URL, propietario, nombre FROM enlaces INNER JOIN perfil ON enlaces.propietario = perfil.email WHERE propietario = ?', [email], async (error, redes) => {
          db.query('SELECT direccion, descripcion, telefono, fotoPerfil, nombre FROM perfil WHERE nombre = ?', [nombre], (error, result1) => {
            db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.nombre AS vendedor, descuento.porcentaje FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN descuento ON descuento.publication = publicacion.nroPublicacion) WHERE cuenta_empresa.nombre = ?', [nombre], (error, publicacion) => {
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
    req.user.data = result2[0];
    const { email } = req.user.data;
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
  const {email} = req.user.data;
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
            message: 'Por favor ingrese un enlace antes de agregar',
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
              linkAgregado: 'Enlace agregado',
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
          db.query('SELECT nroPublicacion, precio, precio-precio*descuento.porcentaje/100 AS descuento, imagen FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email INNER JOIN producto ON producto.idProducto = publicacion.producto LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion LEFT JOIN descuento ON descuento.publication = publicacion.nroPublicacion) WHERE cuenta_empresa.nombre = ? GROUP BY nroPublicacion', [nombre], (error, recommendations) => {
            res.render('profile/profile', {
              recommendations,
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

router.get('/edit/pass/:id', authController.isLoggedIn, async (req, res) => {
    const email = req.user.data.email
    if (req.user.data.tipo == 'empresa') {
    const {email} = req.user.data;
    const {id} = req.params;
     db.query('SELECT cuentas.email, cuentas.password, cuenta_empresa.id FROM cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email WHERE cuentas.email = ?',[email], async (error, result) => {
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
})

router.post('/edit/pass/:id',authController.isLoggedIn, async (req, res)=>{
  const {email} = req.user.data;
  await db.query('SELECT cuentas.email, cuentas.password, cuenta_empresa.id FROM cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email WHERE cuentas.email = ?',[email], async (error, result) => {
    const email = result[0].email;
    const {pass , newPass, newPassConfirm} = req.body;
            if( result.length == 0 || !(await bcrypt.compare(pass, result[0].password))) {
                return res.status(401).render('profile/editAccount', {
                  nombre: req.body.name,
                  data: result[0],
                  user: req.user,
                  message: 'Contraseña incorrecta',
                  title: 'Cambiar contraseña'
                })
              }
              if(newPass !== newPassConfirm ) {
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
                db.query('UPDATE cuentas set ? WHERE email = ?',[{password: hashedPassword} , email]);
                res.redirect(req.originalUrl);
          })
})

router.get('/edit/:id', authController.isLoggedIn, async (req, res) => {
    const email = req.user.data.email
    if (req.user.data.tipo == 'usuario') {
    await db.query('SELECT cuentas.email , cuentas.password, cuentas.tipo, cuenta_personal.nombre, cuenta_personal.id FROM (cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email) WHERE cuentas.email = ?', [email], (error, result2) => {
    if(!result2) {
      console.log(error)
    }
    req.user = result2[0];
    const {email} = req.user;
    const {id} = req.params;
     db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?',[email], async (error, result) => {
      if (result[0].id == id) {
        res.render('profile/editProfile', {
        user: req.user,
        title: 'Editar perfil'
        })
      } else {
        res.redirect('/')
      }
    })
  })
  } if (req.user.data.tipo == 'empresa') {
    await db.query('SELECT cuentas.email , cuentas.password , cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?', [email], (error, result2) => {
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
          title: 'Editar perfil',
          })
        } else {
          res.redirect('/')
        }
      })
    })
  }
})

router.post('/edit/:id', upload.single("imagen"), authController.isLoggedIn, async (req, res) => {
  const {email} = req.user.data;
  if (req.user.data.tipo == 'usuario') {
  await db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?',[email], async (error, result) => {
  const {id} = req.params;
  const email = result[0].email;
  const {nombre, pass , newPass, newPassConfirm} = req.body;
          if( result.length == 0 || !(await bcrypt.compare(pass, result[0].password))) {
              return res.status(401).render('profile/editProfile', {
                nombre: req.body.name,
                user: req.user.data,
                message: 'Contraseña incorrecta',
                title: 'Editar perfil'
              })
            }
            if( newPass !== newPassConfirm ) {
              return res.render('profile/editProfile', {
                name: req.body.name,
                message: 'Las contraseñas no coinciden',
                user: req.user.data,
                title: 'Editar perfil'
              })
            }
            else if (!nombre || !newPassConfirm || !newPass || !pass) {
              return res.render('profile/editProfile', {
                email: req.body.email,
                nombre: req.body.nombre,
                user: req.user.data,
                message: "Complete todos los campos",
                title: 'Editar perfil'
              })
            } 
              let hashedPassword = await bcrypt.hash(newPass, 8);
              db.query('UPDATE cuentas set ? WHERE email = ?',[{password: hashedPassword} , email]);
              db.query('UPDATE cuenta_personal set ? WHERE id = ?',[{nombre:nombre}, id]);
              res.redirect(req.originalUrl);
              
            })
          } else if (req.user.data.tipo == 'empresa') {
            await db.query('SELECT cuentas.email , cuentas.password, perfil.fotoPerfil, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id, razonSocial, descripcion, direccion, telefono FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?',[email], async (error, result) => {
              const {id} = req.params;
              const email = result[0].email;
              const {nombre, descripcion, direccion, telefono, razon} = req.body;
                       /* else if (!nombre || !newPassConfirm || !newPass || !pass || !descripcion || !direccion) {
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
                        } */
                          if (req.file) { 
                          imagen = req.file.buffer.toString('base64');
                          db.query('UPDATE perfil set ? WHERE email = ?',[{fotoPerfil:imagen}, email]);
                        }
                          db.query('UPDATE perfil set ? WHERE email = ?',[{descripcion:descripcion , direccion:direccion , telefono:telefono}, email]);
                          db.query('UPDATE cuenta_empresa set ? WHERE id = ?',[{nombre:nombre, razonSocial:razon}, id]);
                          res.redirect(req.originalUrl);
                    })
            }
          });

router.get('/delete/:mail' , authController.deleteAccount, async (req, res) => {
    res.redirect('/login')
  })


module.exports = router;
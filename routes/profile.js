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
    const path = '/profile/' + nombre + '?page=1';
    res.redirect(path);
  } else {
    res.redirect('/')
  }
});

router.get('/:nombre', authController.isLoggedIn, async (req, res) => {
  const { nombre } = req.params;
  if (req.query.page){
    await db.query('SELECT * FROM cuenta_empresa WHERE nombre = ?', [nombre], (error, result) => {
      // Verifica que exista una cuenta de empresa con ese nombre
      if (result.length > 0) {
        db.query('SELECT fotoPerfil, nombre, email, direccion, descripcion, telefono  FROM (perfil) WHERE nombre = ?', [nombre], (error, result1) => {
          const email = result1[0].email;
          db.query('SELECT tipo, URL, propietario, nombre FROM (enlaces INNER JOIN perfil ON enlaces.propietario = perfil.email) WHERE propietario = ?', [email], async (error, redes) => {
            const page = JSON.parse(req.query.page);
            let muestra = 9; //Nro de publicaciones por página
            let final = (page*muestra);
            let inicio = final-muestra;
            const limit = { final, inicio }
            const query = 'SELECT nroPublicacion, precio, precio-precio*descuento.porcentaje/100 AS descuento, imagen FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email INNER JOIN productos ON productos.idProducto = publicacion.producto LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion LEFT JOIN descuento ON descuento.publication = publicacion.nroPublicacion) WHERE cuenta_empresa.nombre = ? GROUP BY nroPublicacion  LIMIT ? OFFSET ?'
            db.query(query, [nombre, muestra, inicio], (error, recommendations) => {
              db.query(query, [nombre, muestra, (inicio+muestra)], (error, existNextPage) => {
                if (existNextPage.length>0){ var pagination = { lastPage: page-1, actualPage: page, nextPage: page+1} }
                else { var pagination = { lastPage: page-1, actualPage: page} }
                res.render('profile/profile', {
                  recommendations,
                  pagination,
                  profile: result1[0],
                  data: result[0],
                  user: req.user,
                  title: result[0].nombre,
                  redes
                })
              })
            })
          })
        });
      } else { res.redirect('/'); }
    });
  } else {
    const path = '/profile/'+nombre+'?page=1';
    res.redirect(path);
  }
});

router.get('/newEnlace/:id', authController.isLoggedIn, async (req, res) => {
  const {email} = req.user.data;
  console.log(req.user.data)
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
      })
    })
  })
})

router.post('/newEnlace/:id', authController.isLoggedIn, async (req, res) => {
  const {email} = req.user.data;
  const { tipo , link } = req.body;
    await db.query('SELECT * FROM enlaces_tipos', async (error, tipoEnlace) => {
      await db.query('SELECT tipo from enlaces WHERE tipo = ? AND propietario = ?', [tipo,email], async (error, enlaces) => {
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
        })
      })
    })
});

router.get('/edit/pass/:id', authController.isLoggedIn, async (req, res) => {
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
  } else if (req.user.data.tipo == 'usuario'){
    const {email} = req.user.data;
    const {id} = req.params;
     db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuentas.email = ?',[email], async (error, result) => {
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
  if (req.user.data.tipo == 'empresa') {
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
                db.query('UPDATE cuentas set ? WHERE email = ?',[{password: hashedPassword} , email]);
                res.redirect(req.originalUrl);
          })
        } else {
          await db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuentas.email = ?',[email], async (error, result) => {
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
        }
})

router.get('/enlaces/edit/:id', authController.isLoggedIn, async (req, res) => {
  const email = req.user.data.email
  await db.query('SELECT tipo, URL, propietario, id FROM enlaces INNER JOIN cuenta_empresa ON cuenta_empresa.email = enlaces.propietario WHERE propietario = ?', [email], (error, enlaces) => {
    db.query('SELECT * from enlaces_tipos', (error, tipos) => {
      console.log(enlaces)
      res.render('profile/editEnlaces', {
      user: req.user.data,
      title: "Editar redes sociales",
      enlaces,
      tipos
      })
    })
  })
})

router.post('/enlaces/edit/:id', authController.isLoggedIn, async (req, res) => {
  const email = req.user.data.email
  const {Whatsapp, Instagram, Facebook} = req.body
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
                        const  tipos = imagen.tipo
                        console.log(tipos)
                        if (tipos === 'Facebook') {
                          db.query('UPDATE enlaces set ? WHERE enlaces.tipo = ? AND enlaces.propietario = ? ',[{URL:Facebook}, tipos,email]);
                        }
                        if (tipos === 'Instagram') {
                          db.query('UPDATE enlaces set ? WHERE enlaces.tipo = ? AND enlaces.propietario = ? ',[{URL:Instagram}, tipos,email]);
                        }
                        if (tipos === 'Whatsapp') {
                          db.query('UPDATE enlaces set ? WHERE enlaces.tipo = ? AND enlaces.propietario = ? ',[{URL:Whatsapp}, tipos,email]);
                        }
                    })
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
     db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id, cuentas.tipo FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?',[email], async (error, result) => {
      if (result[0].id == id) {
        res.render('profile/editProfile', {
        data: result[0],
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
         db.query('SELECT tipo, URL, propietario, id FROM enlaces INNER JOIN cuenta_empresa ON cuenta_empresa.email = enlaces.propietario WHERE propietario = ?', [email], (error, enlaces) => {
           db.query('SELECT COUNT(tipo) as redes FROM enlaces WHERE propietario = ?', [email], (error,count) => {
            if (result[0].id == id) {
              res.render('profile/editEmpresa', {
              data: result[0],
              user: req.user,
              title: 'Editar perfil',
              enlaces,
              redes: count[0]
              })
            } else {
              res.redirect('/')
            }
          })
          })
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
  const {nombre} = req.body;
           if (!nombre) {
              return res.render('profile/editProfile', {
                email: req.body.email,
                nombre: req.body.nombre,
                user: req.user.data,
                message: "Por favor, ingrese su nombre",
                title: 'Editar perfil'
              })
            } 
              db.query('UPDATE cuenta_personal set ? WHERE id = ?',[{nombre:nombre}, id]);
              res.redirect(req.originalUrl);
            })
          } else if (req.user.data.tipo == 'empresa') {
            await db.query('SELECT cuentas.email , cuentas.password, perfil.fotoPerfil, cuentas.tipo, cuenta_empresa.nombre, cuenta_empresa.id, razonSocial, descripcion, direccion, telefono FROM (cuentas INNER JOIN cuenta_empresa ON cuentas.email = cuenta_empresa.email INNER JOIN perfil ON perfil.email = cuenta_empresa.email) WHERE cuentas.email = ?',[email], async (error, result) => {
              const {id} = req.params;
              const email = result[0].email;
              const {nombre, descripcion, direccion, telefono, razon} = req.body;
                       if (!nombre) {
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
                          else if (req.file) { 
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
    res.redirect('/login');
})

module.exports = router;
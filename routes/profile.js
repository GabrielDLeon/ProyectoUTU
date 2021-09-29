const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

router.get('/', authController.isLoggedIn, (req, res) => {
    console.log(req.user);
    if( req.user ) {
      res.render('profile/profile', {
        user: req.user,
        title: "Perfil"
      });
    } else {
      res.redirect('/login');
    }
    
  })

router.get('/:nombre', authController.isLoggedIn, async (req, res) => {
  const {nombre} = req.params;
  await db.query('SELECT * FROM cuenta_empresa WHERE nombre = ?',[nombre], (error, result) => {
        if (result.length>0){
          console.log(nombre);
                db.query('SELECT direccion, descripcion, telefono, nombre FROM perfil WHERE nombre = ?', [nombre], (error, result1) => {
                  db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, cuenta_empresa.nombre AS vendedor FROM (publicacion INNER JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email) WHERE cuenta_empresa.nombre = ?', [nombre], (error, publicacion) => {
                    console.log(result);
                    console.log("resultado de perfil")
                    console.log(result1);
                    console.log(publicacion);
                    res.render('profile/profile', {
                    publicacion,
                    profile : result1[0],
                    data : result[0],
                    user: req.user,
                    title: result[0].nombre
                    })
                  });
                  
            });
              
        } else {
            res.redirect('/');
        }
        
    });
});
  

router.get('/edit/:id', authController.isLoggedIn, async (req, res) => {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    await db.query('SELECT cuentas.email , cuentas.password, cuentas.tipo, cuenta_personal.nombre, cuenta_personal.id FROM (cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email) WHERE cuentas.email = ?', [decoded.id], (error, result2) => {
    if(!result2) {
      console.log(error)
    }

    req.user = result2[0];
    console.log("user de EDIT ES")
    console.log(req.user);

    const {email} = req.user;
    const {id} = req.params;
    console.log("email: es")
    console.log(email);
     db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?',[email], async (error, result) => {
     console.log(result[0].id)
      if (result[0].id == id) {
        console.log("edit:")
        console.log(result); 
        res.render('profile/editProfile', {
        user: req.user
        })
      } else {
        res.redirect('/')
      }
    })
  })
})

router.post('/edit/:id', authController.isLoggedIn, async (req, res) => {
  const email = req.user.email;
  console.log("email de req.user es: ")
  console.log(email);
  await db.query('SELECT cuentas.email, cuentas.password, cuenta_personal.nombre, cuenta_personal.id FROM cuentas INNER JOIN cuenta_personal ON cuentas.email = cuenta_personal.email WHERE cuenta_personal.email = ?',[email], async (error, result) => {
  console.log("result de consulta en post")
  console.log(result);
  const {id} = req.params;
  const email = result[0].email
  console.log("email")
  console.log(email)
  const {nombre, pass , newPass, newPassConfirm} = req.body;
  const newData  = {
    nombre,
    newPass,
    pass,
    newPassConfirm
  };
  console.log("password");
  console.log(result[0].password);
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
          });




  router.get('/delete/:mail' , authController.deleteUser, async (req, res) => {
    res.redirect('/login')
  })


module.exports = router;
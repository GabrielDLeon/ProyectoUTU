const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");


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
                    title: "Perfil"
                    })
                  });
                  
            });
              
        } else {
            res.redirect('/');
        }
        
    });
});
  

router.get('/edit/:mail', authController.editUser, async (req, res) => {
    if( req.user ) {
      res.render('profile/editProfile', {
        user: req.user,
        title: "Editar perfil"
      });
    } else {
      res.redirect('/edit/:mail');
    }
  })


router.post('/edit/:mail', authController.editCompany);
router.post('/edit/:mail', authController.editUser);


  router.get('/delete/:mail' , authController.deleteUser, async (req, res) => {
    res.redirect('/login')
  })


module.exports = router;
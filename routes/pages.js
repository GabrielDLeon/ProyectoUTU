const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");
const { result } = require('lodash');
const db = mysql.createConnection({
   host: process.env.DATABASE_HOST,
   user: process.env.DATABASE_USER,
   password: process.env.DATABASE_PASSWORD,
   database: process.env.DATABASE,
});

function countEntities(callback) {
   db.query('SELECT COUNT(id) AS count FROM cuenta_empresa', (error, countShops) => {
      db.query('SELECT COUNT(id) AS count FROM cuenta_personal', (error, countUsers) => {
         db.query('SELECT COUNT(nroPublicacion) AS count FROM publicacion', (error, countPublications) => {
            const counts = {
               countShops: countShops[0].count,
               countUsers: countUsers[0].count,
               countPublications: Math.round(countPublications[0].count * 2 / 3),
            }
            return callback(null, counts);
         });
      });
   });
}

router.get('/', authController.isLoggedIn, async (req, res) => {
   db.query('SELECT direccion, descripcion, telefono, nombre FROM perfil', (error, result) => {
      db.query('SELECT nroPublicacion, precio, descuento, imagen, nombreVendedor, categoria, genero FROM view_publicaciones ORDER BY fechaPublicacion DESC LIMIT 8', (error, newest) => {
         db.query('SELECT nroPublicacion, precio, descuento, imagen, nombreVendedor, categoria, genero, COUNT(favoritos.publicacion) AS cantFavoritos FROM (view_publicaciones INNER JOIN favoritos ON favoritos.publicacion = view_publicaciones.nroPublicacion) GROUP BY nroPublicacion HAVING (COUNT(cantFavoritos)) ORDER BY cantFavoritos LIMIT 8', (error, top) => {
            countEntities(function (error, result) {
               if (result) {
                  db.query('SELECT * FROM perfil', (error, shops) => {
                     res.render('index', {
                        counts: result,
                        newest,
                        top, 
                        shops,
                        user: req.user,
                        title: "Klouts",
                     });
                  });
               } else {
                  res.redirect('/');
                  console.log("No existe resultado");
               }
            });
         });
      });
   });
});

router.get('/register', (req, res) => {
   res.render('./auth/register', {
      title: "Registro"
   });
});

router.get('/registerCompany', (req, res) => {
   res.render('./auth/registerCompany', {
      title: "Registro de empresa"
   });

});

router.get('/login', (req, res) => {
   res.render('./auth/login', {
      title: "Inicio de sesión"
   });
});

router.get('/terms', (req, res) => {
   res.render('terms', {
      title: "Términos y condiciones"
   });
});



router.get('/admin/resetIncremental', authController.isLoggedIn, async (req, res) => {
   const tables = ['cuenta_empresa', 'cuenta_personal', 'notificaciones', 'preguntas', 'productos', 'publicacion'];
   const incremental = ['id', 'id', 'idNotificacion', 'idPregunta', 'idProducto', 'nroPublicacion'];
   let template = '', query = '';
   for (let index = 0; index < tables.length; index++) {
      template = 'SELECT MAX(' + incremental[index] + ') AS number FROM ' + tables[index];
      db.query(template, (error, result) => {
         var number = result[0].number + 1;
         query = 'ALTER TABLE ' + tables[index] + ' AUTO_INCREMENT = ' + number;
         db.query(query, (error, result) => {
            if (error) { console.log(error) }
         });
      });
   }
   console.log("Reset exitoso!");
   res.redirect('/');
});

router.get('/admin/genaratePublication', authController.isLoggedIn, async (req, res) => {
   if (req.user.data.tipo == 'empresa') {
      const { email } = req.user.data;
      const generate = 4;
      for (let index = 0; index < generate; index++) {
         db.query('INSERT INTO publicacion (precio, titulo, descripcion, producto, vendedor, fechaPublicacion) VALUES (1000, "Generic Publication", "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi suscipit tempore et, fugiat impedit assumenda", 1, ?, "2021-10-26")', [email]);
      }
      res.redirect('/');
   } else {
      res.redirect('/');
   }
});

router.get('/admin/deleteGeneric', authController.isLoggedIn, async (req, res) => {
   if (req.user.data.tipo == 'empresa') {
      const { email } = req.user.data;
      db.query('DELETE FROM publicacion WHERE titulo = "Generic Publication" AND vendedor = ?', [email]);
      console.log("Publicaciones genéricas eliminadas correctamente!")
      res.redirect('/admin/resetIncremental')
   }
})

router.get('/admin/deleteGenericAll', authController.isLoggedIn, async (req, res) => {
   db.query('DELETE FROM publicacion WHERE titulo = "Generic Publication"');
   console.log("Publicaciones genéricas eliminadas correctamente!")
   res.redirect('/admin/resetIncremental')
})

module.exports = router;
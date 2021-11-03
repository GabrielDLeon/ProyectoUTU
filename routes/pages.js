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

function calcDate(callback) {
  const date = new Date();
  const days = -process.env.NEWEST_PUBLICATION;
  const newDate = new Date(Number(date));
  newDate.setDate(date.getDate() + days);
  const string = newDate.getFullYear() + '-' + (date.getMonth() + 1) + '-' + newDate.getDate();
  const query = 'SELECT nroPublicacion, fechaPublicacion FROM (view_publicaciones) WHERE (fechaPublicacion >=  "' + string + '") GROUP BY (nroPublicacion)';
  return callback(null, query);
}

function countEntities(callback) {
  db.query('SELECT COUNT(id) AS count FROM cuenta_empresa', (error, countShops) => {
    db.query('SELECT COUNT(id) AS count FROM cuenta_personal', (error, countUsers) => {
      db.query('SELECT COUNT(nroPublicacion) AS count FROM publicacion', (error, countPublications) => {
        const counts = {
          countShops: countShops[0].count,
          countUsers: countUsers[0].count,
          countPublications: Math.round(countPublications[0].count*2/3),
        }
        return callback(null, counts);
      });
    });
  });
}

router.get('/', authController.isLoggedIn, async (req, res) => {
    db.query('SELECT direccion, descripcion, telefono, nombre FROM perfil', (error, result) => {
      db.query('SELECT nroPublicacion, precio, descuento, titulo, descripcion, categoria, genero, imagen, nombreVendedor FROM view_publicaciones', (error, recommendations) => {
        countEntities(function(error, result) {
          if (result){
            const counts = result;
            calcDate(function(error, query){
              db.query(query, (error, newest) => {
                db.query('SELECT * FROM perfil', (error, shops) => {
                  res.render('index', {
                    counts,
                    newest,
                    recommendations,
                    shops,
                    data: result[0],
                    user: req.user,
                    title: "Klouts",
                  });
                });
              });
            })
          } else {
            res.redirect('/');
            console.log("No existe resultado");
          }
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
  const tables = ['cuenta_empresa','cuenta_personal','notificaciones','preguntas','productos','publicacion'];
  const incremental = ['id', 'id', 'idNotificacion', 'idPregunta', 'idProducto', 'nroPublicacion'];
  let template = '', query = '';
  for (let index = 0; index < tables.length; index++) {
    template = 'SELECT MAX('+incremental[index]+') AS number FROM '+tables[index];
    db.query(template, (error, result) => {
      var number = result[0].number + 1;
      query = 'ALTER TABLE '+tables[index]+' AUTO_INCREMENT = '+number;
      db.query(query, (error, result) => {
        if (error){ console.log(error) }
      });
    });
  }
  console.log("Reset exitoso!");
  res.redirect('/');
});

router.get('/admin/genaratePublication', authController.isLoggedIn, async(req,res) => {
  if (req.user.data.tipo == 'empresa'){
    const {email} = req.user.data;
    const generate = 4;
    for (let index = 0; index < generate; index++) {
      db.query('INSERT INTO publicacion (precio, titulo, descripcion, producto, vendedor, fechaPublicacion) VALUES (1000, "Generic Publication", "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Animi suscipit tempore et, fugiat impedit assumenda", 1, ?, "2021-10-26")', [email]); 
    }
    res.redirect('/');
  } else {
    res.redirect('/');
  }
});

router.get('/admin/deleteGeneric', authController.isLoggedIn, async(req,res) => {
  if (req.user.data.tipo == 'empresa'){
    const {email} = req.user.data;
    db.query('DELETE FROM publicacion WHERE titulo = "Generic Publication" AND vendedor = ?', [email]);
    console.log("Publicaciones genéricas eliminadas correctamente!")
    res.redirect('/admin/resetIncremental')
  } 
})

router.get('/admin/deleteGenericAll', authController.isLoggedIn, async(req,res) => {
  db.query('DELETE FROM publicacion WHERE titulo = "Generic Publication"');
  console.log("Publicaciones genéricas eliminadas correctamente!")
  res.redirect('/admin/resetIncremental')
})

module.exports = router;
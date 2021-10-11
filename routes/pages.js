const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const mysql = require("mysql");
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

router.get('/', authController.isLoggedIn, async (req, res) => {
  db.query('SELECT direccion, descripcion, telefono, nombre FROM perfil', (error, result) => {
    db.query('SELECT DISTINCT nroPublicacion, precio, titulo, descripcion, producto, fotos.imagen , cuenta_empresa.nombre AS vendedor FROM (publicacion LEFT JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion) GROUP BY nroPublicacion', (error, publicacion) => {
      res.render('index', {
        publicacion,
        data: result[0],
        user: req.user,
        title: "Klouts"
      })
    });
  });
});

router.post('/buscar', authController.isLoggedIn, async (req, res) => {
  const { palabra } = req.body
  console.log(palabra)
  db.query('SELECT direccion, descripcion, telefono, nombre FROM perfil', (error, result) => {
   db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, fotos.imagen , cuenta_empresa.nombre AS vendedor FROM (publicacion LEFT JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion) WHERE publicacion.titulo LIKE "%"?"%"  GROUP BY nroPublicacion ' , [palabra] , (error, publicacion) => {
    if (publicacion.length > 0) {
      return res.render('result', {
        publicacion,
        palabra: req.body.palabra,
        data: result[0],
        user: req.user,
        title: "Klouts"
      })
    } else {
      return res.render('result', {
        publicacion,
        data: result[0],
        message: 'No hay coincidencias con la busqueda',
        user: req.user,
        title: "Klouts"
      })
    }
   })
  })
})

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


module.exports = router;
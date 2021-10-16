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
  if (req.user) {
    const { email } = req.user
    db.query('SELECT direccion, descripcion, telefono, nombre FROM perfil', (error, result) => {
      db.query('SELECT DISTINCT nroPublicacion, precio, titulo, descripcion, producto, fotos.imagen , cuenta_empresa.nombre AS vendedor FROM (publicacion LEFT JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion) GROUP BY nroPublicacion', (error, recommendations) => {
        res.render('index', {
          recommendations,
          data: result[0],
          user: req.user,
          title: "Klouts",
        })
      });
    });
  } else {
    db.query('SELECT direccion, descripcion, telefono, nombre FROM perfil', (error, result) => {
      db.query('SELECT DISTINCT nroPublicacion, precio, titulo, descripcion, producto, fotos.imagen , cuenta_empresa.nombre AS vendedor FROM (publicacion LEFT JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion) GROUP BY nroPublicacion', (error, recommendations) => {
        res.render('index', {
          recommendations,
          data: result[0],
          user: req.user,
          title: "Klouts",
        })
      });
    });
  }
})

router.post('/search', authController.isLoggedIn, async (req, res) => {
  const { palabra } = req.body
  console.log(palabra)
  db.query('SELECT direccion, descripcion, telefono, nombre FROM perfil', (error, result) => {
   db.query('SELECT nroPublicacion, precio, titulo, descripcion, producto, fotos.imagen , cuenta_empresa.nombre AS vendedor, categoria, genero, material, marca FROM (publicacion LEFT JOIN cuenta_empresa ON publicacion.vendedor = cuenta_empresa.email LEFT JOIN fotos ON fotos.publicacion = publicacion.nroPublicacion INNER JOIN producto ON publicacion.nroPublicacion = producto.idProducto) WHERE titulo LIKE "%"?"%" OR categoria LIKE "%"?"%" OR genero LIKE "%"?"%" OR material LIKE "%"?"%" OR marca LIKE "%"?"%" OR cuenta_empresa.nombre LIKE "%"?"%" GROUP BY nroPublicacion' , [palabra,palabra,palabra,palabra,palabra,palabra] , (error, recommendations) => {
    if (recommendations.length > 0) {
      return res.render('search', {
        recommendations,
        palabra: req.body.palabra,
        data: result[0],
        user: req.user,
        title: "Búsqueda"
      })
    } else {
      return res.render('search', {
        recommendations,
        data: result[0],
        message: 'No hay coincidencias con la busqueda',
        user: req.user,
        title: "Búsqueda"
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
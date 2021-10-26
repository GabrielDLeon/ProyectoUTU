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
      db.query('SELECT nroPublicacion, precio, descuento, titulo, descripcion, categoria, genero, imagen, nombreVendedor FROM view_publicaciones', (error, recommendations) => {
        res.render('index', {
          recommendations,
          data: result[0],
          user: req.user,
          title: "Klouts",
        })
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

module.exports = router;
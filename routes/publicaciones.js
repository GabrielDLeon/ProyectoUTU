const express = require('express');
const authController = require('../controllers/auth');
const mysql = require("mysql");
const router = express.Router();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
  });

router.get('/', authController.isLoggedIn, (req, res) => {
    res.render('publication/list', {
        user: req.user,
        title: "Klouts"
    });
});

module.exports = router;

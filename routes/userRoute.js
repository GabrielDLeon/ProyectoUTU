const express = require('express');
const router = express.Router();
const conexion = require('../database/db');
const authController = require ('../controller/authController')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', async (req, res) => {
    res.render('profile')
})

router.get('/edit', async (req, res) => {
    res.render('edit', {name:req.name})
})
module.exports = router
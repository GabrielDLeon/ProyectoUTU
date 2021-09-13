const express = require('express');
const router = express.Router();
const conexion = require('../database/db');
const authController = require ('../controller/authController')
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator')
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

router.get('/profile', async (req, res) => {
    res.render('profile')
})

router.get('/profile/edit', async (req, res) => {
    res.render('edit', {name:req.name})
})
module.exports = router
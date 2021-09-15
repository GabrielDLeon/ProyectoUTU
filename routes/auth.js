const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();
          
router.post('/signup', authController.register );

router.post('/signupCompany', authController.register );

router.post('/login', authController.login );

router.get('/logout', authController.logout );


module.exports = router;
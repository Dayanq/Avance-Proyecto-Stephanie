const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Estas rutas conectan con las funciones que guardan en MySQL
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
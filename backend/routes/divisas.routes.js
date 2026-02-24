// routes/divisas.routes.js
const express = require('express');
const router = express.Router();
const { obtenerConversion } = require('../controllers/divisas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Cualquier usuario autenticado puede consultar las tasas de cambio
router.get('/', verificarToken, obtenerConversion);

module.exports = router;
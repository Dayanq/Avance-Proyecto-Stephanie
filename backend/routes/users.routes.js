const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Importamos la conexión real
const verificarToken = require('../middlewares/auth.middleware');

// GET - Obtener todos los usuarios reales de la base de datos
router.get('/', (req, res) => {
    const query = 'SELECT id, nombre, email FROM usuarios';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Nota: No necesitas el POST aquí porque el registro ya lo hace auth.routes.js
module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');

// GET — Solo admin puede ver todos los usuarios
router.get('/', verificarToken, verificarAdmin, (req, res) => {
    const query = 'SELECT id, nombre, email, role FROM usuarios';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// PUT — Solo admin puede cambiar el rol de un usuario
router.put('/:id/role', verificarToken, verificarAdmin, (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ mensaje: 'Rol inválido. Usa admin o user.' });
    }

    db.query('UPDATE usuarios SET role = ? WHERE id = ?', [role, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json({ mensaje: `Rol actualizado a ${role}` });
    });
});

module.exports = router;
const db = require('../config/db');

// Obtener todas las tareas del usuario logueado
exports.getTareas = (req, res) => {
    const userId = req.user.id; // Obtenido del token por el middleware
    db.query('SELECT * FROM tareas WHERE user_id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Crear una nueva tarea
exports.createTarea = (req, res) => {
    const { titulo } = req.body;
    const userId = req.user.id;
    db.query('INSERT INTO tareas (titulo, user_id) VALUES (?, ?)', [titulo, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ mensaje: "Tarea guardada", id: result.insertId });
    });
};

// Eliminar una tarea
exports.deleteTarea = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tareas WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Tarea eliminada" });
    });
};
// Actualizar el título de una tarea
exports.updateTarea = (req, res) => {
    const { id } = req.params;
    const { titulo } = req.body;
    const userId = req.user.id;

    const query = 'UPDATE tareas SET titulo = ? WHERE id = ? AND user_id = ?';
    db.query(query, [titulo, id, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: "Tarea no encontrada o no autorizada" });
        res.json({ mensaje: "Tarea actualizada con éxito" });
    });
};
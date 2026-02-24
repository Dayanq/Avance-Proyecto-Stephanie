const db = require('../config/db');

// GET tareas — Con Filtro de Salario y PAGINACIÓN
exports.getTareas = (req, res) => {
    // 1. Capturamos salarioMin, la página actual (por defecto 1) y el límite (por defecto 5)
    // Usamos limit 5 para que la paginación sea visible y sutil
    const { salarioMin, page = 1, limit = 5 } = req.query; 

    // 2. Calculamos el OFFSET (cuántos registros saltar)
    // Ejemplo: Si estoy en pág 2 y el límite es 5, salto los primeros 5 ( (2-1)*5 = 5 )
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
        SELECT tareas.*, usuarios.nombre AS autor 
        FROM tareas 
        JOIN usuarios ON tareas.user_id = usuarios.id
    `;
    let params = [];

    // Filtro de salario
    if (salarioMin) {
        query += " WHERE tareas.salario >= ?";
        params.push(parseInt(salarioMin));
    }

    // 3. Añadimos Orden, Límite y Salto (Paginación)
    query += " ORDER BY tareas.salario DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// POST — crear tarea (solo admin)
exports.createTarea = (req, res) => {
    const { titulo, salario } = req.body; 
    const userId = req.user.id;

    db.query('INSERT INTO tareas (titulo, salario, user_id, estado) VALUES (?, ?, ?, ?)', 
    [titulo, salario || 0, userId, 'abierta'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ mensaje: "Vacante creada con salario", id: result.insertId });
    });
};

// DELETE — eliminar (solo admin)
exports.deleteTarea = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tareas WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: "Tarea eliminada" });
    });
};

// PUT — editar (solo admin)
exports.updateTarea = (req, res) => {
    const { id } = req.params;
    const { titulo, salario } = req.body; // Aceptamos ambos para no perder el salario al editar

    db.query('UPDATE tareas SET titulo = ?, salario = ? WHERE id = ?', [titulo, salario, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: "Tarea no encontrada" });
        res.json({ mensaje: "Tarea actualizada correctamente" });
    });
};

// PATCH — Usuario aplica a una vacante
exports.aplicarTarea = (req, res) => {
    const { id } = req.params;

    db.query('UPDATE tareas SET estado = ? WHERE id = ?', ['aplicado', id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: "Vacante no encontrada" });
        res.json({ mensaje: "Has aplicado con éxito" });
    });
};
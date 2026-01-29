const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tarea.controller'); // Solo una vez
const verificarToken = require('../middlewares/auth.middleware');

// Rutas de tareas
router.get('/', verificarToken, tareaController.getTareas);
router.post('/', verificarToken, tareaController.createTarea);
router.put('/:id', verificarToken, tareaController.updateTarea); // Ruta para editar
router.delete('/:id', verificarToken, tareaController.deleteTarea);

module.exports = router;
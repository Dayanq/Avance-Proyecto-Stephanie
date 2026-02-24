const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tarea.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');

// 1. IMPORTAMOS EL VALIDADOR (Asegúrate de que el archivo exista en esa ruta)
const { validarTarea } = require('../middlewares/validador.middleware');

// ✅ TODOS pueden VER las tareas (user y admin)
router.get('/', verificarToken, tareaController.getTareas);

// ✅ Nueva ruta: Permitir aplicar (Todos los usuarios autenticados)
router.patch('/:id/aplicar', verificarToken, tareaController.aplicarTarea);

// 🔒 Solo ADMIN (Fíjate cómo agregamos 'validarTarea' aquí abajo)
router.post('/', verificarToken, verificarAdmin, validarTarea, tareaController.createTarea);
router.put('/:id', verificarToken, verificarAdmin, validarTarea, tareaController.updateTarea);

// El DELETE no necesita validarTarea porque no recibe un "título", solo el ID
router.delete('/:id', verificarToken, verificarAdmin, tareaController.deleteTarea);

module.exports = router;
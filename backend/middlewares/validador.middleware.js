// middlewares/validador.middleware.js

const validarTarea = (req, res, next) => {
    const { titulo } = req.body;

    // REGLA: El título no puede estar vacío y debe ser un texto real
    if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 5) {
        return res.status(400).json({ 
            mensaje: 'Error de validación: El título es obligatorio y debe tener al menos 5 caracteres.' 
        });
    }

    // Si todo está bien, pasamos a la siguiente función
    next();
};

module.exports = { validarTarea };
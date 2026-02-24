// middlewares/error.middleware.js
const errorHandler = (err, req, res, next) => {
    console.error("❌ Error detectado:", err.stack);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        mensaje: err.message || "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? err : {} // Solo muestra detalles en desarrollo
    });
};

module.exports = errorHandler;
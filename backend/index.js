const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://spirited-motivation-production.up.railway.app'
    ]
}));

app.use(express.json());

// Servir Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// --- [DEBUGGING] Middleware de registro de peticiones ---
// Esto te permite ver en la consola qué está pasando en tiempo real
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} a ${req.url}`);
    next();
});

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tareas', require('./routes/tarea.routes'));
app.use('/api/usuarios', require('./routes/users.routes'));
app.use('/api/divisas', require('./routes/divisas.routes')); // ← Integración API externa de divisas

// --- [PRUEBA DE ACEPTACIÓN INTEGRADA] ---
const db = require('./config/db');
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ PRUEBA DE ROBUSTEZ FALLIDA:', err.message);
    } else {
        console.log('✅ PRUEBA DE ROBUSTEZ EXITOSA: Conexión MySQL estable');
        // Debugging de variables de entorno
        console.log(`🔧 Modo: ${process.env.NODE_ENV || 'Desarrollo'} | Puerto: ${PORT}`);
        connection.release();
    }
});

// --- [GESTIÓN DE ERRORES PERSONALIZADA] ---
// Este middleware atrapa cualquier error que ocurra en las rutas anteriores
app.use((err, req, res, next) => {
    console.error('❌ ERROR INTERNO:', err.stack); // Debugging: muestra dónde falló el código
    
    res.status(err.status || 500).json({
        mensaje: "Hubo un problema en el servidor",
        error: err.message // Información para robustez
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
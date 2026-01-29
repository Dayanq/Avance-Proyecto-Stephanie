const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tareas', require('./routes/tarea.routes')); // Nueva ruta de tareas

// Prueba de conexión a DB
const db = require('./config/db');
db.getConnection((err, connection) => {
    if (err) console.error('❌ Error MySQL:', err.message);
    else {
        console.log('✅ Conectado a la base de datos MySQL');
        connection.release();
    }
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
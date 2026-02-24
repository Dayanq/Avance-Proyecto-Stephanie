const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar nuevo usuario (siempre como 'user' por defecto)
exports.register = async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(query, [nombre, email, hashedPassword, 'user'], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ mensaje: "El correo ya está registrado" });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ mensaje: "Usuario registrado con éxito", id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// Login — ahora el token incluye el rol
exports.login = (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

        const usuario = results[0];

        const passwordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecto) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

        // ✅ Ahora el token lleva id Y role
        const token = jwt.sign(
            { id: usuario.id, role: usuario.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Enviamos también el rol al frontend para que pueda usarlo directamente
        res.json({ mensaje: "Login exitoso", token, role: usuario.role });
    });
};
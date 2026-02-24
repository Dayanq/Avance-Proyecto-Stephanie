const jwt = require('jsonwebtoken');

// ✅ Verifica que el token sea válido
function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ mensaje: 'Token requerido' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        res.status(403).json({ mensaje: 'Token inválido' });
    }
}

// ✅ Verifica que el usuario sea admin (usar DESPUÉS de verificarToken)
function verificarAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de administrador' });
    }
    next();
}

module.exports = { verificarToken, verificarAdmin };
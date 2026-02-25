const request = require('supertest');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('../config/db');

// App mínima para pruebas
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('../routes/auth.routes'));
app.use('/api/tareas', require('../routes/tarea.routes'));
app.use('/api/usuarios', require('../routes/users.routes'));

// Cerrar el pool de DB al terminar todas las pruebas
afterAll(async () => {
    await db.promise().end();
});

// ── PRUEBAS DE AUTENTICACIÓN ──
describe('Pruebas de Autenticación', () => {

    test('POST /api/auth/register — debe registrar un usuario nuevo', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Usuario Test',
                email: `test_${Date.now()}@test.com`,
                password: '123456'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('mensaje');
    });

    test('POST /api/auth/login — debe fallar con credenciales incorrectas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'noexiste@test.com',
                password: 'wrongpassword'
            });
        expect(res.statusCode).toBe(404);
    });

});

// ── PRUEBAS DE SEGURIDAD — RUTAS PROTEGIDAS ──
describe('Pruebas de Seguridad — Rutas Protegidas', () => {

    test('GET /api/tareas — debe rechazar sin token (401)', async () => {
        const res = await request(app).get('/api/tareas');
        expect(res.statusCode).toBe(401);
        expect(res.body.mensaje).toBe('Token requerido');
    });

    test('GET /api/usuarios — debe rechazar sin token (401)', async () => {
        const res = await request(app).get('/api/usuarios');
        expect(res.statusCode).toBe(401);
    });

    test('GET /api/tareas — debe rechazar token falso (403)', async () => {
        const res = await request(app)
            .get('/api/tareas')
            .set('Authorization', 'Bearer token_falso_invalido');
        expect(res.statusCode).toBe(403);
        expect(res.body.mensaje).toBe('Token inválido');
    });

    test('POST /api/tareas — debe rechazar acceso sin ser admin (401)', async () => {
        const res = await request(app)
            .post('/api/tareas')
            .send({ titulo: 'Vacante Hack', salario: 9999 });
        expect(res.statusCode).toBe(401);
    });

    test('DELETE /api/tareas/1 — debe rechazar sin token (401)', async () => {
        const res = await request(app).delete('/api/tareas/1');
        expect(res.statusCode).toBe(401);
    });

});

// ── PRUEBAS DE VALIDACIÓN ──
describe('Pruebas de Validación de Datos', () => {

    test('POST /api/auth/register — debe fallar sin email (400)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                nombre: 'Sin Email',
                password: '123456'
                // sin email
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('mensaje');
    });

});
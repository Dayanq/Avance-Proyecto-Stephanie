const API_URL = 'http://localhost:3000/api';

// Helper para construir headers con token
function authHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- AUTH ---
export async function loginUsuario(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje || 'Error al iniciar sesión');
    return datos; // { token, role }
}

export async function registrarUsuario(nombre, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje || 'Error al registrarse');
    return datos;
}

// --- TAREAS ---
export async function getTareas(token, page = 1, limit = 5, salarioMin = '') {
    const res = await fetch(
        `${API_URL}/tareas?page=${page}&limit=${limit}&salarioMin=${salarioMin}`,
        { headers: authHeaders(token) }
    );
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.error || 'Error al obtener tareas');
    return datos;
}

export async function crearTarea(token, titulo, salario) {
    const res = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ titulo, salario })
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje || 'Error al crear tarea');
    return datos;
}

export async function editarTarea(token, id, titulo, salario) {
    const res = await fetch(`${API_URL}/tareas/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ titulo, salario })
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje || 'Error al editar tarea');
    return datos;
}

export async function eliminarTarea(token, id) {
    const res = await fetch(`${API_URL}/tareas/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token)
    });
    if (!res.ok) throw new Error('Error al eliminar tarea');
}

export async function aplicarVacante(token, id) {
    const res = await fetch(`${API_URL}/tareas/${id}/aplicar`, {
        method: 'PATCH',
        headers: authHeaders(token)
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje || 'Error al aplicar');
    return datos;
}

// --- USUARIOS ---
export async function getUsuarios(token) {
    const res = await fetch(`${API_URL}/usuarios`, {
        headers: authHeaders(token)
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.error || 'Error al obtener usuarios');
    return datos;
}

export async function cambiarRolUsuario(token, id, role) {
    const res = await fetch(`${API_URL}/usuarios/${id}/role`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ role })
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje || 'Error al cambiar rol');
    return datos;
}

// --- DIVISAS (API Externa) ---
export async function getDivisas(token) {
    const res = await fetch(`${API_URL}/divisas`, {
        headers: authHeaders(token)
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje || 'Error al obtener divisas');
    return datos;
}

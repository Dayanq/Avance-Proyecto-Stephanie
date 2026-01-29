const API_URL = 'http://localhost:3000/api';

// --- AUTH (REGISTRO Y LOGIN) ---
async function registrar() {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
    });
    if (res.ok) {
        alert("¡Registrado! Ahora inicia sesión.");
        window.location.href = 'login.html';
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const datos = await res.json();
    if (res.ok) {
        localStorage.setItem('token', datos.token);
        window.location.href = 'dashboard.html';
    } else {
        alert(datos.mensaje);
    }
}

// --- TAREAS (CRUD) ---
async function obtenerTareas() {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'login.html';

    const res = await fetch(`${API_URL}/tareas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const tareas = await res.json();
    const lista = document.getElementById('listaTareas');
    
    lista.innerHTML = tareas.map(t => `
        <li style="display: flex; justify-content: space-between; margin-bottom: 10px; background: #f9f9f9; padding: 10px; border-radius: 5px;">
            <span>${t.titulo}</span>
            <div>
                <button onclick="editarTarea(${t.id}, '${t.titulo}')" style="width: auto; padding: 5px; background: #f59e0b;">✏️</button>
                <button onclick="eliminarTarea(${t.id})" style="width: auto; padding: 5px; background: #ef4444;">🗑️</button>
            </div>
        </li>
    `).join('');
}

async function agregarTarea() {
    const titulo = document.getElementById('tituloTarea').value;
    const token = localStorage.getItem('token');
    if (!titulo) return;

    await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ titulo })
    });
    document.getElementById('tituloTarea').value = '';
    obtenerTareas();
}

async function eliminarTarea(id) {
    if (!confirm("¿Eliminar tarea?")) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/tareas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    obtenerTareas();
}

async function editarTarea(id, tituloActual) {
    const nuevoTitulo = prompt("Editar tarea:", tituloActual);
    if (!nuevoTitulo || nuevoTitulo === tituloActual) return;

    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ titulo: nuevoTitulo })
    });
    obtenerTareas();
}

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
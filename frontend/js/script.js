const API_URL = 'http://localhost:3000/api';
let paginaActual = 1; // Variable global para la paginación

// --- Variables globales para la conversión de divisas ---
let tasasDeConversion = { MXN: 1, USD: null, EUR: null, CAD: null };
let divisaActual = 'MXN';

// --- UTILIDADES ---
function decodeToken(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
}

function getRol() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return decodeToken(token)?.role || null;
}

// --- AUTH ---
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
        alert("Registro exitoso");
        window.location.href = 'index.html';
    } else {
        const d = await res.json();
        alert(d.mensaje);
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

// --- DASHBOARD ---
function inicializarDashboard() {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = 'index.html'; // ← Corregido: era 'login.html'

    const rol = getRol();
    const badge = document.getElementById('badgeRol');
    
    if (badge) {
        badge.textContent = rol === 'admin' ? 'ADMINISTRADOR' : 'USUARIO';
        badge.style.background = rol === 'admin' ? '#7c3aed' : '#3b82f6';
        badge.style.color = 'white';
    }

    // Control de visibilidad por rol
    document.getElementById('seccionAdmin').style.display = rol === 'admin' ? 'block' : 'none';
    document.getElementById('formNuevaTarea').style.display = rol === 'admin' ? 'flex' : 'none';

    const seccionFiltros = document.getElementById('seccionFiltros');
    if (seccionFiltros) {
        seccionFiltros.style.display = rol === 'user' ? 'flex' : 'none';
    }

    // Cargamos las tasas de conversión al iniciar (API externa)
    cargarTasas();
    obtenerTareas();
    if (rol === 'admin') obtenerUsuarios();
}

// --- INTEGRACIÓN API EXTERNA: DIVISAS ---

// Llama al backend, que a su vez consulta ExchangeRate-API
async function cargarTasas() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/divisas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('No se pudieron obtener las tasas de cambio');

        const datos = await res.json();
        tasasDeConversion = datos.tasas;

        // Mostramos la fecha de actualización de las tasas
        const info = document.getElementById('infoTasa');
        if (info) {
            const fecha = new Date(datos.actualizadoEl).toLocaleDateString('es-MX');
            info.textContent = `Tasas actualizadas: ${fecha}`;
        }

    } catch (error) {
        console.error('Error cargando tasas de divisas:', error);
        const info = document.getElementById('infoTasa');
        if (info) info.textContent = 'No se pudo cargar la conversión';
    }
}

// Convierte un salario de MXN a la divisa actualmente seleccionada
function convertirSalario(salarioEnMXN) {
    const tasa = tasasDeConversion[divisaActual] || 1;
    const convertido = salarioEnMXN * tasa;

    // Formato legible según la divisa
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(convertido);
}

// Se activa cuando el usuario cambia el selector de divisa
function cambiarDivisa() {
    divisaActual = document.getElementById('divisaSeleccionada').value;
    obtenerTareas(); // Recarga la lista con los salarios convertidos
}

// OBTENER TAREAS (Con Paginación, Filtro y Conversión de Divisa)
async function obtenerTareas() {
    const token = localStorage.getItem('token');
    const rol = getRol();
    const salarioMin = document.getElementById('filtroSalario')?.value || '';
    
    // URL con parámetros de paginación (limitado a 5) y filtro
    let url = `${API_URL}/tareas?page=${paginaActual}&limit=5&salarioMin=${salarioMin}`;

    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const tareas = await res.json();
    const lista = document.getElementById('listaTareas');

    // Manejo de página vacía
    if (tareas.length === 0 && paginaActual > 1) {
        paginaActual--;
        obtenerTareas();
        return;
    }

    // Renderizado de la lista — usamos data-attributes para evitar problemas con comillas en títulos
    lista.innerHTML = tareas.map(t => `
        <li class="task-item" style="display:flex; justify-content:space-between; align-items:center; background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #eee;">
            <span>
                <strong style="font-size: 1.1rem;">${t.titulo}</strong>
                <span style="color: #16a34a; font-weight: bold; margin-left: 10px;">
                    ${divisaActual} $${convertirSalario(t.salario || 0)}
                </span>
                <br><small style="color:gray;">Publicado por: ${t.autor}</small>
            </span>
            
            <div style="display:flex; gap:10px; align-items:center;">
                ${rol === 'user' ? (
                    t.estado === 'abierta' 
                    ? `<button onclick="aplicarVacante(${t.id})" style="background:#22c55e; width:auto; padding:8px 15px; border:none; color:white; border-radius:5px; cursor:pointer;">Aplicar</button>`
                    : `<span style="background:#94a3b8; color:white; padding:8px 15px; border-radius:5px; font-size:0.8rem; font-weight:bold;">Ya se aplicó</span>`
                ) : ''}

                ${rol === 'admin' ? `
                    <button 
                        data-id="${t.id}" 
                        data-titulo="${t.titulo.replace(/"/g, '&quot;')}" 
                        data-salario="${t.salario}"
                        onclick="editarTarea(this)"
                        style="background:#f59e0b; padding:5px 10px; border:none; color:white; border-radius:5px; cursor:pointer;">✏️</button>
                    <button onclick="eliminarTarea(${t.id})" class="btn-danger" style="padding:5px 10px; border:none; color:white; border-radius:5px; cursor:pointer;">🗑️</button>
                ` : ''}
            </div>
        </li>
    `).join('');

    // Actualizar UI de paginación
    const numPagina = document.getElementById('numPagina');
    const btnAnterior = document.getElementById('btnAnterior');
    if (numPagina) numPagina.textContent = `Página ${paginaActual}`;
    if (btnAnterior) {
        btnAnterior.disabled = paginaActual === 1;
        btnAnterior.style.opacity = paginaActual === 1 ? "0.5" : "1";
    }
}

// Funciones de Paginación y Filtro
function cambiarPagina(direccion) {
    paginaActual += direccion;
    obtenerTareas();
}

function filtrarTareas() {
    paginaActual = 1; // Reiniciar a la primera página al filtrar
    obtenerTareas();
}

// --- ACCIONES DE VACANTES ---
async function aplicarVacante(id) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tareas/${id}/aplicar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
        alert("¡Aplicación enviada!");
        obtenerTareas();
    } else {
        alert("Error al aplicar");
    }
}

async function agregarTarea() {
    const titulo = document.getElementById('tituloTarea').value;
    const salario = document.getElementById('salarioTarea').value;
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ titulo, salario })
    });

    if (res.ok) {
        document.getElementById('tituloTarea').value = '';
        document.getElementById('salarioTarea').value = '';
        obtenerTareas();
    } else {
        const error = await res.json();
        alert(error.mensaje);
    }
}

async function eliminarTarea(id) {
    if (!confirm("¿Borrar esta vacante?")) return;
    await fetch(`${API_URL}/tareas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    obtenerTareas();
}

// ← Corregido: ahora usa data-attributes en lugar de parámetros con comillas
async function editarTarea(boton) {
    const id = boton.dataset.id;
    const tituloActual = boton.dataset.titulo;
    const salarioActual = boton.dataset.salario;

    const nuevoTitulo = prompt("Editar Vacante - Nombre del puesto:", tituloActual);
    if (nuevoTitulo === null) return;

    const nuevoSalario = prompt("Editar Vacante - Salario $:", salarioActual);
    if (nuevoSalario === null) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tareas/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ titulo: nuevoTitulo, salario: nuevoSalario })
    });

    if (res.ok) {
        alert("Vacante actualizada");
        obtenerTareas();
    } else {
        const error = await res.json();
        alert(error.mensaje || "Error al actualizar");
    }
}

// --- GESTIÓN DE USUARIOS (ADMIN) ---
async function obtenerUsuarios() {
    const res = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const usuarios = await res.json();
    document.getElementById('tablaUsuarios').innerHTML = usuarios.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>
                <select onchange="cambiarRol(${u.id}, this.value)">
                    <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function cambiarRol(id, role) {
    const res = await fetch(`${API_URL}/usuarios/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ role })
    });

    // ← Corregido: ahora verifica si la operación fue exitosa
    if (res.ok) {
        alert("Rol actualizado correctamente");
    } else {
        alert("Error al actualizar el rol. Intenta de nuevo.");
    }
}

function limpiarFiltro() {
    const inputSalario = document.getElementById('filtroSalario');
    if (inputSalario) inputSalario.value = '';
    paginaActual = 1;
    obtenerTareas();
}

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
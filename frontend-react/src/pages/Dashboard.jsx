import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getTareas, crearTarea, editarTarea, eliminarTarea,
    aplicarVacante, getUsuarios, cambiarRolUsuario, getDivisas
} from '../services/api';

export default function Dashboard() {
    const { token, usuario, logout } = useAuth();
    const navigate = useNavigate();
    const rol = usuario?.role;

    // --- Estado de tareas y paginación ---
    const [tareas, setTareas] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [salarioMin, setSalarioMin] = useState('');
    const [filtroBuscado, setFiltroBuscado] = useState('');

    // --- Estado de formulario nueva tarea ---
    const [tituloNuevo, setTituloNuevo] = useState('');
    const [salarioNuevo, setSalarioNuevo] = useState('');

    // --- Estado de edición ---
    const [tareaEditando, setTareaEditando] = useState(null); // { id, titulo, salario }

    // --- Estado de usuarios (admin) ---
    const [usuarios, setUsuarios] = useState([]);

    // --- Estado de divisas ---
    const [tasas, setTasas] = useState({ MXN: 1, USD: null, EUR: null, CAD: null });
    const [divisaActual, setDivisaActual] = useState('MXN');
    const [infoTasa, setInfoTasa] = useState('');

    // --- Estado de carga y errores ---
    const [cargandoTareas, setCargandoTareas] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Cargar tareas cuando cambia página o filtro aplicado
    useEffect(() => {
        cargarTareas();
    }, [paginaActual, filtroBuscado]);

    // Cargar tasas y usuarios al montar
    useEffect(() => {
        cargarTasas();
        if (rol === 'admin') cargarUsuarios();
    }, []);

    async function cargarTareas() {
        setCargandoTareas(true);
        setErrorMsg('');
        try {
            const datos = await getTareas(token, paginaActual, 5, filtroBuscado);
            if (datos.length === 0 && paginaActual > 1) {
                setPaginaActual(p => p - 1);
                return;
            }
            setTareas(datos);
        } catch (err) {
            setErrorMsg('No se pudieron cargar las vacantes.');
        } finally {
            setCargandoTareas(false);
        }
    }

    async function cargarTasas() {
        try {
            const datos = await getDivisas(token);
            setTasas(datos.tasas);
            const fecha = new Date(datos.actualizadoEl).toLocaleDateString('es-MX');
            setInfoTasa(`Tasas actualizadas: ${fecha}`);
        } catch {
            setInfoTasa('No se pudo cargar la conversión');
        }
    }

    async function cargarUsuarios() {
        try {
            const datos = await getUsuarios(token);
            setUsuarios(datos);
        } catch (err) {
            console.error('Error cargando usuarios:', err);
        }
    }

    // --- Convertir salario según divisa seleccionada ---
    function convertirSalario(salarioMXN) {
        const tasa = tasas[divisaActual] || 1;
        return new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(salarioMXN * tasa);
    }

    // --- Acciones de tareas ---
    async function handleCrearTarea(e) {
        e.preventDefault();
        try {
            await crearTarea(token, tituloNuevo, salarioNuevo);
            setTituloNuevo('');
            setSalarioNuevo('');
            cargarTareas();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleEditarTarea(e) {
        e.preventDefault();
        try {
            await editarTarea(token, tareaEditando.id, tareaEditando.titulo, tareaEditando.salario);
            setTareaEditando(null);
            cargarTareas();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleEliminar(id) {
        if (!confirm('¿Borrar esta vacante?')) return;
        try {
            await eliminarTarea(token, id);
            cargarTareas();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleAplicar(id) {
        try {
            await aplicarVacante(token, id);
            cargarTareas();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleCambiarRol(id, role) {
        try {
            await cambiarRolUsuario(token, id, role);
            cargarUsuarios();
        } catch (err) {
            alert('Error al cambiar rol: ' + err.message);
        }
    }

    function handleFiltrar() {
        setPaginaActual(1);
        setFiltroBuscado(salarioMin);
    }

    function handleLimpiarFiltro() {
        setSalarioMin('');
        setFiltroBuscado('');
        setPaginaActual(1);
    }

    function handleCerrarSesion() {
        logout();
        navigate('/');
    }

    return (
        <div className="dashboard-container">

            {/* TOPBAR */}
            <div className="topbar">
                <h1>JobBoard</h1>
                <div className="topbar-right">
                    <span className={`badge-rol ${rol === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {rol === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}
                    </span>
                    <button className="btn-danger" onClick={handleCerrarSesion}>Salir</button>
                </div>
            </div>

            {/* CARD PRINCIPAL — VACANTES */}
            <div className="card">
                <h2>Vacantes Disponibles</h2>

                {/* Formulario nueva vacante (solo admin) */}
                {rol === 'admin' && (
                    <div className="form-nueva-tarea">
                        <h3>Publicar nueva vacante</h3>
                        <form onSubmit={handleCrearTarea} className="form-row">
                            <input
                                type="text"
                                placeholder="Nombre del puesto"
                                value={tituloNuevo}
                                onChange={e => setTituloNuevo(e.target.value)}
                                required
                                style={{ flex: 2 }}
                            />
                            <input
                                type="number"
                                placeholder="Salario $"
                                value={salarioNuevo}
                                onChange={e => setSalarioNuevo(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn-success btn-compact">+ Publicar</button>
                        </form>
                    </div>
                )}

                {/* Modal de edición */}
                {tareaEditando && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Editar Vacante</h3>
                            <form onSubmit={handleEditarTarea}>
                                <input
                                    type="text"
                                    value={tareaEditando.titulo}
                                    onChange={e => setTareaEditando({ ...tareaEditando, titulo: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    value={tareaEditando.salario}
                                    onChange={e => setTareaEditando({ ...tareaEditando, salario: e.target.value })}
                                />
                                <div className="modal-btns">
                                    <button type="submit" className="btn-success">Guardar</button>
                                    <button type="button" className="btn-danger" onClick={() => setTareaEditando(null)}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Filtro por salario (solo usuarios) */}
                {rol === 'user' && (
                    <div className="seccion-filtros">
                        <label>Filtrar por salario mínimo:</label>
                        <input
                            type="number"
                            placeholder="Ej: 1000"
                            value={salarioMin}
                            onChange={e => setSalarioMin(e.target.value)}
                            style={{ width: '150px' }}
                        />
                        <button onClick={handleFiltrar} className="btn-blue">Buscar</button>
                        <button onClick={handleLimpiarFiltro} className="btn-gray">Limpiar</button>
                    </div>
                )}

                {/* Selector de divisas (API Externa) */}
                <div className="selector-divisa">
                    <span>💱</span>
                    <label>Ver salarios en:</label>
                    <select
                        value={divisaActual}
                        onChange={e => setDivisaActual(e.target.value)}
                    >
                        <option value="MXN">🇲🇽 MXN — Peso Mexicano</option>
                        <option value="USD">🇺🇸 USD — Dólar Americano</option>
                        <option value="EUR">🇪🇺 EUR — Euro</option>
                        <option value="CAD">🇨🇦 CAD — Dólar Canadiense</option>
                    </select>
                    <span className="info-tasa">{infoTasa}</span>
                </div>

                {/* Lista de tareas */}
                {cargandoTareas && <p className="texto-centro">Cargando vacantes...</p>}
                {errorMsg && <p className="error-msg">{errorMsg}</p>}

                {!cargandoTareas && tareas.length === 0 && (
                    <p className="texto-centro">No hay vacantes disponibles.</p>
                )}

                <ul className="lista-tareas">
                    {tareas.map(t => (
                        <li key={t.id} className="task-item">
                            <div className="task-info">
                                <strong>{t.titulo}</strong>
                                <span className="salario">
                                    {divisaActual} ${convertirSalario(t.salario || 0)}
                                </span>
                                <br />
                                <small>Publicado por: {t.autor}</small>
                            </div>
                            <div className="task-acciones">
                                {rol === 'user' && (
                                    t.estado === 'abierta'
                                        ? <button className="btn-green" onClick={() => handleAplicar(t.id)}>Aplicar</button>
                                        : <span className="badge-aplicado">Ya se aplicó</span>
                                )}
                                {rol === 'admin' && (
                                    <>
                                        <button
                                            className="btn-yellow"
                                            onClick={() => setTareaEditando({ id: t.id, titulo: t.titulo, salario: t.salario })}
                                        >✏️</button>
                                        <button className="btn-danger btn-compact" onClick={() => handleEliminar(t.id)}>🗑️</button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Paginación */}
                <div className="controles-paginacion">
                    <button
                        onClick={() => setPaginaActual(p => p - 1)}
                        disabled={paginaActual === 1}
                        className="btn-pag"
                    >← Anterior</button>
                    <span className="num-pagina">Página {paginaActual}</span>
                    <button
                        onClick={() => setPaginaActual(p => p + 1)}
                        disabled={tareas.length < 5}
                        className="btn-pag"
                    >Siguiente →</button>
                </div>
            </div>

            {/* PANEL ADMIN — USUARIOS */}
            {rol === 'admin' && (
                <div className="card">
                    <h2>Panel de Control de Usuarios</h2>
                    <div className="tabla-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.nombre}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <select
                                                value={u.role}
                                                onChange={e => handleCambiarRol(u.id, e.target.value)}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

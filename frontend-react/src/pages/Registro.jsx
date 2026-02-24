import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarUsuario } from '../services/api';

export default function Registro() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    async function handleRegistro(e) {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            await registrarUsuario(nombre, email, password);
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Crear Cuenta</h2>
                <form onSubmit={handleRegistro}>
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="error-msg">{error}</p>}
                    <button type="submit" disabled={cargando}>
                        {cargando ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link></p>
                </div>
            </div>
        </div>
    );
}

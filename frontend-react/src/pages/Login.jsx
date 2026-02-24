import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUsuario } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            const datos = await loginUsuario(email, password);
            login(datos.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Iniciar Sesión</h2>
                <form onSubmit={handleLogin}>
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
                        {cargando ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}

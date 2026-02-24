import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Decodifica el payload del JWT sin librerías externas
function decodeToken(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [usuario, setUsuario] = useState(() => {
        const t = localStorage.getItem('token');
        return t ? decodeToken(t) : null;
    });

    function login(nuevoToken) {
        localStorage.setItem('token', nuevoToken);
        setToken(nuevoToken);
        setUsuario(decodeToken(nuevoToken));
    }

    function logout() {
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value={{ token, usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
    return useContext(AuthContext);
}

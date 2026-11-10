import { createContext, useState } from 'react';
import { login } from '../services/login';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');

    return Boolean(token);
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('role') || null;
  });

  const singOut = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const setAuthSession = (data) => {
    const tokenRecibido = data?.token || data?.data?.token || data;
    const rolRecibido = data?.role || data?.data?.role;

    if (tokenRecibido && rolRecibido) {
      localStorage.setItem('token', tokenRecibido);
      localStorage.setItem('role', rolRecibido);
      setIsAuthenticated(true);
      setUserRole(rolRecibido);
    } else {
      console.error(
        'No se pudo establecer la sesión de autenticación: token o rol faltante'
      );
    }
  };

  const singIn = async (username, password) => {
    const { data, error } = await login(username, password);

    if (error) {
      return { error };
    }

    setAuthSession(data);

    return { error: null };
  };

  const singInAdmin = async (username, password) => {
    const { data, error } = await loginAdmin(username, password);

    if (error) {
      return { error };
    }

    setAuthSession(data);

    return { error: null };
  };

  const singInPatient = async (username, password) => {
    const { data, error } = await loginPatient(username, password);

    if (error) {
      return { error };
    }

    setAuthSession(data);

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        singIn,
        singInAdmin,
        singInPatient,
        singOut,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };

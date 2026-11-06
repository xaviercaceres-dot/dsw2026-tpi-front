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

  const singout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  const setAuthSession = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const singin = async (username, password) => {
    const { data, error } = await login(username, password);

    if (error) {
      return { error };
    }

    setAuthSession(data);

    return { error: null };
  };

  const singinAdmin = async (username, password) => {
    const { data, error } = await loginAdmin(username, password);

    if (error) {
      return { error };
    }

    setAuthSession(data);

    return { error: null };
  };

  const singinPatient = async (username, password) => {
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
        singin,
        singinAdmin,
        singinPatient,
        singout,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };

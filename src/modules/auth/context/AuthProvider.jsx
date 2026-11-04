import { createContext, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';
import { registerAdmin as registerAdminRequest } from '../services/adminRegister';

const AuthContext = createContext();

function readSession() {
  const token = sessionStorage.getItem('token');

  if (!token) return null;

  return {
    token,
    role: sessionStorage.getItem('role'),
    dni: sessionStorage.getItem('dni')
      ? Number(sessionStorage.getItem('dni'))
      : null,
  };
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const setAuthSession = ({ token, role, dni = null }) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('role', role);

    if (dni !== null) sessionStorage.setItem('dni', String(dni));

    setSession({ token, role, dni });
  };

  const signout = () => {
    sessionStorage.clear();
    setSession(null);
  };

  const signinAdmin = async (email, password) => {
    const { data } = await loginAdmin(email, password);

    setAuthSession(data);

    return data;
  };

  const signinPatient = async (email, dni) => {
    const { data } = await loginPatient(email, dni);

    setAuthSession({ ...data, dni: Number(dni) });

    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session),
        role: session?.role,
        dni: session?.dni,
        signinAdmin,
        signinPatient,
        registerAdmin: registerAdminRequest,
        signout,
        // Backwards-compatible names used by existing pages.
        singinAdmin: signinAdmin,
        singinPatient: signinPatient,
        singout: signout,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };

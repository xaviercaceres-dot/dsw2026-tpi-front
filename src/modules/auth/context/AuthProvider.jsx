import { createContext, useCallback, useMemo, useState } from 'react';
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

function clearStoredSession() {
  ['token', 'role', 'dni'].forEach((key) => sessionStorage.removeItem(key));
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const setAuthSession = useCallback(({ token, role, dni = null }) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('role', role);

    if (dni === null) sessionStorage.removeItem('dni');
    else sessionStorage.setItem('dni', String(dni));

    setSession({ token, role, dni });
  }, []);

  const signout = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  const signinAdmin = useCallback(
    async (email, password) => {
      const { data } = await loginAdmin(email, password);

      setAuthSession(data);

      return data;
    },
    [setAuthSession]
  );

  const signinPatient = useCallback(
    async (email, dni) => {
      const { data } = await loginPatient(email, dni);

      setAuthSession({ ...data, dni: Number(dni) });

      return data;
    },
    [setAuthSession]
  );

  const contextValue = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      role: session?.role,
      dni: session?.dni,
      signinAdmin,
      signinPatient,
      registerAdmin: registerAdminRequest,
      signout,
      setAuthSession,
    }),
    [session, signinAdmin, signinPatient, signout, setAuthSession]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };

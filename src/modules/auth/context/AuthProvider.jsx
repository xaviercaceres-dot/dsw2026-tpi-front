import { createContext, useCallback, useMemo, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';
import { logout } from '../services/logout';
import { isKnownRole, ROLES } from '../helpers/roles';

const AuthContext = createContext();
const SESSION_KEYS = ['token', 'role', 'dni', 'email'];

function clearStoredSession() {
  SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key));
}

function readSession() {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token) return null;

  // Una sesión con un rol desconocido (por ejemplo, guardada por una versión anterior) se descarta.
  if (!isKnownRole(role)) {
    clearStoredSession();

    return null;
  }

  const dni = sessionStorage.getItem('dni');

  return {
    token,
    role,
    dni: dni ? Number(dni) : null,
    email: sessionStorage.getItem('email'),
  };
}

function createRoleError(message) {
  const error = new Error(message);

  error.isRoleError = true;

  return error;
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const setAuthSession = useCallback(
    ({ token, role, dni = null, email = null }) => {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', role);

      if (dni === null) sessionStorage.removeItem('dni');
      else sessionStorage.setItem('dni', String(dni));

      if (email === null) sessionStorage.removeItem('email');
      else sessionStorage.setItem('email', email);

      setSession({ token, role, dni, email });
    },
    []
  );

  const signout = useCallback(async () => {
    if (sessionStorage.getItem('token')) {
      try {
        await logout();
      } catch {
        // Sin acción: la sesión local se elimina igualmente.
      }
    }

    clearStoredSession();
    setSession(null);
  }, []);

  const signinAdmin = useCallback(
    async (email, password) => {
      const { data } = await loginAdmin(email, password);

      if (data.role !== ROLES.ADMIN) {
        throw createRoleError('La cuenta no tiene permisos administrativos.');
      }

      setAuthSession({ token: data.token, role: data.role, email });

      return data;
    },
    [setAuthSession]
  );

  const signinPatient = useCallback(
    async (email, dni) => {
      const { data } = await loginPatient(email, dni);

      if (data.role !== ROLES.PATIENT) {
        throw createRoleError(
          'La cuenta ingresada no corresponde a un paciente.'
        );
      }

      setAuthSession({
        token: data.token,
        role: data.role,
        dni: Number(dni),
        email,
      });

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
      email: session?.email,
      signinAdmin,
      signinPatient,
      signout,
    }),
    [session, signinAdmin, signinPatient, signout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };

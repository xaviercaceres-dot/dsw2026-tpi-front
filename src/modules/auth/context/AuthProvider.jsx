import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';
import { logout } from '../services/logout';
import { isKnownRole, ROLES } from '../helpers/roles';
import { getTokenClaims, isTokenExpired } from '../helpers/jwt';

const AuthContext = createContext();
// 'role' y 'dni' se limpian por si quedaron guardados por una versión anterior.
const SESSION_KEYS = ['token', 'email', 'role', 'dni'];

function clearStoredSession() {
  SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key));
}

// El rol, el DNI y el vencimiento salen del token emitido por el backend,
// no de valores sueltos que cualquiera puede editar en sessionStorage.
function buildSession(token, email = null) {
  const claims = getTokenClaims(token);

  if (!claims || !isKnownRole(claims.role) || isTokenExpired(claims)) {
    return null;
  }

  return { token, role: claims.role, dni: claims.dni, exp: claims.exp, email };
}

function readSession() {
  const token = sessionStorage.getItem('token');

  if (!token) return null;

  const session = buildSession(token, sessionStorage.getItem('email'));

  // Token vencido, ilegible o con un rol desconocido: se descarta la sesión.
  if (!session) clearStoredSession();

  return session;
}

function createRoleError(message) {
  const error = new Error(message);

  error.isRoleError = true;

  return error;
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  // Al vencer el token se cierra la sesión local y el guardián redirige al login.
  useEffect(() => {
    if (!session) return undefined;

    const timer = setTimeout(
      clearSession,
      Math.max(0, session.exp * 1000 - Date.now())
    );

    return () => clearTimeout(timer);
  }, [session, clearSession]);

  // El rol se valida antes de guardar la sesión.
  const startSession = useCallback((token, email, expectedRole, message) => {
    const nextSession = buildSession(token, email);

    if (!nextSession || nextSession.role !== expectedRole) {
      throw createRoleError(message);
    }

    clearStoredSession();
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('email', email);
    setSession(nextSession);
  }, []);

  const signout = useCallback(async () => {
    if (sessionStorage.getItem('token')) {
      try {
        await logout();
      } catch {
        // Sin acción: la sesión local se elimina igualmente.
      }
    }

    clearSession();
  }, [clearSession]);

  const signinAdmin = useCallback(
    async (email, password) => {
      const { data } = await loginAdmin(email, password);

      startSession(
        data.token,
        email,
        ROLES.ADMIN,
        'La cuenta no tiene permisos administrativos.'
      );

      return data;
    },
    [startSession]
  );

  const signinPatient = useCallback(
    async (email, dni) => {
      const { data } = await loginPatient(email, dni);

      startSession(
        data.token,
        email,
        ROLES.PATIENT,
        'La cuenta ingresada no corresponde a un paciente.'
      );

      return data;
    },
    [startSession]
  );

  const contextValue = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      role: session?.role ?? null,
      dni: session?.dni ?? null,
      email: session?.email ?? null,
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

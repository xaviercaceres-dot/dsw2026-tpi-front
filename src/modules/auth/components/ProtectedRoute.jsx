import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { HOME_BY_ROLE } from '../helpers/roles';

// Ruta privada (Unidad 5): si no hay sesión redirige al login; si el rol no coincide,
// redirige a la página de inicio del rol del usuario autenticado.
function ProtectedRoute({ role, redirectTo = '/login', children }) {
  const { isAuthenticated, role: currentRole } = useAuth();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (role && currentRole !== role) {
    return <Navigate to={HOME_BY_ROLE[currentRole] ?? redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;

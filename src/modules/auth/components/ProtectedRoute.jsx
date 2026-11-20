import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { HOME_BY_ROLE } from '../helpers/roles';

function ProtectedRoute({
  allowedRoles = [],
  redirectTo = '/login',
  children,
}) {
  const { isAuthenticated, role: currentRole } = useAuth();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to={HOME_BY_ROLE[currentRole] ?? redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;

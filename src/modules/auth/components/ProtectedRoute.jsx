import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';

function ProtectedRoute({ children, redirectTo = '/login', allowRoles }) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowRoles && !allowRoles.includes(userRole)) {
    if (userRole === 'Administrador')
      return <Navigate to="/admin/home" replace />;
    if (userRole === 'Paciente') return <Navigate to="/" replace />;

    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

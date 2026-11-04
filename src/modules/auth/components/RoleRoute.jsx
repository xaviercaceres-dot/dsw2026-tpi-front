import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';

function RoleRoute({ role, redirectTo, children }) {
  const { isAuthenticated, role: currentRole } = useAuth();

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (currentRole !== role) {
    return (
      <Navigate
        to={currentRole === 'Administrador' ? '/admin/home' : '/'}
        replace
      />
    );
  }

  return children;
}

export default RoleRoute;

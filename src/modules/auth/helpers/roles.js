// Roles definidos por el enunciado y devueltos por el backend en el login
// (POST /api/auth/admin/login y POST /api/auth/patient/login → { token, role }).
export const ROLES = Object.freeze({
  ADMIN: 'ADMINISTRADOR',
  PATIENT: 'PACIENTE',
});

// Página de inicio de cada rol (se usa para redirigir cuando se accede a una ruta de otro rol).
export const HOME_BY_ROLE = Object.freeze({
  [ROLES.ADMIN]: '/admin/home',
  [ROLES.PATIENT]: '/',
});

export const isKnownRole = (role) => Object.values(ROLES).includes(role);

export const ROLES = Object.freeze({
  ADMIN: 'ADMINISTRADOR',
  PATIENT: 'PACIENTE',
});

export const HOME_BY_ROLE = Object.freeze({
  [ROLES.ADMIN]: '/admin/home',
  [ROLES.PATIENT]: '/',
});

export const isKnownRole = (role) => Object.values(ROLES).includes(role);

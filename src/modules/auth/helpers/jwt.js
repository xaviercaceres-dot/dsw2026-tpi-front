import { isKnownRole } from './roles';

// ASP.NET Core emite el rol con el nombre largo de ClaimTypes.Role.
const ROLE_CLAIMS = [
  'role',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
];

// Lee el payload del JWT. No verifica la firma: eso lo hace el backend en cada solicitud.
export function decodeToken(token) {
  try {
    const [, payload] = String(token).split('.');
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

// Datos de la sesión tomados del token: rol, DNI (solo pacientes) y vencimiento (segundos).
export function getTokenClaims(token) {
  const payload = decodeToken(token);

  if (!payload) return null;

  const rawRole = ROLE_CLAIMS.map((claim) => payload[claim]).find(Boolean);
  const role = Array.isArray(rawRole) ? rawRole.find(isKnownRole) : rawRole;
  const dni = Number(payload.dni);

  return {
    role: role ?? null,
    dni: Number.isInteger(dni) && dni > 0 ? dni : null,
    exp: typeof payload.exp === 'number' ? payload.exp : null,
  };
}

export const isTokenExpired = (claims, now = Date.now()) =>
  !claims?.exp || claims.exp * 1000 <= now;

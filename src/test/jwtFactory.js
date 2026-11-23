// Utilidad de pruebas: arma un JWT de ejemplo (sin firma válida) con el payload indicado.
const toBase64Url = (value) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const binary = String.fromCharCode(...bytes);

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export const makeToken = (payload) =>
  `${toBase64Url({ alg: 'HS256', typ: 'JWT' })}.${toBase64Url(payload)}.firma`;

export const secondsFromNow = (seconds) =>
  Math.floor(Date.now() / 1000) + seconds;

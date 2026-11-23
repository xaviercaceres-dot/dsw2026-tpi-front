import { describe, expect, it } from 'vitest';
import { decodeToken, getTokenClaims, isTokenExpired } from './jwt';
import { HOME_BY_ROLE, isKnownRole, ROLES } from './roles';
import {
  makeToken,
  ROLE_CLAIM,
  secondsFromNow,
} from '../../../test/jwtFactory';

describe('jwt', () => {
  it('lee el rol (claim de ASP.NET Core), el DNI y el vencimiento', () => {
    const exp = secondsFromNow(3600);
    const token = makeToken({ [ROLE_CLAIM]: 'PACIENTE', dni: '30111222', exp });

    expect(getTokenClaims(token)).toEqual({
      role: 'PACIENTE',
      dni: 30111222,
      exp,
    });
  });

  it('acepta el claim "role" corto, listas de roles y texto con acentos', () => {
    const token = makeToken({
      role: ['OTRO', 'ADMINISTRADOR'],
      name: 'Martínez Ñandú',
      exp: secondsFromNow(60),
    });

    expect(getTokenClaims(token).role).toBe('ADMINISTRADOR');
    expect(decodeToken(token).name).toBe('Martínez Ñandú');
  });

  it('devuelve null si el token es ilegible y dni null si no lo trae', () => {
    expect(getTokenClaims('no-es-un-jwt')).toBeNull();
    expect(getTokenClaims('a.%%%.c')).toBeNull();
    expect(
      getTokenClaims(makeToken({ [ROLE_CLAIM]: 'ADMINISTRADOR' })).dni
    ).toBeNull();
  });

  it('detecta tokens vencidos o sin vencimiento', () => {
    expect(isTokenExpired({ exp: secondsFromNow(-1) })).toBe(true);
    expect(isTokenExpired({ exp: secondsFromNow(60) })).toBe(false);
    expect(isTokenExpired({ exp: null })).toBe(true);
  });
});

describe('roles', () => {
  it('usa los mismos nombres de rol que el backend', () => {
    expect(ROLES).toEqual({ ADMIN: 'ADMINISTRADOR', PATIENT: 'PACIENTE' });
    expect(HOME_BY_ROLE[ROLES.ADMIN]).toBe('/admin/home');
    expect(HOME_BY_ROLE[ROLES.PATIENT]).toBe('/');
    expect(isKnownRole('Administrador')).toBe(false);
  });
});

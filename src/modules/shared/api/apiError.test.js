import { describe, expect, it } from 'vitest';
import { getApiError } from './apiError';

const httpError = (status, data) => ({ response: { status, data } });

describe('getApiError', () => {
  it('muestra los detalles de un error de validación', () => {
    const error = httpError(400, {
      errorCode: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: [{ field: 'name', issue: 'El nombre es obligatorio.' }],
    });

    expect(getApiError(error).message).toBe('El nombre es obligatorio.');
  });

  it('traduce el conflicto de reserva, 403 y 429', () => {
    expect(
      getApiError(httpError(409, { errorCode: 'APPOINTMENT_CONFLICT' })).message
    ).toMatch(/ya fue reservado/);
    expect(getApiError(httpError(403, {})).message).toMatch(/permisos/);
    expect(getApiError(httpError(429, {})).message).toMatch(/límite/);
  });

  it('prioriza los mensajes propios de la pantalla', () => {
    const error = httpError(401, { message: 'Unauthorized' });

    expect(getApiError(error, { 401: 'DNI incorrecto' }).message).toBe(
      'DNI incorrecto'
    );
  });

  it('detecta el backend caído', () => {
    expect(
      getApiError({ request: {}, message: 'Network Error' }).message
    ).toMatch(/No se pudo conectar/);
    expect(getApiError(httpError(500, '')).message).toMatch(
      /No se pudo conectar/
    );
  });
});

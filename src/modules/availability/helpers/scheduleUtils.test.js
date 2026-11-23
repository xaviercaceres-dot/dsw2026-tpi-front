import { describe, expect, it } from 'vitest';
import {
  buildAvailabilityPayload,
  buildScheduleFromData,
  createDefaultSchedule,
  getDayRangeError,
} from './scheduleUtils';

describe('getDayRangeError (regla del formulario de disponibilidad)', () => {
  it('exige entrada anterior a la salida y al menos 30 minutos', () => {
    expect(getDayRangeError('Lunes', '10:00', '09:00')).toMatch(/anterior/);
    expect(getDayRangeError('Lunes', '09:00', '09:20')).toMatch(/30 minutos/);
    expect(getDayRangeError('Lunes', '09:00', '09:30')).toBe('');
  });
});

describe('buildAvailabilityPayload', () => {
  it('envía solo los días habilitados, con el nombre que espera el backend', () => {
    const schedule = createDefaultSchedule();

    schedule['MIÉRCOLES'] = {
      enabled: true,
      startTime: '08:00',
      endTime: '12:00',
    };
    schedule['SÁBADO'] = {
      enabled: false,
      startTime: '09:00',
      endTime: '10:00',
    };

    expect(buildAvailabilityPayload('doc-1', schedule)).toEqual({
      doctorId: 'doc-1',
      days: [{ day: 'MIÉRCOLES', startTime: '08:00', endTime: '12:00' }],
    });
  });
});

describe('buildScheduleFromData', () => {
  it('convierte las reglas del backend en el formulario de la semana', () => {
    const schedule = buildScheduleFromData([
      { id: 1, day: 'LUNES', startTime: '09:00:00', endTime: '12:00:00' },
      { id: 2, day: 'LUNES', startTime: '14:00', endTime: '18:00' },
    ]);

    expect(schedule.LUNES).toEqual({
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
    });
    expect(schedule.MARTES.enabled).toBe(false);
  });
});

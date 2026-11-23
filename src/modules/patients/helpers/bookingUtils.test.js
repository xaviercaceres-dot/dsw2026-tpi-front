import { describe, expect, it } from 'vitest';
import {
  DAYS_IN_WINDOW,
  REASON_RULES,
  buildDaysWindow,
  filterValidSlotsForDate,
  validateBookingReason,
} from './bookingUtils';

describe('motivo de la consulta (regla de React Hook Form)', () => {
  it('acepta entre 5 y 300 caracteres sin contar espacios de los extremos', () => {
    expect(validateBookingReason('  abc ')).not.toBe('');
    expect(validateBookingReason('Control general')).toBe('');
    expect(REASON_RULES.validate('Control')).toBe(true);
    expect(REASON_RULES.validate('x'.repeat(301))).toMatch(/entre 5 y 300/);
  });
});

describe('turnos disponibles', () => {
  it('descarta turnos no disponibles y los ordena por hora', () => {
    const slots = [
      { id: 'b', startTime: '10:00', status: 'AVAILABLE' },
      { id: 'a', startTime: '09:00', status: 'AVAILABLE' },
      { id: 'c', startTime: '11:00', status: 'BOOKED' },
    ];

    expect(
      filterValidSlotsForDate(slots, '2999-01-01').map((slot) => slot.id)
    ).toEqual(['a', 'b']);
  });

  it('arma una ventana de días consecutivos desde hoy', () => {
    const days = buildDaysWindow(0);

    expect(days).toHaveLength(DAYS_IN_WINDOW);
    expect(new Set(days.map((day) => day.dateStr)).size).toBe(DAYS_IN_WINDOW);
  });
});

import {
  formatDateToIsoLocal,
  formatTimeHHmm,
} from '../../shared/utils/dateUtils';

export const DAYS_IN_WINDOW = 5;
export const REASON_MIN_LENGTH = 5;
export const REASON_MAX_LENGTH = 300;

const DAY_ABBR = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const DAY_FULL = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const BOOKING_ERROR_MESSAGES = {
  APPOINTMENT_CONFLICT:
    'Lo sentimos, ese horario acaba de ser reservado por otro paciente. Por favor, seleccioná otro turno.',
};

export function buildDayMeta(offsetFromToday) {
  const base = new Date();
  const d = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + offsetFromToday
  );

  return {
    dateStr: formatDateToIsoLocal(d),
    dayAbbr: DAY_ABBR[d.getDay()],
    fullDayName: DAY_FULL[d.getDay()],
    dayNumber: String(d.getDate()).padStart(2, '0'),
    monthName: MONTH_NAMES[d.getMonth()],
    monthShort: MONTH_NAMES[d.getMonth()].slice(0, 3).toUpperCase(),
    year: d.getFullYear(),
  };
}

export function buildDaysWindow(startOffset) {
  return Array.from({ length: DAYS_IN_WINDOW }, (_, i) =>
    buildDayMeta(startOffset + i)
  );
}

export function filterValidSlotsForDate(rawSlots, selectedDateStr) {
  if (!Array.isArray(rawSlots)) return [];

  const now = new Date();
  const todayStr = formatDateToIsoLocal(now);
  const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return rawSlots
    .filter((item) => {
      if (item.status && item.status !== 'AVAILABLE') return false;

      if (selectedDateStr === todayStr) {
        return formatTimeHHmm(item.startTime) > currentHHmm;
      }

      return true;
    })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

export function validateBookingReason(reason) {
  const trimmed = reason.trim();

  if (
    trimmed.length < REASON_MIN_LENGTH ||
    trimmed.length > REASON_MAX_LENGTH
  ) {
    return `Ingresá el motivo de la consulta (entre ${REASON_MIN_LENGTH} y ${REASON_MAX_LENGTH} caracteres).`;
  }

  return '';
}

// Regla de React Hook Form para el motivo (mismos límites que AppointmentService del backend).
export const REASON_RULES = {
  validate: (value) => validateBookingReason(String(value ?? '')) || true,
};

export function formatRangeHeaderLabel(daysWindow) {
  const firstDay = daysWindow[0];
  const lastDay = daysWindow[daysWindow.length - 1];

  return `${firstDay.fullDayName} ${firstDay.dayNumber} - ${lastDay.fullDayName} ${lastDay.dayNumber}, ${lastDay.monthName}`;
}

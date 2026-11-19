import { formatTimeHHmm, timeToMinutes } from '../../shared/utils/dateUtils';

export const DAYS_OF_WEEK = [
  { key: 'LUNES', label: 'Lunes' },
  { key: 'MARTES', label: 'Martes' },
  { key: 'MIÉRCOLES', label: 'Miércoles' },
  { key: 'JUEVES', label: 'Jueves' },
  { key: 'VIERNES', label: 'Viernes' },
  { key: 'SÁBADO', label: 'Sábado' },
  { key: 'DOMINGO', label: 'Domingo' },
];

const REVERSE_DAY_MAP = {
  0: 'DOMINGO',
  1: 'LUNES',
  2: 'MARTES',
  3: 'MIÉRCOLES',
  4: 'JUEVES',
  5: 'VIERNES',
  6: 'SÁBADO',
};

export function createDefaultSchedule() {
  return DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.key] = {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
    };

    return acc;
  }, {});
}

export function buildScheduleFromData(items) {
  const initialSchedule = createDefaultSchedule();

  if (!Array.isArray(items) || items.length === 0) {
    return initialSchedule;
  }

  const groupedByDay = {};

  items.forEach((slot) => {
    let dayName = null;

    if (slot.day !== undefined && slot.day !== null) {
      dayName =
        typeof slot.day === 'number'
          ? REVERSE_DAY_MAP[slot.day]
          : String(slot.day).trim().toUpperCase();
    } else if (slot.date) {
      const datePart = String(slot.date).substring(0, 10);
      const [year, month, day] = datePart.split('-').map(Number);
      const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

      dayName = REVERSE_DAY_MAP[dayIndex];
    }

    if (!dayName || !initialSchedule[dayName]) return;

    const start = formatTimeHHmm(slot.startTime, '09:00');
    const end = formatTimeHHmm(slot.endTime, '17:00');

    if (!groupedByDay[dayName]) {
      groupedByDay[dayName] = { startTime: start, endTime: end };
    } else {
      if (start < groupedByDay[dayName].startTime) {
        groupedByDay[dayName].startTime = start;
      }

      if (end > groupedByDay[dayName].endTime) {
        groupedByDay[dayName].endTime = end;
      }
    }
  });

  Object.keys(groupedByDay).forEach((dayName) => {
    initialSchedule[dayName] = {
      enabled: true,
      startTime: groupedByDay[dayName].startTime,
      endTime: groupedByDay[dayName].endTime,
    };
  });

  return initialSchedule;
}

export function validateSchedule(doctorId, schedule) {
  if (!doctorId) return 'Seleccioná un profesional.';

  const enabledDays = DAYS_OF_WEEK.filter((d) => schedule[d.key]?.enabled);

  if (enabledDays.length === 0) {
    return 'Debe habilitar al menos un día de disponibilidad.';
  }

  for (const day of enabledDays) {
    const { startTime, endTime } = schedule[day.key];

    if (!startTime || !endTime || startTime >= endTime) {
      return `En ${day.label}, la hora de entrada debe ser anterior a la hora de salida.`;
    }

    if (timeToMinutes(endTime) - timeToMinutes(startTime) < 30) {
      return `En ${day.label}, la diferencia entre entrada y salida debe ser de al menos 30 minutos.`;
    }
  }

  return '';
}

export function buildAvailabilityPayload(doctorId, schedule) {
  const days = DAYS_OF_WEEK.filter((d) =>
    Boolean(schedule[d.key]?.enabled)
  ).map((d) => ({
    day: d.key,
    startTime: formatTimeHHmm(schedule[d.key].startTime, '09:00'),
    endTime: formatTimeHHmm(schedule[d.key].endTime, '17:00'),
  }));

  return { doctorId, days };
}

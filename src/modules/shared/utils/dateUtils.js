const SHORT_MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function formatDateToIsoLocal(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getTodayIsoLocal() {
  return formatDateToIsoLocal(new Date());
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';

  const clean = String(dateStr).substring(0, 10);
  const parts = clean.split('-').map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) return clean;

  const [year, month, day] = parts;
  const monthLabel = SHORT_MONTHS[month - 1] || '';

  return `${String(day).padStart(2, '0')} ${monthLabel}, ${year}`;
}

export function formatTimeHHmm(timeStr, fallback = '') {
  if (!timeStr) return fallback;

  return String(timeStr).substring(0, 5);
}

export function formatDisplayTime12h(timeStr, fallback = 'Turno programado') {
  if (!timeStr) return fallback;

  const clean = formatTimeHHmm(timeStr);
  const [hStr, mStr] = clean.split(':');
  const h = Number(hStr);

  if (Number.isNaN(h)) return clean;

  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;

  return `${String(hour12).padStart(2, '0')}:${mStr || '00'} ${suffix}`;
}

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;

  const [hours, minutes] = formatTimeHHmm(timeStr).split(':').map(Number);

  return hours * 60 + minutes;
}

import { useEffect, useState } from 'react';
import {
  getDoctorAvailabilities,
  getDoctors,
} from '../../doctors/services/doctorsApi';
import { updateAvailability } from '../services/availabilityApi';
import { getApiError } from '../../shared/api/apiError';

const days = [
  'LUNES',
  'MARTES',
  'MIÉRCOLES',
  'JUEVES',
  'VIERNES',
  'SÁBADO',
  'DOMINGO',
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

function toMinutes(timeStr) {
  if (!timeStr) return 0;

  const [hours, minutes] = timeStr.substring(0, 5).split(':').map(Number);

  return hours * 60 + minutes;
}

function normalizeRules(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  if (items.some((item) => item.day)) {
    return items.map((item) => ({
      day: String(item.day).trim().toUpperCase(),
      startTime: (item.startTime || '08:00').substring(0, 5),
      endTime: (item.endTime || '12:00').substring(0, 5),
    }));
  }

  const groupedByDay = {};

  items.forEach((slot) => {
    if (!slot.date) return;

    const datePart = String(slot.date).substring(0, 10);
    const [year, month, day] = datePart.split('-').map(Number);
    const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const dayName = REVERSE_DAY_MAP[dayIndex];

    if (!dayName) return;

    const start = slot.startTime ? slot.startTime.substring(0, 5) : '09:00';
    const end = slot.endTime ? slot.endTime.substring(0, 5) : '17:00';

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

  return days
    .filter((dayName) => Boolean(groupedByDay[dayName]))
    .map((dayName) => ({
      day: dayName,
      startTime: groupedByDay[dayName].startTime,
      endTime: groupedByDay[dayName].endTime,
    }));
}

function AvailabilityPage() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [ranges, setRanges] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getDoctors({ pageSize: 100, pageIndex: 1 })
      .then((result) => setDoctors(result.data || []))
      .catch((requestError) => setError(getApiError(requestError).message));
  }, []);

  const fetchAvailabilities = async (selectedId) => {
    if (!selectedId) {
      setRanges([]);

      return;
    }

    setLoadingSchedule(true);
    setError('');
    try {
      const data = await getDoctorAvailabilities(selectedId);
      const loadedRanges = normalizeRules(data);

      setRanges(loadedRanges);
    } catch (requestError) {
      setError(getApiError(requestError).message);
      setRanges([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleDoctorChange = (event) => {
    const selectedId = event.target.value;

    setDoctorId(selectedId);
    setMessage('');
    setError('');
    fetchAvailabilities(selectedId);
  };

  const addRange = () =>
    setRanges((currentRanges) => [
      ...currentRanges,
      { day: 'LUNES', startTime: '08:00', endTime: '12:00' },
    ]);

  const updateRange = (index, key, value) =>
    setRanges((currentRanges) =>
      currentRanges.map((item, current) =>
        current === index ? { ...item, [key]: value } : item
      )
    );

  const removeRange = (index) =>
    setRanges((currentRanges) =>
      currentRanges.filter((_, current) => current !== index)
    );

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!doctorId || ranges.length === 0) {
      setError('Seleccioná un médico y al menos un rango.');

      return;
    }

    if (
      ranges.some(
        (item) =>
          !item.startTime || !item.endTime || item.startTime >= item.endTime
      )
    ) {
      setError('La hora inicial debe ser anterior a la final.');

      return;
    }

    if (
      ranges.some(
        (item) => toMinutes(item.endTime) - toMinutes(item.startTime) < 30
      )
    ) {
      setError(
        'La diferencia entre la hora de inicio y fin debe ser de al menos 30 minutos.'
      );

      return;
    }

    const grouped = ranges.reduce((result, item) => {
      result[item.day] = [...(result[item.day] || []), item];

      return result;
    }, {});

    const overlaps = Object.values(grouped).some((items) => {
      const sorted = [...items].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );

      return sorted.some(
        (item, index) => index > 0 && item.startTime < sorted[index - 1].endTime
      );
    });

    if (overlaps) {
      setError('No se permiten rangos superpuestos del mismo día.');

      return;
    }

    try {
      const request = {
        doctorId,
        days: ranges.map((item) => ({
          day: item.day,
          startTime: item.startTime.substring(0, 5),
          endTime: item.endTime.substring(0, 5),
        })),
      };

      await updateAvailability(request);
      await fetchAvailabilities(doctorId);
      setMessage('Disponibilidad guardada correctamente.');
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-text-main">
          Disponibilidad
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Configurá la disponibilidad del mes actual.
        </p>
      </div>
      <form
        onSubmit={submit}
        className="bg-white rounded-lg border p-5 flex flex-col gap-4"
      >
        <select
          required
          value={doctorId}
          className="border rounded px-3 py-2"
          onChange={handleDoctorChange}
        >
          <option value="">Seleccionar médico</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
        {loadingSchedule && (
          <p className="text-sm text-med-text-sub">
            Cargando disponibilidad actual...
          </p>
        )}
        {!loadingSchedule && doctorId && ranges.length === 0 && (
          <p className="text-sm text-med-text-sub">
            El médico no tiene rangos configurados para el mes actual. Agregá un
            rango para comenzar.
          </p>
        )}
        {ranges.map((range, index) => (
          <div
            key={`${range.day}-${index}`}
            className="grid gap-2 md:grid-cols-4"
          >
            <select
              value={range.day}
              className="border rounded px-2 py-2"
              onChange={(event) =>
                updateRange(index, 'day', event.target.value)
              }
            >
              {days.map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              required
              value={range.startTime}
              className="border rounded px-2 py-2"
              onChange={(event) =>
                updateRange(index, 'startTime', event.target.value)
              }
            />
            <input
              type="time"
              required
              value={range.endTime}
              className="border rounded px-2 py-2"
              onChange={(event) =>
                updateRange(index, 'endTime', event.target.value)
              }
            />
            <button
              type="button"
              className="border rounded text-red-700"
              onClick={() => removeRange(index)}
            >
              Quitar
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            className="border rounded px-3 py-2"
            onClick={addRange}
          >
            Agregar rango
          </button>
          <button
            type="submit"
            className="bg-med-primary-900 text-white rounded px-3 py-2"
          >
            Guardar configuración
          </button>
        </div>
        <p className="text-xs text-med-text-sub">
          Los turnos ya reservados se conservan al actualizar la configuración.
        </p>
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}
      </form>
    </div>
  );
}

export default AvailabilityPage;

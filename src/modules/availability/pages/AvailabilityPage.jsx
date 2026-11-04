import { useEffect, useState } from 'react';
import { getDoctors } from '../../doctors/services/doctorsApi';
import {
  createAvailability,
  updateAvailability,
} from '../services/availabilityApi';
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

function AvailabilityPage() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [ranges, setRanges] = useState([]);
  const [operation, setOperation] = useState('update');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getDoctors({ pageSize: 100, pageIndex: 1 })
      .then((result) => setDoctors(result.data || []))
      .catch((requestError) => setError(getApiError(requestError).message));
  }, []);

  const addRange = () =>
    setRanges([
      ...ranges,
      { day: 'LUNES', startTime: '08:00', endTime: '12:00' },
    ]);
  const updateRange = (index, key, value) =>
    setRanges(
      ranges.map((item, current) =>
        current === index ? { ...item, [key]: value } : item
      )
    );
  const removeRange = (index) =>
    setRanges(ranges.filter((_, current) => current !== index));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!doctorId || ranges.length === 0) {
      setError('Seleccioná un médico y al menos un rango.');

      return;
    }

    if (ranges.some((item) => item.startTime >= item.endTime)) {
      setError('La hora inicial debe ser anterior a la final.');

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
      const request = { doctorId, days: ranges };

      if (operation === 'create') {
        await createAvailability(request);
      } else {
        await updateAvailability(request);
      }

      setMessage(
        operation === 'create'
          ? 'Disponibilidad creada correctamente.'
          : 'Disponibilidad reemplazada correctamente.'
      );
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
          onChange={(event) => setDoctorId(event.target.value)}
        >
          <option value="">Seleccionar médico</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
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
            className={`border rounded px-3 py-2 ${
              operation === 'create' ? 'bg-med-primary-100' : ''
            }`}
            onClick={() => setOperation('create')}
          >
            Crear nueva
          </button>
          <button
            type="button"
            className={`border rounded px-3 py-2 ${
              operation === 'update' ? 'bg-med-primary-100' : ''
            }`}
            onClick={() => setOperation('update')}
          >
            Reemplazar
          </button>
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
          Los turnos ya reservados se conservan al reemplazar la configuración.
        </p>
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}
      </form>
    </div>
  );
}

export default AvailabilityPage;

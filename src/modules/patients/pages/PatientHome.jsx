import { useEffect, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import {
  getDoctorAvailabilities,
  getDoctors,
} from '../../doctors/services/doctorsApi';
import { getAvailableSlots } from '../../availability/services/availabilityApi';
import { createAppointment } from '../../appointments/services/appointmentsApi';
import useAuth from '../../auth/hook/useAuth';
import { getApiError } from '../../shared/api/apiError';

const DAY_INDEX_TO_SPANISH = {
  0: 'DOMINGO',
  1: 'LUNES',
  2: 'MARTES',
  3: 'MIÉRCOLES',
  4: 'JUEVES',
  5: 'VIERNES',
  6: 'SÁBADO',
};

function formatDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function today() {
  return formatDate(new Date());
}

function filterValidSlotsForDate(rawSlots, selectedDateStr) {
  if (!Array.isArray(rawSlots)) return [];

  const now = new Date();
  const todayStr = formatDate(now);
  const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return rawSlots
    .filter((item) => {
      if (item.isReserved === true) return false;

      if (item.status && item.status !== 'AVAILABLE') return false;

      if (selectedDateStr === todayStr) {
        const slotTime = (item.startTime || '').substring(0, 5);

        return slotTime > currentHHmm;
      }

      return true;
    })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

function PatientHome() {
  const { dni } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(today());
  const [slot, setSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getSpecialties({ pageSize: 100, pageIndex: 1 }),
      getDoctors({ pageSize: 100, pageIndex: 1 }),
    ])
      .then(([specialtyData, doctorData]) => {
        setSpecialties(specialtyData.data || []);
        setDoctors(doctorData.data || []);
      })
      .catch((requestError) => setError(getApiError(requestError).message));
  }, []);

  const searchSlots = async (
    targetDoctorId = doctorId,
    targetDate = date,
    autoAdvance = false
  ) => {
    if (!targetDoctorId || !targetDate) return;

    setLoading(true);
    setError('');
    setSlot(null);
    try {
      const rawSlots = await getAvailableSlots(targetDoctorId, targetDate);
      const validSlots = filterValidSlotsForDate(rawSlots, targetDate);

      if (validSlots.length > 0 || !autoAdvance) {
        setSlots(validSlots);

        return;
      }

      const rules = await getDoctorAvailabilities(targetDoctorId);
      const activeDays = new Set(
        rules
          .map((rule) =>
            rule.day ? String(rule.day).trim().toUpperCase() : null
          )
          .filter(Boolean)
      );

      const baseDate = new Date();

      for (let offset = 1; offset <= 14; offset += 1) {
        const candidate = new Date(baseDate);

        candidate.setDate(baseDate.getDate() + offset);
        const dayName = DAY_INDEX_TO_SPANISH[candidate.getDay()];

        if (activeDays.size > 0 && !activeDays.has(dayName)) {
          continue;
        }

        const candidateStr = formatDate(candidate);
        const candidateRaw = await getAvailableSlots(
          targetDoctorId,
          candidateStr
        );
        const candidateValid = filterValidSlotsForDate(
          candidateRaw,
          candidateStr
        );

        if (candidateValid.length > 0) {
          setDate(candidateStr);
          setSlots(candidateValid);

          return;
        }
      }

      setSlots([]);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (event) => {
    const selectedDoctorId = event.target.value;

    setDoctorId(selectedDoctorId);
    setSlots([]);
    setSlot(null);
    setMessage('');
    setError('');

    if (selectedDoctorId && date) {
      searchSlots(selectedDoctorId, date, true);
    }
  };

  const book = async () => {
    if (!slot || reason.length < 5 || reason.length > 300) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await createAppointment({
        doctorId,
        availabilitySlotId: slot.id,
        patient: { dni },
        reason,
      });
      setMessage('Turno reservado correctamente.');
      setSlot(null);
      setReason('');
      await searchSlots(doctorId, date, false);
    } catch (requestError) {
      const apiError = getApiError(requestError);
      const backendCode =
        requestError.response?.data?.code ||
        requestError.response?.data?.errorCode ||
        apiError.code;

      if (apiError.status === 409 || backendCode === 'APPOINTMENT_CONFLICT') {
        setError(
          requestError.response?.data?.message ||
            'Lo sentimos, este horario acaba de ser reservado por otro paciente o ya no está disponible. Por favor, seleccione otro horario.'
        );
        setSlot(null);
        await searchSlots(doctorId, date, false);
      } else {
        setError(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = specialtyId
    ? doctors.filter((doctor) => doctor.specialty?.id === specialtyId)
    : doctors;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-primary-900">
          Reservar turno
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Elegí especialidad, médico, fecha y horario.
        </p>
      </div>
      <div className="bg-white rounded-lg border p-6 grid gap-4">
        <select
          value={specialtyId}
          className="border rounded px-3 py-2"
          onChange={(e) => {
            setSpecialtyId(e.target.value);
            setDoctorId('');
            setSlots([]);
            setSlot(null);
          }}
        >
          <option value="">Especialidad</option>
          {specialties.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={doctorId}
          className="border rounded px-3 py-2"
          onChange={handleDoctorChange}
        >
          <option value="">Médico</option>
          {filteredDoctors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          min={today()}
          value={date}
          className="border rounded px-3 py-2"
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          type="button"
          className="bg-med-primary-900 text-white rounded px-4 py-2"
          onClick={() => searchSlots(doctorId, date, false)}
        >
          Consultar horarios
        </button>
      </div>
      {slots.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-bold mb-3">Horarios disponibles</h2>
          <div className="flex flex-wrap gap-2">
            {slots.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`border rounded px-3 py-2 ${slot?.id === item.id ? 'bg-med-primary-900 text-white' : ''}`}
                onClick={() => setSlot(item)}
              >
                {item.startTime} - {item.endTime}
              </button>
            ))}
          </div>
        </div>
      )}
      {slot && (
        <div className="bg-white rounded-lg border p-6 flex flex-col gap-3">
          <p>
            Seleccionado: {date}, {slot.startTime} - {slot.endTime}
          </p>
          <textarea
            minLength={5}
            maxLength={300}
            value={reason}
            placeholder="Motivo de la consulta (5 a 300 caracteres)"
            className="border rounded px-3 py-2"
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            type="button"
            disabled={loading || reason.length < 5}
            className="bg-med-primary-900 text-white rounded px-4 py-2 disabled:opacity-50"
            onClick={book}
          >
            {loading ? 'Reservando...' : 'Confirmar turno'}
          </button>
        </div>
      )}
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default PatientHome;

import { useEffect, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getAvailableSlots } from '../../availability/services/availabilityApi';
import { createAppointment } from '../../appointments/services/appointmentsApi';
import useAuth from '../../auth/hook/useAuth';
import { getApiError } from '../../shared/api/apiError';

function today() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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

  const searchSlots = async () => {
    if (!doctorId || !date) return;

    setLoading(true);
    setError('');
    setSlot(null);
    try {
      setSlots(await getAvailableSlots(doctorId, date));
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
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
      await searchSlots();
    } catch (requestError) {
      const apiError = getApiError(requestError);

      setError(
        apiError.status === 409
          ? 'El horario fue ocupado. Seleccioná otro.'
          : apiError.message
      );

      if (apiError.status === 409) await searchSlots();
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
          onChange={(e) => {
            setDoctorId(e.target.value);
            setSlots([]);
          }}
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
          onClick={searchSlots}
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

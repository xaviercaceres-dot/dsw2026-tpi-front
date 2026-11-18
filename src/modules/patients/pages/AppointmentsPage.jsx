import { useEffect, useState } from 'react';
import useAuth from '../../auth/hook/useAuth';
import {
  cancelAppointment,
  getPatientAppointments,
} from '../../appointments/services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import Button from '../../shared/components/Button';

function AppointmentsPage() {
  const { dni } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setAppointments(await getPatientAppointments(dni));
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dni) load();
  }, [dni]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id) => {
    if (!window.confirm('¿Cancelar este turno?')) return;

    try {
      await cancelAppointment(id);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-text-main">
          Mis turnos
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Consultá y cancelá tus turnos reservados.
        </p>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : appointments.length === 0 ? (
        <p>No tenés turnos reservados.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border p-5">
              <h2 className="font-bold">{item.doctorName}</h2>
              <p>{item.speciality}</p>
              <p>
                {item.date} — {item.startTime} a {item.endTime}
              </p>
              <p className="text-sm mt-2">{item.reason}</p>
              <p className="text-sm mt-2">Estado: {item.status}</p>
              {item.status === 'BOOKED' && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => remove(item.id)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;

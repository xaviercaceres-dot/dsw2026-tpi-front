import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';
import {
  cancelAppointment,
  getPatientAppointments,
} from '../../appointments/services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import PageHeader from '../../shared/components/PageHeader';
import PatientAppointmentCard from '../components/PatientAppointmentCard';

function AppointmentsPage() {
  const { dni } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // GET /api/appointments/patient?dni= → solo turnos activos (BOOKED) del paciente autenticado.
  const load = async () => {
    setLoading(true);
    try {
      const data = await getPatientAppointments(dni);

      setAppointments(data);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dni) load();
    else setLoading(false);
  }, [dni]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id) => {
    if (!window.confirm('¿Cancelar este turno?')) return;

    setError('');
    setMessage('');
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      setMessage('El turno fue cancelado y el horario quedó disponible.');
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto pt-8 px-4 sm:px-6">
        <PageHeader
          title="Mis Turnos Médicos"
          subtitle="Consulta y gestiona las citas médicas programadas."
          className="mb-0"
          actions={
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition"
            >
              + Solicitar Nuevo Turno
            </button>
          }
        />
      </div>

      {(error || message) && (
        <div className="max-w-5xl mx-auto mt-4 px-4 sm:px-6">
          {error && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600"
            >
              {error}
            </div>
          )}
          {message && (
            <div
              role="status"
              className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium"
            >
              {message}
            </div>
          )}
        </div>
      )}

      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-xs text-slate-400">
            Cargando turnos...
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-xs text-slate-400">
            No tenés turnos reservados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appointment) => (
              <PatientAppointmentCard
                key={appointment.id}
                appointment={appointment}
                cancelling={cancellingId === appointment.id}
                onCancel={remove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentsPage;

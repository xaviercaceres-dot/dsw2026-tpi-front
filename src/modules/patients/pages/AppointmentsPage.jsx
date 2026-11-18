import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';
import {
  cancelAppointment,
  getPatientAppointments,
} from '../../appointments/services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';

function AppointmentsPage() {
  const { dni } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPatientAppointments(dni);

      setAppointments(Array.isArray(data) ? data : []);
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

    try {
      await cancelAppointment(id);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  return (
    <div>
      {/* 1. Encabezado Superior */}
      <div className="max-w-5xl mx-auto pt-8 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2942]">
            Mis Turnos Médicos
          </h1>
          <p className="text-sm text-slate-500">
            Consulta y gestiona las citas médicas programadas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition"
        >
          + Solicitar Nuevo Turno
        </button>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto mt-4 px-6">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            {error}
          </div>
        </div>
      )}

      {/* 2. Grilla de Tarjetas de Turnos en 2 Columnas */}
      <div className="max-w-5xl mx-auto py-6 px-6">
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
            {appointments.map((appointment) => {
              const status = String(
                appointment.status || 'BOOKED'
              ).toUpperCase();
              const specialtyName =
                appointment.speciality ||
                appointment.specialty ||
                appointment.doctor?.specialty?.name ||
                'Consulta Médica';

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Fila Superior */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-[#E6F2FA] text-[#133B5C] text-xs font-bold px-3 py-1 rounded-full">
                        {specialtyName}
                      </span>

                      {status === 'CANCELLED' ? (
                        <span className="bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold px-3 py-1 rounded-full">
                          • Cancelado
                        </span>
                      ) : status === 'ATTENDED' ? (
                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                          • Completado
                        </span>
                      ) : (
                        <span className="bg-[#DCFCE7] text-[#15803D] text-xs font-semibold px-3 py-1 rounded-full">
                          • Confirmado
                        </span>
                      )}
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <h2 className="text-lg font-bold text-[#133B5C]">
                      {appointment.doctorName ||
                        appointment.doctor?.name ||
                        'Profesional Médico'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Fecha:{' '}
                      <span className="font-bold text-slate-800">
                        {appointment.date}
                      </span>{' '}
                      a las{' '}
                      <span className="font-bold text-slate-800">
                        {(appointment.startTime || '').substring(0, 5)} hs
                      </span>
                    </p>
                  </div>

                  <div>
                    {/* Separador */}
                    <div className="border-t border-slate-100 my-4" />

                    {/* Botón Inferior */}
                    <button
                      type="button"
                      disabled={status !== 'BOOKED'}
                      onClick={() => remove(appointment.id)}
                      className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40"
                    >
                      Cancelar Turno
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentsPage;

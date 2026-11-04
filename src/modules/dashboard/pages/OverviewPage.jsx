import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointmentsByDate } from '../../appointments/services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';

function getLocalDate() {
  return new Date().toLocaleDateString('en-CA');
}

function OverviewPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialtiesCount, setSpecialtiesCount] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [doctorResult, specialtyResult, appointmentResult] =
          await Promise.all([
            getDoctors({ pageSize: 100, pageIndex: 1 }),
            getSpecialties({ pageSize: 1, pageIndex: 1 }),
            getAppointmentsByDate({
              date: getLocalDate(),
              pageSize: 1,
              pageIndex: 1,
            }),
          ]);

        setDoctors(doctorResult.data || []);
        setSpecialtiesCount(specialtyResult.total || 0);
        setAppointmentsToday(appointmentResult.total || 0);
      } catch (requestError) {
        setError(getApiError(requestError).message);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const filteredDoctors = doctors
    .filter((doctor) =>
      doctor.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 3);

  const metrics = [
    { label: 'Doctores Activos', value: doctors.length, badge: 'Actualizado' },
    {
      label: 'Especialidades Activas',
      value: specialtiesCount,
      badge: 'Actualizado',
    },
    {
      label: 'Turnos Confirmados Para Hoy',
      value: appointmentsToday,
      badge: 'Hoy',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Vista General de Gestión
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Configure el personal médico y las especialidades del departamento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => navigate('/admin/doctors')}>
            + Agregar Nuevo Doctor
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/specialties')}
          >
            + Agregar Nueva Especialidad
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="flex flex-col justify-between p-6"
          >
            <span className="self-end text-xs font-semibold px-2.5 py-1 rounded-full bg-med-primary-50 text-med-primary-900">
              {metric.badge}
            </span>
            <div className="mt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">
                {metric.label}
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-med-primary-900 mt-1">
                {loading ? '...' : metric.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Directorio de Profesionales Médicos
          </h2>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre..."
            aria-label="Buscar por nombre"
            className="w-full sm:w-72 px-3 py-1.5 text-xs bg-med-primary-50/70 border border-med-border rounded-lg"
          />
        </div>

        {error && <p className="p-5 text-red-500">{error}</p>}
        {!error && !loading && filteredDoctors.length === 0 && (
          <p className="p-5 text-med-text-sub">No hay médicos para mostrar.</p>
        )}
        {filteredDoctors.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub">
                <tr>
                  <th className="px-6 py-3.5">Nombre del Doctor</th>
                  <th className="px-6 py-3.5">Especialidad</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-med-border-subtle text-sm">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="px-6 py-4 font-semibold text-med-primary-900">
                      {doctor.name}
                    </td>
                    <td className="px-6 py-4 text-med-text-sub">
                      {doctor.specialty?.name || 'Sin especialidad'}
                    </td>
                    <td className="px-6 py-4 text-med-active-text">Activo</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/doctors')}
                        className="text-xs font-semibold text-med-primary-700 hover:text-med-primary-900"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 bg-med-primary-50/50 border-t border-med-border text-xs text-med-text-muted">
          Mostrando {Math.min(filteredDoctors.length, 3)} de {doctors.length}{' '}
          registros
        </div>
      </Card>
    </div>
  );
}

export default OverviewPage;

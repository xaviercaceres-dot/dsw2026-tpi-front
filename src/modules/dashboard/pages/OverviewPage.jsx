import { useNavigate } from 'react-router-dom';
import { useOverview } from '../hook/useOverview';
import Button from '../../shared/components/Button';
import PageHeader from '../../shared/components/PageHeader';
import MetricCard from '../../shared/components/MetricCard';
import DataTableCard from '../../shared/components/DataTableCard';
import SearchInput from '../../shared/components/SearchInput';
import DoctorAvatar from '../../shared/components/DoctorAvatar';

const TABLE_COLUMNS = [
  { key: 'name', label: 'NOMBRE DEL DOCTOR' },
  { key: 'specialty', label: 'ESPECIALIDAD' },
  { key: 'actions', label: 'ACCIONES', align: 'right' },
];

function OverviewPage() {
  const navigate = useNavigate();
  const {
    metrics,
    visibleDoctors,
    search,
    loading,
    error,
    pagination,
    handleSearchChange,
  } = useOverview(3);

  return (
    <div>
      <PageHeader
        title="Vista General de Gestión"
        subtitle="Configure el personal médico y las especialidades del departamento."
        actions={
          <>
            <Button
              variant="default"
              className="py-2.5 text-xs font-semibold"
              onClick={() => navigate('/admin/doctors?action=create')}
            >
              + Agregar Nuevo Doctor
            </Button>
            <Button
              variant="secondary"
              className="py-2.5 text-xs font-semibold"
              onClick={() => navigate('/admin/specialties?action=create')}
            >
              + Agregar Nueva Especialidad
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          badgeText="Activos"
          badgeVariant="success"
          label="DOCTORES ACTIVOS"
          value={metrics.doctorsTotal}
          loading={loading}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
        />

        <MetricCard
          badgeText="Estable"
          badgeVariant="neutral"
          label="ESPECIALIDADES ACTIVAS"
          value={metrics.specialtiesCount}
          loading={loading}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          }
        />

        <MetricCard
          badgeText="Hoy"
          badgeVariant="info"
          label="TURNOS CONFIRMADOS PARA HOY"
          value={metrics.appointmentsToday}
          loading={loading}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
        >
          {error}
        </div>
      )}

      <DataTableCard
        title="Directorio de Profesionales Médicos"
        headerActions={
          <SearchInput
            value={search}
            placeholder="Buscar por nombre..."
            className="w-full sm:w-64"
            inputClassName="bg-[#F4F7F9] py-1.5"
            onChange={handleSearchChange}
          />
        }
        columns={TABLE_COLUMNS}
        loading={loading}
        emptyText="No hay médicos para mostrar."
        itemCount={visibleDoctors.length}
        pagination={pagination}
      >
        {visibleDoctors.map((doctor) => (
          <tr
            key={doctor.id}
            className="hover:bg-slate-50/70 transition-colors"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <DoctorAvatar variant="circle" size="sm" showStatus={false} />
                <span className="font-bold text-[#133B5C] text-xs">
                  {doctor.name}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 text-xs text-slate-600">
              {doctor.specialty?.name || 'Sin especialidad'}
            </td>
            <td className="px-6 py-4 text-right">
              <Button
                variant="link"
                className="text-xs"
                onClick={() => navigate('/admin/doctors')}
              >
                Ver Detalle
              </Button>
            </td>
          </tr>
        ))}
      </DataTableCard>
    </div>
  );
}

export default OverviewPage;

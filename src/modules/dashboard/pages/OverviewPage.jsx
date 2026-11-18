import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointmentsByDate } from '../../appointments/services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import PageHeader from '../../shared/components/PageHeader';
import MetricCard from '../../shared/components/MetricCard';
import DataTableCard from '../../shared/components/DataTableCard';
import SearchInput from '../../shared/components/SearchInput';
import DoctorAvatar from '../../shared/components/DoctorAvatar';
import StatusBadge from '../../shared/components/StatusBadge';
import { usePagination } from '../../shared/hooks/usePagination';
import { getTodayIsoLocal } from '../../shared/utils/dateUtils';

const TABLE_COLUMNS = [
  { key: 'name', label: 'NOMBRE DEL DOCTOR' },
  { key: 'specialty', label: 'ESPECIALIDAD' },
  { key: 'status', label: 'ESTADO DE DISPONIBILIDAD' },
  { key: 'actions', label: 'ACCIONES', align: 'right' },
];

function OverviewPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [doctorsTotal, setDoctorsTotal] = useState(0);
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
            getSpecialties({ pageSize: 100, pageIndex: 1 }),
            getAppointmentsByDate({
              date: getTodayIsoLocal(),
              pageSize: 100,
              pageIndex: 1,
            }),
          ]);

        const doctorItems = Array.isArray(doctorResult)
          ? doctorResult
          : Array.isArray(doctorResult?.data)
            ? doctorResult.data
            : [];
        const specialtyItems = Array.isArray(specialtyResult)
          ? specialtyResult
          : Array.isArray(specialtyResult?.data)
            ? specialtyResult.data
            : [];
        const appointmentItems = Array.isArray(appointmentResult)
          ? appointmentResult
          : Array.isArray(appointmentResult?.data)
            ? appointmentResult.data
            : [];

        const bookedAppointments = appointmentItems.filter(
          (item) =>
            (item.appointmentsStatus || item.status || 'BOOKED') === 'BOOKED'
        );

        setDoctors(doctorItems);
        setDoctorsTotal(doctorResult?.total ?? doctorItems.length);
        setSpecialtiesCount(specialtyResult?.total ?? specialtyItems.length);
        setAppointmentsToday(
          appointmentItems.length > 0
            ? bookedAppointments.length
            : (appointmentResult?.total ?? 0)
        );
      } catch (requestError) {
        setError(getApiError(requestError).message);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) =>
        (doctor.name || '').toLowerCase().includes(search.toLowerCase())
      ),
    [doctors, search]
  );

  const {
    currentPage,
    totalPages,
    paginatedItems: visibleDoctors,
    totalItems,
    pageSize,
    setCurrentPage,
    handlePageChange,
  } = usePagination(filteredDoctors, 3);

  return (
    <div>
      <PageHeader
        title="Vista General de Gestión"
        subtitle="Configure el personal médico y las especialidades del departamento."
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate('/admin/doctors?action=create')}
              className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition"
            >
              + Agregar Nuevo Doctor
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/specialties?action=create')}
              className="bg-white border border-[#133B5C] text-[#133B5C] hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-lg text-xs transition"
            >
              + Agregar Nueva Especialidad
            </button>
          </>
        }
      />

      {/* Fila de 3 Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          badgeText="+4 este mes"
          badgeVariant="success"
          label="DOCTORES ACTIVOS"
          value={doctorsTotal}
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
          value={specialtiesCount}
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
          value={appointmentsToday}
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Directorio de Profesionales Médicos */}
      <DataTableCard
        title="Directorio de Profesionales Médicos"
        headerActions={
          <SearchInput
            value={search}
            placeholder="Buscar por nombre..."
            className="w-full sm:w-64"
            inputClassName="bg-[#F4F7F9] py-1.5"
            onChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
          />
        }
        columns={TABLE_COLUMNS}
        loading={loading}
        emptyText="No hay médicos para mostrar."
        itemCount={visibleDoctors.length}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: handlePageChange,
        }}
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
              {doctor.specialty?.name || doctor.specialty || 'Sin especialidad'}
            </td>
            <td className="px-6 py-4">
              <StatusBadge status="ACTIVO" label="Activo" />
            </td>
            <td className="px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => navigate('/admin/doctors')}
                className="text-[#133B5C] font-bold text-xs hover:underline"
              >
                Ver Detalle
              </button>
            </td>
          </tr>
        ))}
      </DataTableCard>
    </div>
  );
}

export default OverviewPage;

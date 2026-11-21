import { useAppointmentsSearch } from '../hook/useAppointmentsSearch';
import PageHeader from '../../shared/components/PageHeader';
import AppointmentSearchFilters from '../components/AppointmentSearchFilters';
import AppointmentsTable from '../components/AppointmentsTable';

function AppointmentsSearchPage() {
  const {
    specialties,
    doctors,
    filters,
    setFilters,
    appointments,
    error,
    loading,
    pagination,
    handleApply,
    handleClear,
  } = useAppointmentsSearch();

  return (
    <div>
      <PageHeader
        title="Búsqueda y Filtrado de Citas"
        subtitle="Gestione y supervise el flujo de pacientes del departamento."
        className="mb-0"
      />

      <AppointmentSearchFilters
        filters={filters}
        specialties={specialties}
        doctors={doctors}
        onChange={setFilters}
        onApply={handleApply}
        onClear={handleClear}
      />

      {error && (
        <div
          role="alert"
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
        >
          {error}
        </div>
      )}

      <AppointmentsTable
        appointments={appointments}
        loading={loading}
        pagination={pagination}
      />
    </div>
  );
}

export default AppointmentsSearchPage;

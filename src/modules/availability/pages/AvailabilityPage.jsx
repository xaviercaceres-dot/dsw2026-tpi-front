import { useNavigate } from 'react-router-dom';
import { useAvailability } from '../hook/useAvailability';
import PageHeader from '../../shared/components/PageHeader';
import DoctorAvailabilitySidebar from '../components/DoctorAvailabilitySidebar';
import ScheduleConfigForm from '../components/ScheduleConfigForm';

function AvailabilityPage() {
  const navigate = useNavigate();
  const {
    doctors,
    doctorId,
    selectedDoctor,
    schedule,
    loadingSchedule,
    saving,
    error,
    message,
    handleSelectDoctor,
    handleSave,
  } = useAvailability();

  return (
    <div>
      <PageHeader
        breadcrumb={{
          parentLabel: 'Doctores',
          onParentClick: () => navigate('/admin/doctors'),
          currentLabel: 'Disponibilidad Horaria',
        }}
      />

      <div>
        <h1 className="text-xl font-bold text-med-text-main mt-2">
          Gestionar Disponibilidad Horaria
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina los días y rangos horarios de atención para el profesional
          seleccionado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <DoctorAvailabilitySidebar
          doctors={doctors}
          doctorId={doctorId}
          selectedDoctor={selectedDoctor}
          onSelectDoctor={handleSelectDoctor}
        />

        <ScheduleConfigForm
          schedule={schedule}
          loading={loadingSchedule}
          saving={saving}
          error={error}
          message={message}
          onSubmit={handleSave}
          onCancel={() => navigate('/admin/doctors')}
        />
      </div>
    </div>
  );
}

export default AvailabilityPage;

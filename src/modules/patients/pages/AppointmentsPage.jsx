import { useNavigate } from 'react-router-dom';
import { usePatientAppointments } from '../hooks/usePatientAppointments';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import PageHeader from '../../shared/components/PageHeader';
import PatientAppointmentCard from '../components/PatientAppointmentCard';

function AppointmentsPage() {
  const navigate = useNavigate();
  const {
    appointments,
    error,
    message,
    loading,
    cancellingId,
    pendingCancel,
    requestCancel,
    dismissCancel,
    confirmCancel,
  } = usePatientAppointments();

  return (
    <div>
      <div className="max-w-5xl mx-auto pt-8 px-4 sm:px-6">
        <PageHeader
          title="Mis Turnos Médicos"
          subtitle="Consulta y gestiona las citas médicas programadas."
          className="mb-0"
          actions={
            <Button className="text-xs" onClick={() => navigate('/')}>
              + Solicitar Nuevo Turno
            </Button>
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
          <Card className="p-8 text-center text-xs text-slate-400">
            Cargando turnos...
          </Card>
        ) : appointments.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No tenés turnos reservados.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appointment) => (
              <PatientAppointmentCard
                key={appointment.id}
                appointment={appointment}
                cancelling={cancellingId === appointment.id}
                onCancel={requestCancel}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancelar turno"
        message={`¿Confirma la cancelación del turno del ${pendingCancel?.date ?? ''} con ${pendingCancel?.doctorName ?? 'el profesional'}? El horario quedará disponible para otros pacientes.`}
        confirmLabel="Cancelar turno"
        cancelLabel="Volver"
        loading={Boolean(cancellingId)}
        onConfirm={confirmCancel}
        onCancel={dismissCancel}
      />
    </div>
  );
}

export default AppointmentsPage;

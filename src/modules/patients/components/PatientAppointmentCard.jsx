import Card from '../../shared/components/Card';
import StatusBadge from '../../shared/components/StatusBadge';
import { formatTimeHHmm } from '../../shared/utils/dateUtils';
import Button from '../../shared/components/Button';

const STATUS_MAP = {
  BOOKED: { status: 'BOOKED', label: 'Confirmado' },
  CANCELLED: { status: 'CANCELLED', label: 'Cancelado' },
  ATTENDED: { status: 'ATTENDED', label: 'Completado' },
  NO_SHOW: { status: 'INACTIVE', label: 'Ausente' },
};

function PatientAppointmentCard({ appointment, cancelling = false, onCancel }) {
  // Se muestran los datos tal como llegan del backend (AppointmentModel.Response), sin inventar valores.
  const status = String(appointment.status ?? '').toUpperCase();
  const badgeMeta = STATUS_MAP[status] || {
    status: 'INFO',
    label: status || '—',
  };

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <StatusBadge
            status="SPECIALTY"
            label={appointment.speciality || '—'}
            className="text-xs"
          />
          <StatusBadge
            status={badgeMeta.status}
            label={badgeMeta.label}
            className="text-xs font-semibold"
          />
        </div>

        <h2 className="text-lg font-bold text-med-primary-900">
          {appointment.doctorName || '—'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Fecha:{' '}
          <span className="font-bold text-slate-800">{appointment.date}</span> a
          las{' '}
          <span className="font-bold text-slate-800">
            {formatTimeHHmm(appointment.startTime)} hs
          </span>
        </p>
      </div>

      <div>
        <div className="border-t border-slate-100 my-4" />

        <Button
          variant="dangerOutline"
          className="w-full text-xs"
          disabled={status !== 'BOOKED' || cancelling}
          onClick={() => onCancel(appointment)}
        >
          {cancelling ? 'Cancelando...' : 'Cancelar Turno'}
        </Button>
      </div>
    </Card>
  );
}

export default PatientAppointmentCard;

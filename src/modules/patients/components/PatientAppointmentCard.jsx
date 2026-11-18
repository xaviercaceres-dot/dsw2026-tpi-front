import StatusBadge from '../../shared/components/StatusBadge';
import { formatTimeHHmm } from '../../shared/utils/dateUtils';

const STATUS_MAP = {
  CANCELLED: { status: 'CANCELLED', label: 'Cancelado' },
  ATTENDED: { status: 'ATTENDED', label: 'Completado' },
  BOOKED: { status: 'BOOKED', label: 'Confirmado' },
};

function PatientAppointmentCard({ appointment, onCancel }) {
  const status = String(appointment.status || 'BOOKED').toUpperCase();
  const badgeMeta = STATUS_MAP[status] || STATUS_MAP.BOOKED;
  const specialtyName =
    appointment.speciality ||
    appointment.specialty ||
    appointment.doctor?.specialty?.name ||
    'Consulta Médica';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <StatusBadge
            status="SPECIALTY"
            label={specialtyName}
            className="text-xs"
          />
          <StatusBadge
            status={badgeMeta.status}
            label={badgeMeta.label}
            className="text-xs font-semibold"
          />
        </div>

        <h2 className="text-lg font-bold text-[#133B5C]">
          {appointment.doctorName ||
            appointment.doctor?.name ||
            'Profesional Médico'}
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

        <button
          type="button"
          disabled={status !== 'BOOKED'}
          onClick={() => onCancel(appointment.id)}
          className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40"
        >
          Cancelar Turno
        </button>
      </div>
    </div>
  );
}

export default PatientAppointmentCard;

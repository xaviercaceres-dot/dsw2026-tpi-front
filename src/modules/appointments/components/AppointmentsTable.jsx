import DataTableCard from '../../shared/components/DataTableCard';
import StatusBadge from '../../shared/components/StatusBadge';
import {
  formatDisplayDate,
  formatDisplayTime12h,
  getTodayIsoLocal,
} from '../../shared/utils/dateUtils';

const COLUMNS = [
  { key: 'date', label: 'FECHA' },
  { key: 'department', label: 'DEPARTAMENTO' },
  { key: 'patient', label: 'PACIENTE' },
  { key: 'status', label: 'ESTADO' },
  { key: 'actions', label: 'ACCIONES', align: 'right' },
];

const STATUS_MAP = {
  ATTENDED: { status: 'COMPLETED', label: 'COMPLETADO' },
  CANCELLED: { status: 'CANCELLED', label: 'CANCELADO' },
  BOOKED: { status: 'CONFIRMED', label: 'CONFIRMADO' },
};

function AppointmentsTable({
  appointments = [],
  fallbackDate,
  loading = false,
  pagination,
}) {
  return (
    <div className="mt-6">
      <DataTableCard
        title="Registros de Citas"
        columns={COLUMNS}
        loading={loading}
        emptyText="No hay resultados para los filtros seleccionados."
        itemCount={appointments.length}
        pagination={pagination}
      >
        {appointments.map((item, index) => {
          const rawStatus = String(
            item.appointmentsStatus || item.status || 'BOOKED'
          ).toUpperCase();
          const badgeMeta = STATUS_MAP[rawStatus] || STATUS_MAP.BOOKED;
          const dateToFormat = item.date || fallbackDate || getTodayIsoLocal();
          const specialtyName =
            item.doctor?.specialty?.name ||
            item.specialty ||
            item.speciality ||
            'Medicina General';
          const doctorName = item.doctor?.name || item.doctorName || '—';
          const patientLabel =
            item.patient?.fullName ||
            item.patient?.email ||
            item.patientName ||
            'Paciente';
          const patientDni = item.patient?.dni ?? item.patientDni ?? '—';

          return (
            <tr
              key={item.appointmentsId || item.id || index}
              className="hover:bg-slate-50/70 transition-colors"
            >
              <td className="px-6 py-4">
                <p className="font-bold text-[#133B5C] text-xs">
                  {formatDisplayDate(dateToFormat)}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatDisplayTime12h(item.startTime)}
                </p>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F2FA] text-[#133B5C] flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-[#133B5C] text-xs">
                      {specialtyName}
                    </p>
                    <p className="text-[11px] text-slate-400">{doctorName}</p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <p className="font-bold text-slate-700 text-xs">
                  {patientLabel}
                </p>
                <p className="text-[11px] text-slate-400">DNI: {patientDni}</p>
              </td>

              <td className="px-6 py-4">
                <StatusBadge
                  status={badgeMeta.status}
                  label={badgeMeta.label}
                  uppercase
                />
              </td>

              <td className="px-6 py-4 text-right">
                <span className="text-[#133B5C] font-bold text-xs cursor-pointer hover:underline">
                  Ver Detalle
                </span>
              </td>
            </tr>
          );
        })}
      </DataTableCard>
    </div>
  );
}

export default AppointmentsTable;

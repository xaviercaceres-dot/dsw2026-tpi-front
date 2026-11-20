import { Fragment, useState } from 'react';
import DataTableCard from '../../shared/components/DataTableCard';
import StatusBadge from '../../shared/components/StatusBadge';
import {
  formatDisplayDate,
  formatDisplayTime12h,
} from '../../shared/utils/dateUtils';

const COLUMNS = [
  { key: 'date', label: 'FECHA' },
  { key: 'department', label: 'DEPARTAMENTO' },
  { key: 'patient', label: 'PACIENTE' },
  { key: 'status', label: 'ESTADO' },
  { key: 'actions', label: 'ACCIONES', align: 'right' },
];

const STATUS_MAP = {
  BOOKED: { status: 'CONFIRMED', label: 'CONFIRMADO' },
  CANCELLED: { status: 'CANCELLED', label: 'CANCELADO' },
  ATTENDED: { status: 'COMPLETED', label: 'COMPLETADO' },
  NO_SHOW: { status: 'PENDING', label: 'AUSENTE' },
};

// availableTime llega como "YYYY-MM-DDTHH:mm:ss" (fecha y hora del turno, hora local del centro).
function splitAvailableTime(availableTime) {
  const [date = '', time = ''] = String(availableTime || '').split('T');

  return { date, time: time.substring(0, 5) };
}

function AppointmentsTable({ appointments = [], loading = false, pagination }) {
  const [expandedId, setExpandedId] = useState(null);

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
        {appointments.map((item) => {
          const rawStatus = String(item.appointmentsStatus || '').toUpperCase();
          const badgeMeta = STATUS_MAP[rawStatus] || {
            status: 'INFO',
            label: rawStatus || '—',
          };
          const { date, time } = splitAvailableTime(item.availableTime);
          const specialtyName = item.doctor?.specialty?.name || '—';
          const doctorName = item.doctor?.name || '—';
          const patientName = item.patient?.fullName || 'Paciente';
          const patientDni = item.patient?.dni ?? '—';
          const isExpanded = expandedId === item.appointmentsId;

          return (
            <Fragment key={item.appointmentsId}>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-[#133B5C] text-xs">
                    {formatDisplayDate(date)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatDisplayTime12h(time, '—')}
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
                        aria-hidden="true"
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
                    {patientName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    DNI: {patientDni}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <StatusBadge
                    status={badgeMeta.status}
                    label={badgeMeta.label}
                    uppercase
                  />
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : item.appointmentsId)
                    }
                    className="text-[#133B5C] font-bold text-xs hover:underline"
                  >
                    {isExpanded ? 'Ocultar' : 'Ver Detalle'}
                  </button>
                </td>
              </tr>

              {isExpanded && (
                <tr className="bg-[#F8FAFC]">
                  <td colSpan={COLUMNS.length} className="px-6 py-4">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <dt className="text-slate-400">Fecha y hora</dt>
                        <dd className="font-semibold text-slate-700">
                          {formatDisplayDate(date)} - {time || '—'} hs
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Profesional</dt>
                        <dd className="font-semibold text-slate-700">
                          {doctorName} ({specialtyName})
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Paciente</dt>
                        <dd className="font-semibold text-slate-700">
                          {patientName} - DNI {patientDni}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Código de cita</dt>
                        <dd className="font-mono text-[11px] text-slate-600 break-all">
                          {item.appointmentsId}
                        </dd>
                      </div>
                    </dl>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </DataTableCard>
    </div>
  );
}

export default AppointmentsTable;

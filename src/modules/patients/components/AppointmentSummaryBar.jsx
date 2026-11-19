import { formatTimeHHmm } from '../../shared/utils/dateUtils';

function AppointmentSummaryBar({
  selectedSlot,
  selectedDayMeta,
  reason,
  reasonError,
  loading = false,
  onReasonChange,
  onConfirm,
}) {
  if (!selectedSlot || !selectedDayMeta) return null;

  return (
    <section className="bg-[#F0F7FC] rounded-xl border border-[#D0E5F5] p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="border-l-4 border-[#133B5C] pl-4 w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            RESUMEN DE SELECCIÓN
          </span>
          <p className="text-sm font-extrabold text-[#133B5C] mt-0.5">
            📅 {selectedDayMeta.fullDayName} {selectedDayMeta.dayNumber} de{' '}
            {selectedDayMeta.monthName} de {selectedDayMeta.year},{' '}
            {formatTimeHHmm(selectedSlot.startTime)} HS
          </p>
          <p className="text-[11px] text-slate-500">
            Clínica San Rafael - Sede Central Consultorio 402 • Duración: 30 min
          </p>
        </div>

        <div className="w-full md:w-64">
          <label
            htmlFor="appointment-reason"
            className="text-[11px] font-semibold text-slate-600 block mb-1"
          >
            Motivo de la consulta *
          </label>
          <input
            id="appointment-reason"
            type="text"
            maxLength={300}
            value={reason}
            aria-invalid={Boolean(reasonError)}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Ej. Control general"
            className={`bg-white border rounded-lg px-3 py-2 text-xs w-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C] ${
              reasonError ? 'border-red-400' : 'border-slate-200'
            }`}
          />
          {reasonError && (
            <p className="text-[11px] text-red-500 mt-1">{reasonError}</p>
          )}
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold text-xs px-6 py-3 rounded-lg flex items-center justify-center gap-2 shrink-0 w-full md:w-auto md:mt-5 transition disabled:opacity-50"
        >
          <span>{loading ? 'Confirmando...' : 'Confirmar Turno'}</span>
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default AppointmentSummaryBar;

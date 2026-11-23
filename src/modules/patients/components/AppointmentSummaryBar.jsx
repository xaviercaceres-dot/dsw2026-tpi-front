import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import { formatTimeHHmm } from '../../shared/utils/dateUtils';
import { REASON_MAX_LENGTH } from '../helpers/bookingUtils';

// reasonField: props de register('reason') de React Hook Form (el formulario vive en usePatientBooking).
function AppointmentSummaryBar({
  selectedSlot,
  selectedDayMeta,
  reasonField,
  reasonError,
  loading = false,
  onConfirm,
}) {
  if (!selectedSlot || !selectedDayMeta) return null;

  return (
    <section className="bg-med-primary-50 rounded-xl border border-med-primary-200 p-5">
      <form
        onSubmit={onConfirm}
        noValidate
        className="flex flex-col md:flex-row md:items-start justify-between gap-4"
      >
        <div className="border-l-4 border-med-primary-900 pl-4 w-full md:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            RESUMEN DE SELECCIÓN
          </span>
          <p className="text-sm font-extrabold text-med-primary-900 mt-0.5">
            📅 {selectedDayMeta.fullDayName} {selectedDayMeta.dayNumber} de{' '}
            {selectedDayMeta.monthName} de {selectedDayMeta.year},{' '}
            {formatTimeHHmm(selectedSlot.startTime)} a{' '}
            {formatTimeHHmm(selectedSlot.endTime)} HS
          </p>
          <p className="text-[11px] text-slate-500">Duración: 30 min</p>
        </div>

        <div className="w-full md:w-64">
          <label
            htmlFor="appointment-reason"
            className="text-[11px] font-semibold text-slate-600 block mb-1"
          >
            Motivo de la consulta *
          </label>
          <Input
            id="appointment-reason"
            maxLength={REASON_MAX_LENGTH}
            placeholder="Ej. Control general"
            invalid={Boolean(reasonError)}
            className="px-3 py-2"
            {...reasonField}
          />
          {reasonError && (
            <p className="text-[11px] text-red-500 mt-1">{reasonError}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="text-xs shrink-0 w-full md:w-auto md:mt-5"
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
        </Button>
      </form>
    </section>
  );
}

export default AppointmentSummaryBar;

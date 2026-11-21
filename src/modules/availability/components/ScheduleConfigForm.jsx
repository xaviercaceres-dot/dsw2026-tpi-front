import { DAYS_OF_WEEK } from '../helpers/scheduleUtils';
import ScheduleDayRow from './ScheduleDayRow';

const FALLBACK_DAY = { enabled: false, startTime: '09:00', endTime: '17:00' };

function ScheduleConfigForm({
  schedule,
  loading,
  saving,
  error,
  message,
  onToggleDay,
  onUpdateDayTime,
  onSubmit,
  onCancel,
}) {
  const handleFormSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="lg:col-span-8">
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
      >
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h2 className="text-sm font-bold text-[#133B5C]">
            Configuración de Horarios
          </h2>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Intervalos automáticos de 30 minutos</span>
          </div>
        </div>

        <div className="hidden sm:grid bg-[#DCEEFB] px-6 py-2.5 grid-cols-12 text-[11px] font-bold text-[#133B5C] uppercase">
          <div className="col-span-3">DÍA</div>
          <div className="col-span-3">ESTADO</div>
          <div className="col-span-3">ENTRADA</div>
          <div className="col-span-3">SALIDA</div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="px-6 py-8 text-center text-xs text-slate-400">
              Cargando disponibilidad actual...
            </div>
          ) : (
            DAYS_OF_WEEK.map((day) => (
              <ScheduleDayRow
                key={day.key}
                day={day}
                dayData={schedule[day.key] || FALLBACK_DAY}
                onToggle={onToggleDay}
                onTimeChange={onUpdateDayTime}
              />
            ))
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mx-4 sm:mx-6 my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
          >
            {error}
          </div>
        )}
        {message && (
          <div
            role="status"
            className="mx-4 sm:mx-6 my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700"
          >
            {message}
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border border-[#133B5C]/40 text-[#133B5C] px-5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#133B5C] hover:bg-[#0F2E49] text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            <span>{saving ? 'Guardando...' : 'Guardar Disponibilidad'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleConfigForm;

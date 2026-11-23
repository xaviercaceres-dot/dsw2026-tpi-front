import Input from '../../shared/components/Input';

const timeInputClass = 'px-3 py-1.5 font-medium sm:w-32';

// Fila de un día. Los campos se registran en el formulario del padre (React Hook Form).
function ScheduleDayRow({ day, enabled, register, rules, error }) {
  const endTimeField = `${day.key}.endTime`;

  return (
    <div className="px-4 sm:px-6 py-3.5 grid grid-cols-2 sm:grid-cols-12 items-center gap-x-3 gap-y-2">
      <div className="sm:col-span-3">
        <span
          className={`text-xs font-semibold ${
            enabled ? 'text-slate-800' : 'text-slate-400'
          }`}
        >
          {day.label}
        </span>
      </div>

      <div className="sm:col-span-3 flex items-center justify-end sm:justify-start gap-2.5">
        <label className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer">
          <input
            type="checkbox"
            role="switch"
            aria-label={`Atiende los ${day.label.toLowerCase()}`}
            className="peer sr-only"
            {...register(`${day.key}.enabled`, { deps: [endTimeField] })}
          />
          <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-med-primary-900 peer-focus-visible:ring-2 peer-focus-visible:ring-med-primary-600" />
          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
        </label>
        <span
          className={
            enabled
              ? 'text-xs font-bold text-med-primary-900'
              : 'text-xs text-slate-400'
          }
        >
          {enabled ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="sm:col-span-3">
        <span className="sm:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">
          Entrada
        </span>
        <Input
          type="time"
          aria-label={`Entrada ${day.label}`}
          disabled={!enabled}
          className={timeInputClass}
          {...register(`${day.key}.startTime`, { deps: [endTimeField] })}
        />
      </div>

      <div className="sm:col-span-3">
        <span className="sm:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">
          Salida
        </span>
        <Input
          type="time"
          aria-label={`Salida ${day.label}`}
          disabled={!enabled}
          invalid={Boolean(error)}
          className={timeInputClass}
          {...register(endTimeField, rules)}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="col-span-2 sm:col-span-12 text-[11px] text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default ScheduleDayRow;

function ScheduleDayRow({ day, dayData, onToggle, onTimeChange }) {
  const isActive = Boolean(dayData.enabled);

  return (
    <div className="px-4 sm:px-6 py-3.5 grid grid-cols-2 sm:grid-cols-12 items-center gap-x-3 gap-y-2">
      <div className="sm:col-span-3">
        <span
          className={`text-xs font-semibold ${
            isActive ? 'text-slate-800' : 'text-slate-400'
          }`}
        >
          {day.label}
        </span>
      </div>

      <div className="sm:col-span-3 flex items-center justify-end sm:justify-start gap-2.5">
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          aria-label={`Atiende los ${day.label.toLowerCase()}`}
          onClick={() => onToggle(day.key)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            isActive ? 'bg-[#133B5C]' : 'bg-slate-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isActive ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <span
          className={
            isActive
              ? 'text-xs font-bold text-[#133B5C]'
              : 'text-xs text-slate-400'
          }
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="sm:col-span-3">
        <span className="sm:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">
          Entrada
        </span>
        <input
          type="time"
          aria-label={`Entrada ${day.label}`}
          disabled={!isActive}
          value={dayData.startTime}
          onChange={(e) => onTimeChange(day.key, 'startTime', e.target.value)}
          className={`border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium w-full sm:w-32 focus:outline-none focus:ring-1 focus:ring-[#133B5C] ${
            isActive
              ? 'bg-white text-slate-700'
              : 'bg-slate-50 text-slate-300 cursor-not-allowed'
          }`}
        />
      </div>

      <div className="sm:col-span-3">
        <span className="sm:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">
          Salida
        </span>
        <input
          type="time"
          aria-label={`Salida ${day.label}`}
          disabled={!isActive}
          value={dayData.endTime}
          onChange={(e) => onTimeChange(day.key, 'endTime', e.target.value)}
          className={`border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium w-full sm:w-32 focus:outline-none focus:ring-1 focus:ring-[#133B5C] ${
            isActive
              ? 'bg-white text-slate-700'
              : 'bg-slate-50 text-slate-300 cursor-not-allowed'
          }`}
        />
      </div>
    </div>
  );
}

export default ScheduleDayRow;

import { formatTimeHHmm } from '../../shared/utils/dateUtils';

function WeeklySlotsGrid({
  daysWindow = [],
  slotsByDate = {},
  selectedSlot,
  rangeHeaderLabel,
  canGoBack = false,
  loading = false,
  onShiftWeek,
  onSelectSlot,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() => onShiftWeek(-5)}
            className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            ‹
          </button>
          <span className="text-sm font-bold text-[#133B5C]">
            {rangeHeaderLabel}
          </span>
          <button
            type="button"
            onClick={() => onShiftWeek(5)}
            className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50"
          >
            ›
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#133B5C]" />
            <span>Disponible</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#52C47C]" />
            <span>Seleccionado</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-5">
        {daysWindow.map((dayMeta) => {
          const daySlots = slotsByDate[dayMeta.dateStr] || [];

          return (
            <div key={dayMeta.dateStr} className="flex flex-col">
              <div className="text-center pb-2 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {dayMeta.dayAbbr}
                </p>
                <p className="text-lg font-extrabold text-[#133B5C]">
                  {dayMeta.dayNumber}
                </p>
              </div>

              <div className="space-y-2.5 mt-3">
                {loading ? (
                  <p className="text-[11px] text-slate-400 text-center py-10 px-2">
                    Cargando...
                  </p>
                ) : daySlots.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-10 px-2 leading-relaxed">
                    No hay turnos disponibles para este día.
                  </p>
                ) : (
                  daySlots.map((item) => {
                    const isSelected = selectedSlot?.id === item.id;
                    const labelTime = formatTimeHHmm(item.startTime);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectSlot(dayMeta.dateStr, item)}
                        className={
                          isSelected
                            ? 'w-full py-2 bg-[#52C47C] text-white border border-[#52C47C] rounded-lg text-xs font-bold shadow-sm transition'
                            : 'w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-[#133B5C] hover:border-[#133B5C] transition'
                        }
                      >
                        {labelTime}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklySlotsGrid;

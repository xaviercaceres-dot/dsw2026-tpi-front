import { useState } from 'react';
import { formatTimeHHmm } from '../../shared/utils/dateUtils';

const selectedSlotClass =
  'w-full py-2 bg-[#52C47C] text-white border border-[#52C47C] rounded-lg text-xs font-bold shadow-sm transition';
const slotClass =
  'w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-[#133B5C] hover:border-[#133B5C] transition';

// Flujo alternativo 4a del CU01: médico sin disponibilidad para un día.
function NoAvailability() {
  return (
    <div className="text-center py-8 px-2">
      <p className="text-[11px] font-semibold text-slate-500">
        Sin disponibilidad
      </p>
      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
        No hay turnos disponibles para este día.
      </p>
    </div>
  );
}

function SlotButton({ dayMeta, item, selectedSlot, onSelectSlot }) {
  const isSelected = selectedSlot?.id === item.id;
  const time = formatTimeHHmm(item.startTime);

  return (
    <button
      type="button"
      onClick={() => onSelectSlot(dayMeta.dateStr, item)}
      aria-pressed={isSelected}
      aria-label={`${dayMeta.fullDayName} ${dayMeta.dayNumber} a las ${time}`}
      className={isSelected ? selectedSlotClass : slotClass}
    >
      {time}
    </button>
  );
}

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
  const [activeDate, setActiveDate] = useState('');
  const firstDayWithSlots = daysWindow.find(
    (day) => (slotsByDate[day.dateStr] || []).length > 0
  );
  // Día visible en la vista móvil: el elegido por el paciente o el primero con turnos.
  const mobileDay =
    daysWindow.find((day) => day.dateStr === activeDate) ||
    firstDayWithSlots ||
    daysWindow[0];
  const mobileSlots = mobileDay ? slotsByDate[mobileDay.dateStr] || [] : [];

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() => onShiftWeek(-1)}
            aria-label="Días anteriores"
            className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            ‹
          </button>
          <span className="text-sm font-bold text-[#133B5C] text-center">
            {rangeHeaderLabel}
          </span>
          <button
            type="button"
            onClick={() => onShiftWeek(1)}
            aria-label="Días siguientes"
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

      {/* Vista móvil: selector de días y horarios del día elegido (mockup "Soporte Mobile") */}
      <div className="md:hidden pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-700">Próximos Turnos</p>
          <button
            type="button"
            onClick={() => onShiftWeek(1)}
            className="text-xs font-semibold text-[#133B5C]"
          >
            Ver más ›
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {daysWindow.map((dayMeta) => {
            const isActive = mobileDay?.dateStr === dayMeta.dateStr;
            const count = (slotsByDate[dayMeta.dateStr] || []).length;

            return (
              <button
                key={dayMeta.dateStr}
                type="button"
                onClick={() => setActiveDate(dayMeta.dateStr)}
                aria-pressed={isActive}
                className={`shrink-0 w-16 rounded-xl border py-2 flex flex-col items-center transition ${
                  isActive
                    ? 'bg-[#133B5C] border-[#133B5C] text-white'
                    : 'bg-white border-slate-200 text-[#133B5C]'
                } ${count === 0 && !isActive ? 'opacity-50' : ''}`}
              >
                <span className="text-[10px] font-bold uppercase">
                  {dayMeta.dayAbbr}
                </span>
                <span className="text-lg font-extrabold leading-tight">
                  {dayMeta.dayNumber}
                </span>
                <span className="text-[9px] uppercase">
                  {dayMeta.monthShort}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-bold text-slate-700 mt-4 mb-2">
          Horarios disponibles (Bloques de 30 min)
        </p>
        {loading ? (
          <p className="text-[11px] text-slate-400 text-center py-8">
            Cargando...
          </p>
        ) : mobileSlots.length === 0 ? (
          <NoAvailability />
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {mobileSlots.map((item) => (
              <SlotButton
                key={item.id}
                dayMeta={mobileDay}
                item={item}
                selectedSlot={selectedSlot}
                onSelectSlot={onSelectSlot}
              />
            ))}
          </div>
        )}
      </div>

      {/* Vista de escritorio: grilla de 5 días */}
      <div className="hidden md:grid grid-cols-5 gap-4 pt-5">
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
                  <NoAvailability />
                ) : (
                  daySlots.map((item) => (
                    <SlotButton
                      key={item.id}
                      dayMeta={dayMeta}
                      item={item}
                      selectedSlot={selectedSlot}
                      onSelectSlot={onSelectSlot}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WeeklySlotsGrid;

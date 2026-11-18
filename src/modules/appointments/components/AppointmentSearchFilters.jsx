import SearchInput from '../../shared/components/SearchInput';
import FormField from '../../shared/components/FormField';
import StatusBadge from '../../shared/components/StatusBadge';

function AppointmentSearchFilters({
  filters,
  specialties = [],
  doctors = [],
  onChange,
  onApply,
  onClear,
}) {
  const selectedSpecialtyObj = specialties.find(
    (s) => String(s.id) === String(filters.specialtyId)
  );
  const selectedDoctorObj = doctors.find(
    (d) => String(d.id) === String(filters.doctorId)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm mt-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
        <h2 className="text-sm font-bold text-[#133B5C]">
          Criterios de Búsqueda
        </h2>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Última actualización: hace un momento</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <FormField
          label="Nombre o DNI del Paciente"
          labelClassName="text-xs font-semibold text-slate-600 mb-1.5 block"
          className="md:col-span-3"
        >
          <SearchInput
            value={filters.dni}
            placeholder="Johnathan Doe"
            className="w-full"
            onChange={(value) => onChange({ ...filters, dni: value })}
          />
        </FormField>

        <FormField
          label="Especialidad"
          labelClassName="text-xs font-semibold text-slate-600 mb-1.5 block"
          className="md:col-span-3"
        >
          <select
            value={filters.specialtyId}
            onChange={(e) =>
              onChange({ ...filters, specialtyId: e.target.value })
            }
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          >
            <option value="">Todas las Especialidades</option>
            {specialties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Doctor"
          labelClassName="text-xs font-semibold text-slate-600 mb-1.5 block"
          className="md:col-span-2"
        >
          <select
            value={filters.doctorId}
            onChange={(e) => onChange({ ...filters, doctorId: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          >
            <option value="">Todos los Doctores</option>
            {doctors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Fecha"
          labelClassName="text-xs font-semibold text-slate-600 mb-1.5 block"
          className="md:col-span-2"
        >
          <input
            type="date"
            value={filters.date}
            onChange={(e) => onChange({ ...filters, date: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          />
        </FormField>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={onApply}
            className="w-full bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Aplicar Filtros</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {filters.dni.trim() && (
          <StatusBadge
            status="SPECIALTY"
            label={
              /^\d+$/.test(filters.dni.trim())
                ? `DNI: ${filters.dni.trim()}`
                : `Paciente: ${filters.dni.trim()}`
            }
          />
        )}
        {selectedSpecialtyObj && (
          <StatusBadge
            status="SPECIALTY"
            label={`Especialidad: ${selectedSpecialtyObj.name}`}
          />
        )}
        {selectedDoctorObj && (
          <StatusBadge
            status="SPECIALTY"
            label={`Doctor: ${selectedDoctorObj.name}`}
          />
        )}
        {filters.date && (
          <StatusBadge
            status="ACTIVE_NO_DOT"
            label={`Filtro Activo: Fecha ${filters.date}`}
          />
        )}
        {(filters.dni || filters.specialtyId || filters.doctorId) && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-[#133B5C] underline ml-1"
          >
            Restablecer filtros
          </button>
        )}
      </div>
    </div>
  );
}

export default AppointmentSearchFilters;

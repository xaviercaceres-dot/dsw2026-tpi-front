import FormField from '../../shared/components/FormField';

function DoctorAvailabilitySidebar({
  doctors,
  doctorId,
  selectedDoctor,
  onSelectDoctor,
}) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <FormField
          label="Seleccionar Profesional"
          labelClassName="text-xs font-bold text-[#133B5C] mb-2 block"
        >
          <select
            value={doctorId}
            onChange={(e) => onSelectDoctor(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          >
            <option value="">Seleccionar médico</option>
            {doctors.map((doctor) => {
              const specName = doctor.specialty?.name || 'General';

              return (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {specName}
                </option>
              );
            })}
          </select>
        </FormField>

        {selectedDoctor && (
          <div className="mt-4 bg-[#EBF5FB] rounded-xl p-3.5 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-2xl shadow-sm shrink-0">
              👨‍⚕️
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-[#133B5C] text-xs leading-snug truncate">
                {selectedDoctor.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                ID: {selectedDoctor.licenseNumber || '—'}
              </p>
              <p className="text-[11px] font-bold text-[#133B5C] mt-0.5">
                Sede Central
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-start gap-3">
        <svg
          className="text-[#133B5C] w-5 h-5 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xs text-slate-600 leading-relaxed">
          Los cambios generan turnos de 30 minutos desde hoy hasta fin de mes,
          sin incluir feriados. Las citas ya programadas no se verán afectadas
          automáticamente.
        </p>
      </div>
    </div>
  );
}

export default DoctorAvailabilitySidebar;

import Button from '../../shared/components/Button';
import FormField from '../../shared/components/FormField';

function DoctorSearchBar({
  specialties,
  doctors,
  specialtyId,
  doctorId,
  onSpecialtyChange,
  onDoctorChange,
  onSearch,
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
      <h1 className="text-xl font-bold text-[#0F2942]">
        Reservar Turno Médico
      </h1>
      <p className="text-xs text-slate-500 mt-0.5 mb-5">
        Seleccione la especialidad y el profesional para continuar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <FormField
          label="Seleccionar Especialidad"
          labelClassName="text-xs font-semibold text-slate-600 mb-1.5 block"
          className="md:col-span-5"
        >
          <select
            value={specialtyId}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            aria-label="Seleccionar Especialidad"
            className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          >
            <option value="">Todas las especialidades</option>
            {specialties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Seleccionar Doctor"
          labelClassName="text-xs font-semibold text-slate-600 mb-1.5 block"
          className="md:col-span-4"
        >
          <select
            value={doctorId}
            onChange={(e) => onDoctorChange(e.target.value)}
            aria-label="Seleccionar Doctor"
            className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          >
            <option value="">Seleccionar profesional</option>
            {doctors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="md:col-span-3">
          <Button
            variant="default"
            onClick={onSearch}
            className="w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Buscar Disponibilidad</span>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default DoctorSearchBar;

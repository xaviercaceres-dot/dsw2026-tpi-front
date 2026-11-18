import PageHeader from '../../shared/components/PageHeader';
import FormField from '../../shared/components/FormField';

function DoctorFormCard({
  form,
  specialties = [],
  error,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div>
      <PageHeader
        breadcrumb={{
          parentLabel: 'Doctors',
          onParentClick: onCancel,
          currentLabel: 'Agregar Nuevo Doctor',
        }}
      />

      <div className="max-w-3xl mt-4 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100">
          <h1 className="text-base font-bold text-[#133B5C] flex items-center gap-2.5">
            <svg
              className="w-5 h-5 text-[#133B5C]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span>Registrar Nuevo Doctor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete todos los campos obligatorios para integrar al nuevo
            facultativo al sistema del centro médico.
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          <FormField
            label="Nombre Completo del Doctor"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          >
            <input
              required
              minLength={3}
              maxLength={100}
              value={form.name}
              placeholder="Ej: Dr. Alejandro Martínez"
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Especialidad"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-3-3v6m-7 5h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            >
              <select
                required
                value={form.specialtyId}
                onChange={(e) =>
                  onChange({ ...form, specialtyId: e.target.value })
                }
                className="w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
              >
                <option value="">Seleccione especialidad</option>
                {specialties.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Número de Licencia Médica"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                  />
                </svg>
              }
            >
              <input
                required
                value={form.licenseNumber}
                placeholder="ID-45920-X"
                onChange={(e) =>
                  onChange({ ...form, licenseNumber: e.target.value })
                }
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
              />
            </FormField>
          </div>

          <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#133B5C] hover:bg-[#0F2E49] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              <span>Guardar Doctor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorFormCard;

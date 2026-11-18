import PageHeader from '../../shared/components/PageHeader';
import FormField from '../../shared/components/FormField';

function SpecialtyFormCard({ form, error, onChange, onSubmit, onCancel }) {
  return (
    <div>
      <PageHeader
        breadcrumb={{
          parentLabel: 'Especialidades',
          onParentClick: onCancel,
          currentLabel: 'Agregar Nueva Especialidad',
        }}
      />

      <h1 className="text-base font-bold text-[#133B5C] mt-2">
        Registrar Nueva Especialidad
      </h1>
      <p className="text-xs text-slate-600 mt-0.5 mb-5">
        Complete la información técnica y administrativa para dar de alta una
        especialidad médica en el sistema hospitalario.
      </p>

      <form
        onSubmit={onSubmit}
        className="max-w-3xl bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-5"
      >
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
            {error}
          </div>
        )}

        <FormField
          label="Nombre de la Especialidad"
          labelClassName="text-xs font-semibold text-slate-700 mb-1.5 block"
        >
          <input
            required
            minLength={3}
            maxLength={100}
            value={form.name}
            placeholder="Ej. Cardiología Intervencionista"
            onChange={(event) =>
              onChange({ ...form, name: event.target.value })
            }
            className="w-full border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          />
        </FormField>

        <FormField
          label="Descripción"
          labelClassName="text-xs font-semibold text-slate-700 mb-1.5 block"
        >
          <textarea
            required
            rows={5}
            minLength={10}
            maxLength={100}
            value={form.description}
            placeholder="Detalle el alcance de la especialidad, procedimientos principales y requisitos de derivación..."
            onChange={(event) =>
              onChange({ ...form, description: event.target.value })
            }
            className="w-full border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          />
        </FormField>

        <FormField
          label="Estado inicial"
          labelClassName="text-xs font-semibold text-slate-700 mb-1.5 block"
        >
          <select
            defaultValue="active"
            className="w-full border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
          >
            <option value="active">
              Activo - Disponible para programación
            </option>
          </select>
        </FormField>

        <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border border-[#133B5C]/50 text-[#133B5C] px-5 py-2 rounded-md text-xs font-semibold hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-[#133B5C] hover:bg-[#0F2E49] text-white px-5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition"
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
            <span>Guardar Especialidad</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default SpecialtyFormCard;

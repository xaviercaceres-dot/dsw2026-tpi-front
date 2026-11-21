import PageHeader from '../../shared/components/PageHeader';
import FormField from '../../shared/components/FormField';

const borderClass = (hasError) =>
  hasError ? 'border-red-400' : 'border-slate-200';

function SpecialtyFormCard({
  form,
  error,
  fieldErrors = {},
  isEditing = false,
  saving = false,
  onChange,
  onSubmit,
  onCancel,
}) {
  const descriptionLength = form.description.trim().length;

  return (
    <div>
      <PageHeader
        breadcrumb={{
          parentLabel: 'Especialidades',
          onParentClick: onCancel,
          currentLabel: isEditing
            ? 'Editar Especialidad'
            : 'Agregar Nueva Especialidad',
        }}
      />

      <h1 className="text-base font-bold text-[#133B5C] mt-2">
        {isEditing ? 'Editar Especialidad' : 'Registrar Nueva Especialidad'}
      </h1>
      <p className="text-xs text-slate-600 mt-0.5 mb-5">
        Complete la información técnica y administrativa para dar de alta una
        especialidad médica en el sistema hospitalario.
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        className="max-w-3xl bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5"
      >
        {error && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600"
          >
            {error}
          </div>
        )}

        <FormField
          label="Nombre de la Especialidad"
          labelClassName="text-xs font-semibold text-slate-700 mb-1.5 block"
          error={fieldErrors.name}
        >
          <input
            aria-label="Nombre de la Especialidad"
            maxLength={100}
            value={form.name}
            placeholder="Ej. Cardiología Intervencionista"
            onChange={(event) =>
              onChange({ ...form, name: event.target.value })
            }
            className={`w-full border rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C] ${borderClass(fieldErrors.name)}`}
          />
        </FormField>

        <FormField
          label="Descripción"
          labelClassName="text-xs font-semibold text-slate-700 mb-1.5 block"
          error={fieldErrors.description}
        >
          <textarea
            aria-label="Descripción"
            rows={5}
            value={form.description}
            placeholder="Detalle el alcance de la especialidad, procedimientos principales y requisitos de derivación..."
            onChange={(event) =>
              onChange({ ...form, description: event.target.value })
            }
            className={`w-full border rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C] ${borderClass(fieldErrors.description)}`}
          />
          <p
            className={`text-[11px] mt-1 text-right ${
              descriptionLength > 100 ? 'text-red-500' : 'text-slate-400'
            }`}
          >
            {descriptionLength}/100 caracteres (mínimo 10)
          </p>
        </FormField>

        <FormField
          label="Estado inicial"
          labelClassName="text-xs font-semibold text-slate-700 mb-1.5 block"
        >
          <select
            aria-label="Estado inicial"
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
            disabled={saving}
            className="bg-[#133B5C] hover:bg-[#0F2E49] text-white px-5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
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
            <span>{saving ? 'Guardando...' : 'Guardar Especialidad'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default SpecialtyFormCard;

import { useForm } from 'react-hook-form';
import PageHeader from '../../shared/components/PageHeader';
import FormField from '../../shared/components/FormField';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';

const trimmedLength = (value) => String(value ?? '').trim().length;

// Reglas de React Hook Form alineadas con las validaciones de SpecialityService (backend).
const RULES = {
  name: {
    validate: (value) =>
      (trimmedLength(value) >= 3 && trimmedLength(value) <= 100) ||
      'El nombre es obligatorio y debe tener entre 3 y 100 caracteres.',
  },
  description: {
    validate: (value) =>
      (trimmedLength(value) >= 10 && trimmedLength(value) <= 100) ||
      'La descripción es obligatoria y debe tener entre 10 y 100 caracteres.',
  },
};

function SpecialtyFormCard({
  defaultValues,
  error,
  isEditing = false,
  saving = false,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues, mode: 'onTouched' });
  const descriptionLength = trimmedLength(watch('description'));

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

      <h1 className="text-base font-bold text-med-primary-900 mt-2">
        {isEditing ? 'Editar Especialidad' : 'Registrar Nueva Especialidad'}
      </h1>
      <p className="text-xs text-slate-600 mt-0.5 mb-5">
        Complete la información técnica y administrativa para dar de alta una
        especialidad médica en el sistema hospitalario.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
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
          error={errors.name?.message}
        >
          <Input
            aria-label="Nombre de la Especialidad"
            maxLength={100}
            placeholder="Ej. Cardiología Intervencionista"
            invalid={Boolean(errors.name)}
            className="px-3.5 py-2"
            {...register('name', RULES.name)}
          />
        </FormField>

        <FormField
          label="Descripción"
          labelClassName="text-xs font-semibold text-slate-700 mb-1.5 block"
          error={errors.description?.message}
        >
          <Input
            as="textarea"
            aria-label="Descripción"
            rows={5}
            placeholder="Detalle el alcance de la especialidad, procedimientos principales y requisitos de derivación..."
            invalid={Boolean(errors.description)}
            className="px-3.5 py-2"
            {...register('description', RULES.description)}
          />
          <p
            className={`text-[11px] mt-1 text-right ${
              descriptionLength > 100 ? 'text-red-500' : 'text-slate-400'
            }`}
          >
            {descriptionLength}/100 caracteres (mínimo 10)
          </p>
        </FormField>

        <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
          <Button variant="secondary" className="text-xs" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="text-xs">
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
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SpecialtyFormCard;

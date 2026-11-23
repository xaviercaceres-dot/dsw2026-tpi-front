import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../../shared/components/PageHeader';
import FormField from '../../shared/components/FormField';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';

const trimmedLength = (value) => String(value ?? '').trim().length;

// Reglas de React Hook Form alineadas con las validaciones de DoctorService (backend).
const RULES = {
  name: {
    validate: (value) =>
      (trimmedLength(value) >= 3 && trimmedLength(value) <= 100) ||
      'El nombre es obligatorio y debe tener entre 3 y 100 caracteres.',
  },
  licenseNumber: {
    validate: {
      required: (value) =>
        trimmedLength(value) > 0 || 'El número de licencia es obligatorio.',
      maxLength: (value) =>
        trimmedLength(value) <= 50 ||
        'El número de licencia no puede superar los 50 caracteres.',
    },
  },
  specialtyId: { required: 'Seleccioná una especialidad.' },
};

function DoctorFormCard({
  defaultValues,
  specialties = [],
  error,
  isEditing = false,
  saving = false,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues, mode: 'onTouched' });

  // Las especialidades llegan de la API: al cargarse se vuelve a marcar la opción elegida.
  useEffect(() => {
    if (specialties.length > 0) {
      setValue('specialtyId', getValues('specialtyId'));
    }
  }, [specialties, setValue, getValues]);

  return (
    <div>
      <PageHeader
        breadcrumb={{
          parentLabel: 'Doctors',
          onParentClick: onCancel,
          currentLabel: isEditing ? 'Editar Doctor' : 'Agregar Nuevo Doctor',
        }}
      />

      <div className="max-w-3xl mt-4 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-8 py-5 border-b border-slate-100">
          <h1 className="text-base font-bold text-med-primary-900 flex items-center gap-2.5">
            <svg
              className="w-5 h-5 text-med-primary-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span>
              {isEditing ? 'Editar Doctor' : 'Registrar Nuevo Doctor'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete todos los campos obligatorios para integrar al nuevo
            facultativo al sistema del centro médico.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-5 sm:p-8 space-y-6"
        >
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
            >
              {error}
            </div>
          )}

          <FormField
            label="Nombre Completo del Doctor"
            error={errors.name?.message}
            icon={
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          >
            <Input
              aria-label="Nombre Completo del Doctor"
              maxLength={100}
              placeholder="Ej: Dr. Alejandro Martínez"
              invalid={Boolean(errors.name)}
              className="pl-9 pr-4 py-2.5"
              {...register('name', RULES.name)}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Especialidad"
              error={errors.specialtyId?.message}
              icon={
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
                    d="M9 12h6m-3-3v6m-7 5h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            >
              <Input
                as="select"
                aria-label="Especialidad"
                invalid={Boolean(errors.specialtyId)}
                className="pl-9 pr-8 py-2.5"
                {...register('specialtyId', RULES.specialtyId)}
              >
                <option value="">Seleccione especialidad</option>
                {specialties.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Input>
            </FormField>

            <FormField
              label="Número de Licencia Médica"
              error={errors.licenseNumber?.message}
              icon={
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
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                  />
                </svg>
              }
            >
              <Input
                aria-label="Número de Licencia Médica"
                maxLength={50}
                placeholder="ID-45920-X"
                invalid={Boolean(errors.licenseNumber)}
                className="pl-9 pr-4 py-2.5"
                {...register('licenseNumber', RULES.licenseNumber)}
              />
            </FormField>
          </div>

          <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
            <Button variant="outline" className="text-xs" onClick={onCancel}>
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
              <span>{saving ? 'Guardando...' : 'Guardar Doctor'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorFormCard;

import { Controller, useForm } from 'react-hook-form';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import FormField from '../../shared/components/FormField';
import Input from '../../shared/components/Input';
import SearchInput from '../../shared/components/SearchInput';
import StatusBadge from '../../shared/components/StatusBadge';

const labelClass = 'text-xs font-semibold text-slate-600 mb-1.5 block';
const controlClass = 'px-3 py-2 text-slate-700';

// El formulario de filtros maneja su propio estado (React Hook Form) y solo
// entrega los valores al aplicar; no conoce el estado de la página.
function AppointmentSearchFilters({
  defaultValues,
  specialties = [],
  doctors = [],
  onApply,
  onClear,
}) {
  const { control, register, handleSubmit, reset, watch } = useForm({
    defaultValues,
  });
  const values = watch();
  const query = String(values.dni ?? '').trim();
  const selectedSpecialty = specialties.find(
    (s) => String(s.id) === String(values.specialtyId)
  );
  const selectedDoctor = doctors.find(
    (d) => String(d.id) === String(values.doctorId)
  );

  const handleClear = () => {
    reset(defaultValues);
    onClear();
  };

  return (
    <Card className="p-6 mt-5">
      <h2 className="text-sm font-bold text-med-primary-900 mb-4">
        Criterios de Búsqueda
      </h2>

      <form
        onSubmit={handleSubmit(onApply)}
        noValidate
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <FormField
          label="Nombre o DNI del Paciente"
          labelClassName={labelClass}
          className="md:col-span-3"
        >
          <Controller
            name="dni"
            control={control}
            render={({ field }) => (
              <SearchInput
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Nombre o DNI, ej.: 40123456"
                className="w-full"
              />
            )}
          />
        </FormField>

        <FormField
          label="Especialidad"
          labelClassName={labelClass}
          className="md:col-span-3"
        >
          <Input
            as="select"
            aria-label="Especialidad"
            className={controlClass}
            {...register('specialtyId')}
          >
            <option value="">Todas las Especialidades</option>
            {specialties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Input>
        </FormField>

        <FormField
          label="Doctor"
          labelClassName={labelClass}
          className="md:col-span-2"
        >
          <Input
            as="select"
            aria-label="Doctor"
            className={controlClass}
            {...register('doctorId')}
          >
            <option value="">Todos los Doctores</option>
            {doctors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Input>
        </FormField>

        <FormField
          label="Fecha"
          labelClassName={labelClass}
          className="md:col-span-2"
        >
          <Input
            type="date"
            aria-label="Fecha"
            className={controlClass}
            {...register('date')}
          />
        </FormField>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full text-xs">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Aplicar Filtros</span>
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {query && (
          <StatusBadge
            status="SPECIALTY"
            label={/^\d+$/.test(query) ? `DNI: ${query}` : `Paciente: ${query}`}
          />
        )}
        {selectedSpecialty && (
          <StatusBadge
            status="SPECIALTY"
            label={`Especialidad: ${selectedSpecialty.name}`}
          />
        )}
        {selectedDoctor && (
          <StatusBadge
            status="SPECIALTY"
            label={`Doctor: ${selectedDoctor.name}`}
          />
        )}
        {values.date && (
          <StatusBadge
            status="ACTIVE_NO_DOT"
            label={`Filtro Activo: Fecha ${values.date}`}
          />
        )}
        {(query || values.specialtyId || values.doctorId) && (
          <Button
            variant="link"
            size="none"
            className="text-[11px] underline ml-1"
            onClick={handleClear}
          >
            Restablecer filtros
          </Button>
        )}
      </div>
    </Card>
  );
}

export default AppointmentSearchFilters;

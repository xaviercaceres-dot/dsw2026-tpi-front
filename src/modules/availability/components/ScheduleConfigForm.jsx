import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../shared/components/Button';
import { DAYS_OF_WEEK, getDayRangeError } from '../helpers/scheduleUtils';
import ScheduleDayRow from './ScheduleDayRow';

// Regla de React Hook Form para la hora de salida de cada día habilitado.
const endTimeRules = (day) => ({
  validate: (endTime, values) => {
    const dayValues = values[day.key];

    if (!dayValues?.enabled) return true;

    return getDayRangeError(day.label, dayValues.startTime, endTime) || true;
  },
});

function ScheduleConfigForm({
  schedule,
  loading,
  saving,
  error,
  message,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: schedule });

  // Al cambiar de médico (o después de guardar) se cargan sus horarios en el formulario.
  useEffect(() => {
    reset(schedule);
  }, [schedule, reset]);

  const onValid = (values) => {
    const hasEnabledDay = DAYS_OF_WEEK.some((day) => values[day.key]?.enabled);

    if (!hasEnabledDay) {
      setError('root', {
        message: 'Debe habilitar al menos un día de disponibilidad.',
      });

      return;
    }

    onSubmit(values);
  };

  const formError = errors.root?.message || error;

  return (
    <div className="lg:col-span-8">
      <form
        onSubmit={handleSubmit(onValid)}
        noValidate
        className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
      >
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h2 className="text-sm font-bold text-med-primary-900">
            Configuración de Horarios
          </h2>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Intervalos automáticos de 30 minutos</span>
          </div>
        </div>

        <div className="hidden sm:grid bg-med-primary-100 px-6 py-2.5 grid-cols-12 text-[11px] font-bold text-med-primary-900 uppercase">
          <div className="col-span-3">DÍA</div>
          <div className="col-span-3">ESTADO</div>
          <div className="col-span-3">ENTRADA</div>
          <div className="col-span-3">SALIDA</div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="px-6 py-8 text-center text-xs text-slate-400">
              Cargando disponibilidad actual...
            </div>
          ) : (
            DAYS_OF_WEEK.map((day) => (
              <ScheduleDayRow
                key={day.key}
                day={day}
                enabled={Boolean(watch(`${day.key}.enabled`))}
                register={register}
                rules={endTimeRules(day)}
                error={errors[day.key]?.endTime?.message}
              />
            ))
          )}
        </div>

        {formError && (
          <div
            role="alert"
            className="mx-4 sm:mx-6 my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
          >
            {formError}
          </div>
        )}
        {message && (
          <div
            role="status"
            className="mx-4 sm:mx-6 my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700"
          >
            {message}
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="secondary" className="text-xs" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving || loading}
            className="text-xs"
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
            <span>{saving ? 'Guardando...' : 'Guardar Disponibilidad'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleConfigForm;

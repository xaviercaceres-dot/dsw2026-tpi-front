import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { getApiError } from '../../shared/api/apiError';
import PageHeader from '../../shared/components/PageHeader';
import FormField from '../../shared/components/FormField';
import Button from '../../shared/components/Button';
import { EMAIL_PATTERN, PASSWORD_MIN_LENGTH } from '../helpers/validations';

// Funcionalidad adicional (no exigida por el enunciado): consume POST /api/auth/admin/register,
// que en el backend solo puede usar un ADMINISTRADOR autenticado. Por eso la ruta es privada.
const inputClass =
  'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]';

function AdminRegisterPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '', confirmation: '' } });

  const onSubmit = async ({ email, password }) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await registerAdmin(email.trim(), password);
      setSuccessMessage(
        `Administrador ${email.trim()} registrado correctamente.`
      );
      reset();
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    }
  };

  return (
    <div>
      <PageHeader
        breadcrumb={{
          parentLabel: 'Tablero',
          onParentClick: () => navigate('/admin/home'),
          currentLabel: 'Registrar Administrador',
        }}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="max-w-3xl mt-4 bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 space-y-5"
      >
        <div>
          <h1 className="text-base font-bold text-[#133B5C]">
            Registrar administrador
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            La contraseña debe tener al menos 8 caracteres, con mayúscula,
            minúscula, número y un símbolo.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
          >
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div
            role="status"
            className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700"
          >
            {successMessage}
          </div>
        )}

        <FormField label="Correo Electrónico" error={errors.email?.message}>
          <input
            type="email"
            placeholder="nuevo.admin@system.com"
            className={inputClass}
            {...register('email', {
              required: 'El correo electrónico es obligatorio',
              pattern: {
                value: EMAIL_PATTERN,
                message: 'Ingresá un correo electrónico válido',
              },
            })}
          />
        </FormField>

        <FormField label="Contraseña" error={errors.password?.message}>
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: PASSWORD_MIN_LENGTH,
                message: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
                message:
                  'Debe incluir mayúscula, minúscula, número y un símbolo',
              },
            })}
          />
        </FormField>

        <FormField
          label="Confirmar contraseña"
          error={errors.confirmation?.message}
        >
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className={inputClass}
            {...register('confirmation', {
              required: 'Confirmá la contraseña',
              validate: (value) =>
                value === getValues('password') ||
                'Las contraseñas no coinciden',
            })}
          />
        </FormField>

        <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/home')}
            className="text-xs"
          >
            Volver al tablero
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar administrador'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminRegisterPage;

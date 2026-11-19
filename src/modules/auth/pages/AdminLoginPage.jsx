import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { getApiError } from '../../shared/api/apiError';
import Button from '../../shared/components/Button';
import AuthLayout from '../components/AuthLayout';
import LoginField from '../components/LoginField';
import { LockIcon, MailIcon, ShieldIcon } from '../components/AuthIcons';
import { EMAIL_PATTERN, PASSWORD_MIN_LENGTH } from '../helpers/validations';
import { HOME_BY_ROLE, ROLES } from '../helpers/roles';

function AdminLoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { signinAdmin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onValid = async ({ email, password }) => {
    setErrorMessage('');
    try {
      await signinAdmin(email.trim(), password);
      navigate(HOME_BY_ROLE[ROLES.ADMIN]);
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Por favor, autentíquese para acceder al portal de proveedores."
      banner={
        <div className="bg-med-primary-50 border-t border-med-primary-100 p-4 sm:p-5 flex items-start gap-3">
          <span className="text-med-primary-600 shrink-0 mt-0.5">
            <ShieldIcon className="w-5 h-5" />
          </span>
          <p className="text-xs text-med-text-sub leading-relaxed">
            <strong className="text-med-text-main font-semibold">
              Solo Acceso Seguro:
            </strong>{' '}
            Este sistema es para personal médico autorizado. Los intentos de
            acceso no autorizados son registrados y monitoreados para su
            cumplimiento.
          </p>
        </div>
      }
      bottomLink={
        <Link
          to="/login"
          className="text-xs text-med-primary-200 hover:text-white transition"
        >
          ← Volver al Portal de Pacientes
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit(onValid)}
        className="flex flex-col gap-4"
        noValidate
      >
        <LoginField
          id="admin-email"
          label="Correo Electrónico"
          type="email"
          icon={<MailIcon />}
          error={errors.email?.message}
          inputProps={{
            placeholder: 'admin@system.com',
            autoComplete: 'username',
            ...register('email', {
              required: 'El correo electrónico es obligatorio',
              pattern: {
                value: EMAIL_PATTERN,
                message: 'Ingresá un correo electrónico válido',
              },
            }),
          }}
        />

        <LoginField
          id="admin-password"
          label="Contraseña"
          icon={<LockIcon />}
          canToggle
          error={errors.password?.message}
          inputProps={{
            placeholder: '••••••••',
            autoComplete: 'current-password',
            ...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: PASSWORD_MIN_LENGTH,
                message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
              },
            }),
          }}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}</span>
          {!isSubmitting && <span className="text-sm">→</span>}
        </Button>

        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center"
          >
            {errorMessage}
          </div>
        )}
      </form>
    </AuthLayout>
  );
}

export default AdminLoginPage;

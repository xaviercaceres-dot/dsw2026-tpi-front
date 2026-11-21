import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';
import { getApiError } from '../../shared/api/apiError';
import Button from '../../shared/components/Button';
import AuthLayout from '../../auth/components/AuthLayout';
import LoginField from '../../auth/components/LoginField';
import { LockIcon, MailIcon } from '../../auth/components/AuthIcons';
import { DNI_PATTERN, EMAIL_PATTERN } from '../../auth/helpers/validations';
import { HOME_BY_ROLE, ROLES } from '../../auth/helpers/roles';

// Mensajes propios del login de pacientes (el backend autentica con email + DNI).
const patientLoginMessages = {
  401: 'El email y el DNI ingresados no coinciden con los de un paciente registrado.',
  REGISTER_USER_INVALID:
    'El email ingresado pertenece a una cuenta que no es de paciente.',
};

function PatientLoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const { signinPatient } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', dni: '' } });

  const onSubmit = async ({ email, dni }) => {
    setErrorMessage('');
    try {
      // Si el paciente ingresa por primera vez, el backend lo registra automáticamente (RN06).
      await signinPatient(email.trim(), dni.trim());
      navigate(HOME_BY_ROLE[ROLES.PATIENT]);
    } catch (error) {
      setErrorMessage(getApiError(error, patientLoginMessages).message);
    }
  };

  return (
    <AuthLayout
      title="Portal del Paciente"
      subtitle="Inicia sesión para reservar y consultar tus turnos médicos"
      bottomLink={
        <Link
          to="/admin/login"
          className="text-xs text-med-primary-200 hover:text-white transition"
        >
          ¿Es personal administrativo o médico? Ingrese aquí →
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <LoginField
          id="patient-email"
          label="Correo Electrónico"
          type="email"
          icon={<MailIcon />}
          error={errors.email?.message}
          inputProps={{
            placeholder: 'paciente@medportal.com',
            autoComplete: 'email',
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
          id="patient-dni"
          label="DNI"
          icon={<LockIcon />}
          canToggle
          error={errors.dni?.message}
          inputProps={{
            placeholder: '••••••••',
            inputMode: 'numeric',
            maxLength: 8,
            autoComplete: 'off',
            ...register('dni', {
              required: 'El DNI es obligatorio',
              pattern: {
                value: DNI_PATTERN,
                message: 'El DNI debe tener 7 u 8 dígitos, sin puntos',
              },
            }),
          }}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full py-2.5 disabled:opacity-50"
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar Paciente'}
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

export default PatientLoginPage;

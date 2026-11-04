import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';
import { getApiError } from '../../shared/api/apiError';

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
      await signinPatient(email, dni);
      navigate('/');
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-med-primary-950 px-4 py-8">
      <h1 className="text-3xl font-semibold text-white mb-8">MedPortal</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-4"
      >
        <div>
          <h2 className="text-xl font-bold text-med-primary-900">
            Portal del Paciente
          </h2>
          <p className="text-xs text-med-text-sub mt-1">
            Ingresá tu email y DNI para continuar.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Email
          <input
            type="email"
            className="border rounded-lg px-3 py-2.5 text-sm"
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Ingresá un email válido',
              },
            })}
          />
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          DNI
          <input
            type="text"
            inputMode="numeric"
            className="border rounded-lg px-3 py-2.5 text-sm"
            {...register('dni', {
              required: 'El DNI es obligatorio',
              pattern: {
                value: /^\d{7,8}$/,
                message: 'El DNI debe tener 7 u 8 dígitos',
              },
            })}
          />
          {errors.dni && (
            <span className="text-red-500">{errors.dni.message}</span>
          )}
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-med-primary-900 text-white py-2.5 disabled:opacity-50"
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </form>
    </div>
  );
}

export default PatientLoginPage;

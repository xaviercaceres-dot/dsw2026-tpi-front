import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { getApiError } from '../../shared/api/apiError';

function AdminRegisterPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setErrorMessage('');
    try {
      await registerAdmin(email, password);
      navigate('/admin/login', { state: { registered: true } });
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-med-primary-950 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-4"
      >
        <h1 className="text-xl font-bold text-med-primary-900">
          Registrar administrador
        </h1>
        <input
          type="email"
          placeholder="Email"
          className="border rounded-lg px-3 py-2.5"
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
          })}
        />
        {errors.email && (
          <span className="text-red-500 text-xs">{errors.email.message}</span>
        )}
        <input
          type="password"
          placeholder="Contraseña"
          className="border rounded-lg px-3 py-2.5"
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
              message: 'Debe incluir mayúscula, minúscula y número',
            },
          })}
        />
        {errors.password && (
          <span className="text-red-500 text-xs">
            {errors.password.message}
          </span>
        )}
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className="border rounded-lg px-3 py-2.5"
          {...register('confirmation', {
            validate: (value) =>
              value === watch('password') || 'Las contraseñas no coinciden',
          })}
        />
        {errors.confirmation && (
          <span className="text-red-500 text-xs">
            {errors.confirmation.message}
          </span>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-med-primary-900 text-white rounded-lg py-2.5 disabled:opacity-50"
        >
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
        <Link to="/admin/login" className="text-sm text-med-primary-700">
          Volver al login
        </Link>
      </form>
    </div>
  );
}

export default AdminRegisterPage;

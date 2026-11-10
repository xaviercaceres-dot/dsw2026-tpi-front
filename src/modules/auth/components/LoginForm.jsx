import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import useAuth from '../hook/useAuth';
import { frontendErrorMessage } from '../helpers/backendError';

function LoginForm({ redirectPath, title }) {
  const [errorMessage, setErrorMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: '', password: '' } });

  const navigate = useNavigate();
  const location = useLocation();

  const { singin } = useAuth();
  const { singinAdmin, singinPatient } = useAuth();

  const onValid = async (formData) => {
    try {
      const isAdminRoute = location.pathname.startsWith('/admin');

      const loginFunction = isAdminRoute ? singinAdmin : singinPatient;

      const { error } = await loginFunction(
        formData.username,
        formData.password
      );

      if (error) {
        setErrorMessage(error.frontendErrorMessage);
        return;
      }

      const defaultRedirect = isAdminRoute ? '/admin/home' : '/appointments';
      navigate(redirectPath || defaultRedirect);
    } catch (error) {
      if (error?.response?.data?.errorCode) {
        setErrorMessage(frontendErrorMessage[error?.response?.data?.errorCode]);
      } else {
        setErrorMessage('Llame a soporte');
      }
    }
  };

  const formTitle =
    title ||
    (location.pathname.startsWith('/admin')
      ? 'Acceso Administración'
      : 'Acceso Pacientes');

  return (
    <form
      className="
        flex
        flex-col
        gap-6
        bg-white
        p-8
        sm:w-md
        sm:gap-4
        sm:rounded-lg
        sm:shadow-lg
      "
      onSubmit={handleSubmit(onValid)}
    >
      <h2 className="text-xl font-bold text-center text-gray-800">
        {formTitle}
      </h2>
      <Input
        label="Usuario"
        {...register('username', {
          required: 'Usuario es obligatorio',
        })}
        error={errors.username?.message}
      />
      <Input
        label="Contraseña"
        {...register('password', {
          required: 'Contraseña es obligatorio',
        })}
        type="password"
        error={errors.password?.message}
      />

      <Button type="submit">Iniciar Sesión</Button>
      <Button
        variant="secondary"
        onClick={() => alert('Debe impletar navegacion y pagina de registro')}
      >
        Registrar Usuario
      </Button>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </form>
  );
}

export default LoginForm;

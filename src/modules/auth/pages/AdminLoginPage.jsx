import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';
import { frontendErrorMessage } from '../helpers/backendError';

function AdminLoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: '', password: '' } });

  const navigate = useNavigate();
  const { singinAdmin } = useAuth();

  const onValid = async (formData) => {
    setErrorMessage('');

    try {
      const respuesta = await singinAdmin(formData.username, formData.password);

      if (respuesta.error) {
        const codigoEstado = respuesta.error.response?.status;

        if (codigoEstado === 401 || codigoEstado === 400) {
          setErrorMessage('Correo o contraseña incorrectos.');
        } else {
          setErrorMessage('Error al conectar con el servidor.');
        }
        return;
      }

      navigate('/admin/home');
    } catch (fallaAxios) {
      const codigoFalla = fallaAxios.response?.status;

      if (codigoFalla === 401 || codigoFalla === 400) {
        setErrorMessage('Correo o contraseña incorrectos.');
      } else {
        setErrorMessage('Servidor no disponible. Intente más tarde.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-med-primary-950 px-4 py-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <svg
            className="w-8 h-8 text-med-primary-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          MedPortal
        </h1>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-med-primary-900">
              Bienvenido de nuevo
            </h2>
            <p className="text-xs text-med-text-sub mt-1 leading-relaxed">
              Por favor, autentíquese para acceder al portal de proveedores.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onValid)}
            className="flex flex-col gap-4"
          >
            {/* Correo Electrónico */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-med-text-main">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-med-text-muted">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="admin@medportal.com"
                  className={`w-full border rounded-lg pl-10 pr-3.5 py-2.5 text-sm bg-white text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600 focus:border-transparent ${
                    errors.username
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-med-border'
                  }`}
                  {...register('username', {
                    required: 'El correo electrónico es obligatorio',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Ingrese un correo electrónico válido',
                    },
                  })}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-med-text-main">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-med-text-muted">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm bg-white text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600 focus:border-transparent ${
                    errors.password
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-med-border'
                  }`}
                  {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  title={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-med-text-muted hover:text-med-text-main"
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón de Submit */}
            <button
              type="submit"
              className="mt-2 w-full flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition"
            >
              <span>Iniciar Sesión</span>
              <span className="text-sm">→</span>
            </button>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
                {errorMessage}
              </div>
            )}
          </form>
        </div>

        {/* Banner Inferior Informativo */}
        <div className="bg-med-primary-50 border-t border-med-primary-100 p-4 sm:p-5 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-med-primary-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p className="text-xs text-med-text-sub leading-relaxed">
            <strong className="text-med-text-main font-semibold">
              Solo Acceso Seguro:
            </strong>{' '}
            Este sistema es para personal médico autorizado. Los intentos de
            acceso no autorizados son registrados y monitoreados para su
            cumplimiento.
          </p>
        </div>
      </div>

      {/* Switch to Patient Portal */}
      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-xs text-med-primary-200 hover:text-white transition"
        >
          ← Volver al Portal de Pacientes
        </Link>
      </div>
    </div>
  );
}

export default AdminLoginPage;

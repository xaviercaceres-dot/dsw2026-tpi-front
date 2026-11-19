import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './AuthIcons';

// Molécula: label + ícono + input + mensaje de error (debajo del campo, en rojo).
// Con canToggle el valor se oculta como una contraseña y se puede mostrar con el botón del ojo.
function LoginField({
  id,
  label,
  icon,
  type = 'text',
  error,
  canToggle = false,
  inputProps = {},
}) {
  const [visible, setVisible] = useState(false);
  const inputType = canToggle ? (visible ? 'text' : 'password') : type;
  const toggleLabel = `${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-med-text-main">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-med-text-muted">
          {icon}
        </span>
        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          className={`w-full border rounded-lg pl-10 ${
            canToggle ? 'pr-10' : 'pr-3.5'
          } py-2.5 text-sm bg-white text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600 focus:border-transparent ${
            error ? 'border-red-400 bg-red-50/20' : 'border-med-border'
          }`}
          {...inputProps}
        />
        {canToggle && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={toggleLabel}
            title={toggleLabel}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-med-text-muted hover:text-med-text-main"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export default LoginField;

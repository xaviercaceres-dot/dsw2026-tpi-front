const BASE_CLASS =
  'inline-flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed';

const VARIANT_CLASS = {
  ghost: 'text-slate-400 hover:text-med-primary-900',
  danger: 'text-red-400 hover:text-red-600',
  outline:
    'w-7 h-7 rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
  menu: 'p-1.5 rounded-lg border border-slate-200 text-slate-600',
};

// Botón solo con ícono: "label" es obligatorio porque es el nombre accesible (aria-label).
function IconButton({
  label,
  variant = 'ghost',
  type = 'button',
  className = '',
  children,
  ...restProps
}) {
  const appliedClass = [
    BASE_CLASS,
    VARIANT_CLASS[variant] ?? VARIANT_CLASS.ghost,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      title={label}
      {...restProps}
      type={type}
      aria-label={label}
      className={appliedClass}
    >
      {children}
    </button>
  );
}

export default IconButton;

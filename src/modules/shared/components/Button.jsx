const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';

// Variantes de color: el componente se extiende con props, sin modificar su código (OCP).
const VARIANT_CLASS = {
  default: 'bg-med-primary-900 hover:bg-med-primary-800 text-white shadow-sm',
  secondary:
    'border border-med-primary-900 text-med-primary-900 bg-white hover:bg-med-primary-50',
  outline: 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50',
  ghost: 'text-med-text-sub hover:bg-med-primary-50 hover:text-med-primary-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  dangerOutline:
    'border border-slate-200 text-slate-700 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200',
  link: 'text-med-primary-900 hover:underline',
};

// El tamaño define el padding; así className no compite con las clases internas.
const SIZE_CLASS = {
  none: '',
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3',
};

function Button({
  children,
  type = 'button',
  variant = 'default',
  size = 'md',
  className = '',
  ...restProps
}) {
  const appliedClass = [
    BASE_CLASS,
    VARIANT_CLASS[variant] ?? VARIANT_CLASS.default,
    SIZE_CLASS[size] ?? SIZE_CLASS.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...restProps} type={type} className={appliedClass}>
      {children}
    </button>
  );
}

export default Button;

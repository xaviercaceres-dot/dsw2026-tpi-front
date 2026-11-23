const BASE_CLASS =
  'w-full border rounded-lg text-xs text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-med-primary-900 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed';

// Átomo de entrada reutilizable: input, textarea o select (prop "as").
// Reenvía todas las props nativas, incluida la ref de register() de React Hook Form (React 19).
function Input({ as = 'input', invalid = false, className = '', ...props }) {
  const Component = as;
  const borderClass = invalid ? 'border-red-400' : 'border-slate-200';

  return (
    <Component
      aria-invalid={invalid || undefined}
      {...props}
      className={`${BASE_CLASS} ${borderClass} ${className}`.trim()}
    />
  );
}

export default Input;

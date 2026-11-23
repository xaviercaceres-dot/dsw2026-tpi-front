function FormField({
  label,
  icon,
  error,
  labelClassName = 'text-xs font-bold text-med-text-main mb-2 block',
  className = '',
  children,
}) {
  return (
    <div className={className}>
      {label && <label className={labelClassName}>{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default FormField;

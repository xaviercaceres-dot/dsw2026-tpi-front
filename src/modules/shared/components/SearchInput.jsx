function SearchInput({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  className = 'w-60',
  inputClassName = 'bg-white',
  allowClear = false,
  ...inputProps
}) {
  return (
    <div className={`relative ${className}`.trim()}>
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>
      <input
        type="text"
        aria-label={placeholder}
        {...inputProps}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`w-full border border-slate-200 rounded-lg pl-9 ${
          allowClear && value ? 'pr-7' : 'pr-4'
        } py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-med-primary-900 ${inputClassName}`.trim()}
      />
      {allowClear && value && (
        <button
          type="button"
          onClick={() => onChange && onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 text-xs"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchInput;

// Contenedor base de las tarjetas; el padding y la etiqueta se definen al usarlo.
function Card({ as = 'div', className = '', children, ...props }) {
  const Component = as;

  return (
    <Component
      {...props}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-sm ${className}`.trim()}
    >
      {children}
    </Component>
  );
}

export default Card;

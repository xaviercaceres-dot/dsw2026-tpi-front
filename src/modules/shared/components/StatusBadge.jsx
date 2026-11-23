const STATUS_CONFIG = {
  ACTIVE: {
    classes: 'bg-green-100 text-green-700',
    defaultLabel: 'Active',
    dot: true,
  },
  ACTIVO: {
    classes: 'bg-green-100 text-green-700',
    defaultLabel: 'Activo',
    dot: true,
  },
  ACTIVE_NO_DOT: {
    classes: 'bg-green-100 text-green-700',
    defaultLabel: 'Active',
    dot: false,
  },
  BOOKED: {
    classes: 'bg-green-100 text-green-700',
    defaultLabel: 'Confirmado',
    dot: true,
  },
  CONFIRMED: {
    classes: 'bg-green-100 text-green-700',
    defaultLabel: 'CONFIRMADO',
    dot: true,
  },
  PENDING: {
    classes: 'bg-amber-100 text-amber-700',
    defaultLabel: 'Pendiente',
    dot: true,
  },
  CANCELLED: {
    classes: 'bg-red-100 text-red-700',
    defaultLabel: 'Cancelado',
    dot: true,
  },
  ON_LEAVE: {
    classes: 'bg-red-100 text-red-700',
    defaultLabel: 'On Leave',
    dot: true,
  },
  ATTENDED: {
    classes: 'bg-slate-100 text-slate-600',
    defaultLabel: 'Completado',
    dot: true,
  },
  COMPLETED: {
    classes: 'bg-slate-100 text-slate-600',
    defaultLabel: 'COMPLETADO',
    dot: true,
  },
  INACTIVE: {
    classes: 'bg-slate-100 text-slate-600',
    defaultLabel: 'Inactivo',
    dot: false,
  },
  SPECIALTY: {
    classes: 'bg-med-primary-100 text-med-primary-900',
    defaultLabel: '',
    dot: false,
  },
  INFO: {
    classes: 'bg-med-primary-100 text-med-primary-900',
    defaultLabel: '',
    dot: false,
  },
};

function StatusBadge({
  status = 'ACTIVE',
  label,
  showDot,
  uppercase = false,
  className = '',
}) {
  const key = String(status).trim().toUpperCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.ACTIVE;
  const displayLabel = label ?? config.defaultLabel;
  const shouldShowDot = typeof showDot === 'boolean' ? showDot : config.dot;

  return (
    <span
      className={`${config.classes} ${
        uppercase ? 'text-[10px] uppercase' : 'text-[11px]'
      } font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 ${className}`.trim()}
    >
      {shouldShowDot && <span>•</span>}
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;

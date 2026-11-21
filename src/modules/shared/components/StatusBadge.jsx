const STATUS_CONFIG = {
  ACTIVE: {
    classes: 'bg-[#DCFCE7] text-[#15803D]',
    defaultLabel: 'Active',
    dot: true,
  },
  ACTIVO: {
    classes: 'bg-[#DCFCE7] text-[#15803D]',
    defaultLabel: 'Activo',
    dot: true,
  },
  ACTIVE_NO_DOT: {
    classes: 'bg-[#DCFCE7] text-[#15803D]',
    defaultLabel: 'Active',
    dot: false,
  },
  BOOKED: {
    classes: 'bg-[#DCFCE7] text-[#15803D]',
    defaultLabel: 'Confirmado',
    dot: true,
  },
  CONFIRMED: {
    classes: 'bg-[#DCFCE7] text-[#15803D]',
    defaultLabel: 'CONFIRMADO',
    dot: true,
  },
  PENDING: {
    classes: 'bg-[#FEF3C7] text-[#B45309]',
    defaultLabel: 'Pendiente',
    dot: true,
  },
  CANCELLED: {
    classes: 'bg-[#FEE2E2] text-[#B91C1C]',
    defaultLabel: 'Cancelado',
    dot: true,
  },
  ON_LEAVE: {
    classes: 'bg-[#FEE2E2] text-[#B91C1C]',
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
    classes: 'bg-[#E6F2FA] text-[#133B5C]',
    defaultLabel: '',
    dot: false,
  },
  INFO: {
    classes: 'bg-[#E0F2FE] text-[#133B5C]',
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

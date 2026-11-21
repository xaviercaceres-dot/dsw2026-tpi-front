const BADGE_VARIANTS = {
  success: 'bg-[#DCFCE7] text-[#15803D]',
  neutral: 'bg-slate-100 text-slate-600',
  info: 'bg-[#E0F2FE] text-[#133B5C]',
};

function MetricCard({
  icon,
  badgeText,
  badgeVariant = 'info',
  label,
  value,
  loading = false,
}) {
  const badgeClasses = BADGE_VARIANTS[badgeVariant] || BADGE_VARIANTS.info;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-[#EBF4FA] text-[#133B5C] flex items-center justify-center">
          {icon}
        </div>
        {badgeText && (
          <span
            className={`${badgeClasses} text-[11px] font-bold px-2.5 py-1 rounded-full`}
          >
            {badgeText}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 block">
          {label}
        </p>
        <p className="text-3xl font-extrabold text-[#0F2942] mt-1">
          {loading ? '...' : value}
        </p>
      </div>
    </div>
  );
}

export default MetricCard;

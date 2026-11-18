function PageHeader({ title, subtitle, breadcrumb, actions, className = '' }) {
  return (
    <div className={className}>
      {breadcrumb && (
        <div className="flex items-center gap-2 mb-2">
          <span
            onClick={breadcrumb.onParentClick}
            className="text-xs text-slate-400 cursor-pointer hover:underline"
          >
            {breadcrumb.parentLabel}
          </span>
          <span className="text-xs text-slate-400">›</span>
          <span className="text-xs font-bold text-[#133B5C]">
            {breadcrumb.currentLabel}
          </span>
        </div>
      )}

      {(title || actions) && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-[#0F2942]">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default PageHeader;

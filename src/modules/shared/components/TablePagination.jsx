function TablePagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  currentCount,
  onPageChange,
}) {
  const remaining = Math.max(0, totalItems - (currentPage - 1) * pageSize);
  const defaultCount = Math.min(pageSize, remaining);
  const shownCount =
    typeof currentCount === 'number' ? currentCount : defaultCount;

  return (
    <div className="bg-[#F8FAFC] px-6 py-3 border-t border-slate-200/80 flex justify-between items-center">
      <span className="text-xs text-slate-400">
        Mostrando {shownCount} de {totalItems} registros
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-7 h-7 border border-slate-200 bg-white rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-7 h-7 border border-slate-200 bg-white rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default TablePagination;

import IconButton from './IconButton';
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
    <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/80 flex justify-between items-center">
      <span className="text-xs text-slate-400">
        Mostrando {shownCount} de {totalItems} registros
      </span>
      <div className="flex items-center gap-1.5">
        <IconButton
          variant="outline"
          label="Página anterior"
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          ‹
        </IconButton>
        <IconButton
          variant="outline"
          label="Página siguiente"
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          ›
        </IconButton>
      </div>
    </div>
  );
}

export default TablePagination;

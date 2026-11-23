import TablePagination from './TablePagination';

function DataTableCard({
  title,
  headerActions,
  columns = [],
  loading = false,
  loadingText = 'Cargando...',
  emptyText = 'No hay registros para mostrar.',
  itemCount = 0,
  pagination,
  children,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {(title || headerActions) && (
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          {title && (
            <h2 className="text-sm font-bold text-med-primary-900">{title}</h2>
          )}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-med-bg border-y border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={`px-6 py-3.5 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={Math.max(1, columns.length)}
                  className="px-6 py-8 text-center text-xs text-slate-400"
                >
                  {loadingText}
                </td>
              </tr>
            ) : itemCount === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(1, columns.length)}
                  className="px-6 py-8 text-center text-xs text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          currentCount={itemCount}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}

export default DataTableCard;

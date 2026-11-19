import DataTableCard from '../../shared/components/DataTableCard';

// Columnas del mockup "Admin - Especialidad - Listado".
const COLUMNS = [
  { key: 'name', label: 'NOMBRE DE LA ESPECIALIDAD' },
  { key: 'description', label: 'DESCRIPCIÓN' },
  { key: 'actions', label: 'ACCIONES', align: 'right' },
];

function SpecialtiesTable({
  specialties = [],
  loading = false,
  isAdmin = false,
  pagination,
  onEdit,
  onDelete,
}) {
  return (
    <DataTableCard
      title="Registros de Especialidades"
      columns={COLUMNS}
      loading={loading}
      emptyText="No hay especialidades registradas."
      itemCount={specialties.length}
      pagination={pagination}
    >
      {specialties.map((item) => (
        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E6F2FA] text-[#133B5C] flex items-center justify-center shrink-0">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="font-bold text-[#133B5C] text-xs">
                {item.name}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 text-xs text-slate-500 max-w-md">
            {item.description}
          </td>
          <td className="px-6 py-4 text-right">
            {isAdmin && (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  title="Editar especialidad"
                  aria-label={`Editar ${item.name}`}
                  onClick={() => onEdit(item)}
                  className="text-slate-400 hover:text-[#133B5C] transition"
                >
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  title="Eliminar especialidad"
                  aria-label={`Eliminar ${item.name}`}
                  onClick={() => onDelete(item.id)}
                  className="text-red-400 hover:text-red-600 transition"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </td>
        </tr>
      ))}
    </DataTableCard>
  );
}

export default SpecialtiesTable;

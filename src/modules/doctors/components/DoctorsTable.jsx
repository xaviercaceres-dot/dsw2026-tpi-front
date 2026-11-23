import DataTableCard from '../../shared/components/DataTableCard';
import DoctorAvatar from '../../shared/components/DoctorAvatar';
import StatusBadge from '../../shared/components/StatusBadge';
import IconButton from '../../shared/components/IconButton';

const COLUMNS = [
  { key: 'name', label: 'NOMBRE DEL DOCTOR' },
  { key: 'specialty', label: 'ESPECIALIDAD' },
  { key: 'actions', label: 'ACCIONES', align: 'right' },
];

function DoctorsTable({
  doctors = [],
  loading = false,
  pagination,
  onViewAvailability,
  onEdit,
  onDelete,
}) {
  return (
    <DataTableCard
      title="Registros de Doctores"
      columns={COLUMNS}
      loading={loading}
      emptyText="No hay médicos registrados."
      itemCount={doctors.length}
      pagination={pagination}
    >
      {doctors.map((item) => (
        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3.5">
              <DoctorAvatar variant="rounded" size="md" showStatus />
              <div>
                <p className="font-bold text-med-primary-900 text-xs">
                  {item.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  ID: {item.licenseNumber || '—'}
                </p>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <StatusBadge
              status="SPECIALTY"
              label={item.specialty?.name || '—'}
            />
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-3">
              <IconButton
                label={`Ver disponibilidad de ${item.name}`}
                onClick={() => onViewAvailability(item.id)}
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </IconButton>

              <IconButton
                label={`Editar ${item.name}`}
                onClick={() => onEdit(item)}
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
              </IconButton>

              <IconButton
                variant="danger"
                label={`Eliminar ${item.name}`}
                onClick={() => onDelete(item)}
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
              </IconButton>
            </div>
          </td>
        </tr>
      ))}
    </DataTableCard>
  );
}

export default DoctorsTable;

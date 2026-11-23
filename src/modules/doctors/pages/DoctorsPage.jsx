import { useNavigate } from 'react-router-dom';
import { useDoctors } from '../hook/useDoctors';
import Button from '../../shared/components/Button';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import PageHeader from '../../shared/components/PageHeader';
import SearchInput from '../../shared/components/SearchInput';
import DoctorFormCard from '../components/DoctorFormCard';
import DoctorsTable from '../components/DoctorsTable';

function DoctorsPage() {
  const navigate = useNavigate();
  const {
    specialties,
    name,
    formDefaults,
    isEditing,
    isCreating,
    pendingDelete,
    error,
    message,
    loading,
    saving,
    deleting,
    displayedDoctors,
    pagination,
    openCreateForm,
    closeForm,
    handleEdit,
    handleSearchChange,
    handleSubmit,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useDoctors();

  if (isCreating) {
    return (
      <DoctorFormCard
        defaultValues={formDefaults}
        specialties={specialties}
        error={error}
        isEditing={isEditing}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={closeForm}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Directorio de Doctores"
        subtitle="Gestione el personal médico y supervise su disponibilidad actual."
        actions={
          <>
            <SearchInput
              value={name}
              placeholder="Buscar doctor por nombre..."
              onChange={handleSearchChange}
            />

            <Button
              className="text-xs"
              onClick={() => navigate('/admin/availability')}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Agregar Disponibilidad Horaria</span>
            </Button>

            <Button className="text-xs" onClick={openCreateForm}>
              + Nuevo Doctor
            </Button>
          </>
        }
      />

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700"
        >
          {message}
        </div>
      )}

      <DoctorsTable
        doctors={displayedDoctors}
        loading={loading}
        onViewAvailability={(id) =>
          navigate(`/admin/availability?doctorId=${id}`)
        }
        onEdit={handleEdit}
        onDelete={requestDelete}
        pagination={pagination}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar médico"
        message={`¿Confirma la baja de ${pendingDelete?.name ?? 'este médico'}? Dejará de aparecer en los listados.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default DoctorsPage;

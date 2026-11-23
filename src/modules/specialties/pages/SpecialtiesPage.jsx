import { useSpecialties } from '../hook/useSpecialties';
import Button from '../../shared/components/Button';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import PageHeader from '../../shared/components/PageHeader';
import SearchInput from '../../shared/components/SearchInput';
import SpecialtyFormCard from '../components/SpecialtyFormCard';
import SpecialtiesTable from '../components/SpecialtiesTable';

function SpecialtiesPage() {
  const {
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
    displayedSpecialties,
    pagination,
    openCreateForm,
    closeForm,
    handleEdit,
    handleSearchChange,
    handleSubmit,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useSpecialties();

  if (isCreating) {
    return (
      <SpecialtyFormCard
        defaultValues={formDefaults}
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
        title="Directorio de Especialidades"
        subtitle="Administre las categorías médicas, servicios y disponibilidad del personal especializado."
        actions={
          <>
            <SearchInput
              value={name}
              placeholder="Buscar especialidad..."
              onChange={handleSearchChange}
            />

            <Button className="text-xs" onClick={openCreateForm}>
              + Nueva Especialidad
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

      <SpecialtiesTable
        specialties={displayedSpecialties}
        loading={loading}
        onEdit={handleEdit}
        onDelete={requestDelete}
        pagination={pagination}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar especialidad"
        message={`¿Confirma la baja de ${pendingDelete?.name ?? 'esta especialidad'}? Dejará de aparecer en los listados.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default SpecialtiesPage;

import { useSpecialties } from '../hook/useSpecialties';
import Button from '../../shared/components/Button';
import PageHeader from '../../shared/components/PageHeader';
import SearchInput from '../../shared/components/SearchInput';
import SpecialtyFormCard from '../components/SpecialtyFormCard';
import SpecialtiesTable from '../components/SpecialtiesTable';

function SpecialtiesPage() {
  const {
    isAdmin,
    name,
    form,
    fieldErrors,
    isEditing,
    isCreating,
    error,
    message,
    loading,
    saving,
    displayedSpecialties,
    pagination,
    openCreateForm,
    closeForm,
    handleEdit,
    handleFormChange,
    handleSearchChange,
    handleSubmit,
    handleDelete,
  } = useSpecialties();

  if (isCreating && isAdmin) {
    return (
      <SpecialtyFormCard
        form={form}
        error={error}
        fieldErrors={fieldErrors}
        isEditing={isEditing}
        saving={saving}
        onChange={handleFormChange}
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

            {isAdmin && (
              <Button
                variant="default"
                className="text-xs font-semibold"
                onClick={openCreateForm}
              >
                + Nueva Especialidad
              </Button>
            )}
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
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={pagination}
      />
    </div>
  );
}

export default SpecialtiesPage;

import { useNavigate } from 'react-router-dom';
import { useDoctors } from '../hook/useDoctors';
import Button from '../../shared/components/Button';
import PageHeader from '../../shared/components/PageHeader';
import SearchInput from '../../shared/components/SearchInput';
import DoctorFormCard from '../components/DoctorFormCard';
import DoctorsTable from '../components/DoctorsTable';

function DoctorsPage() {
  const navigate = useNavigate();
  const {
    isAdmin,
    specialties,
    name,
    form,
    fieldErrors,
    isEditing,
    isCreating,
    error,
    message,
    loading,
    saving,
    displayedDoctors,
    pagination,
    openCreateForm,
    closeForm,
    handleEdit,
    handleFormChange,
    handleSearchChange,
    handleSubmit,
    handleDelete,
  } = useDoctors();

  if (isCreating && isAdmin) {
    return (
      <DoctorFormCard
        form={form}
        specialties={specialties}
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
        title="Directorio de Doctores"
        subtitle="Gestione el personal médico y supervise su disponibilidad actual."
        actions={
          <>
            <SearchInput
              value={name}
              placeholder="Buscar doctor por nombre..."
              onChange={handleSearchChange}
            />

            {isAdmin && (
              <>
                <Button
                  variant="default"
                  className="text-xs font-semibold flex items-center gap-2"
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

                <Button
                  variant="default"
                  className="text-xs font-semibold"
                  onClick={openCreateForm}
                >
                  + Nuevo Doctor
                </Button>
              </>
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

      <DoctorsTable
        doctors={displayedDoctors}
        loading={loading}
        isAdmin={isAdmin}
        onViewAvailability={(id) =>
          navigate(`/admin/availability?doctorId=${id}`)
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={pagination}
      />
    </div>
  );
}

export default DoctorsPage;

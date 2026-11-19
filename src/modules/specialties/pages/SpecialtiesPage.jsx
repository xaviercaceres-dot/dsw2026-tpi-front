import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
  updateSpecialty,
} from '../services/specialtiesApi';
import { getApiError } from '../../shared/api/apiError';
import useAuth from '../../auth/hook/useAuth';
import { ROLES } from '../../auth/helpers/roles';
import PageHeader from '../../shared/components/PageHeader';
import SearchInput from '../../shared/components/SearchInput';
import SpecialtyFormCard from '../components/SpecialtyFormCard';
import SpecialtiesTable from '../components/SpecialtiesTable';

const PAGE_SIZE = 10;
const initialForm = { name: '', description: '' };

// Mismas reglas que SpecialityService.Validate del backend.
function validateSpecialty(form) {
  const errors = {};
  const name = form.name.trim();
  const description = form.description.trim();

  if (name.length < 3 || name.length > 100) {
    errors.name =
      'El nombre es obligatorio y debe tener entre 3 y 100 caracteres.';
  }

  if (description.length < 10 || description.length > 100) {
    errors.description =
      'La descripción es obligatoria y debe tener entre 10 y 100 caracteres.';
  }

  return errors;
}

function SpecialtiesPage() {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const [searchParams, setSearchParams] = useSearchParams();

  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: PAGE_SIZE,
  });
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(
    () => searchParams.get('action') === 'create'
  );
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreating(true);
      setEditingId(null);
      setForm(initialForm);
      setFieldErrors({});
    }
  }, [searchParams]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const trimmedName = name.trim();
      const page = await getSpecialties({
        pageSize: PAGE_SIZE,
        pageIndex,
        ...(trimmedName.length >= 3 ? { name: trimmedName } : {}),
      });

      setResult(page);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageIndex, name]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(initialForm);
    setFieldErrors({});
    setError('');

    if (searchParams.get('action')) {
      setSearchParams({});
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setFieldErrors({});
    setError('');
    setMessage('');
    setIsCreating(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
    });
    setFieldErrors({});
    setError('');
    setMessage('');
    setIsCreating(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const errors = validateSpecialty(form);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      if (editingId) await updateSpecialty(editingId, form);
      else await createSpecialty(form);

      const successMessage = editingId
        ? 'Especialidad actualizada correctamente.'
        : 'Especialidad registrada correctamente.';

      closeForm();
      setMessage(successMessage);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSaving(false);
    }
  };

  // Baja lógica: DELETE /api/specialties/{id} (la especialidad deja de listarse).
  const remove = async (id) => {
    if (!window.confirm('¿Eliminar esta especialidad?')) return;

    setError('');
    setMessage('');
    try {
      await deleteSpecialty(id);
      setMessage('Especialidad eliminada correctamente.');
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  // El backend filtra por nombre a partir de 3 caracteres; con 1 o 2 se filtra la página actual.
  const trimmedFilter = name.trim().toLowerCase();
  const matchesFilter = (item) =>
    (item.name || '').toLowerCase().includes(trimmedFilter);
  const displayedSpecialties =
    trimmedFilter.length > 0 && trimmedFilter.length < 3
      ? result.data.filter(matchesFilter)
      : result.data;

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  if (isCreating && isAdmin) {
    return (
      <SpecialtyFormCard
        form={form}
        error={error}
        fieldErrors={fieldErrors}
        isEditing={Boolean(editingId)}
        saving={saving}
        onChange={(nextForm) => {
          setForm(nextForm);
          setFieldErrors({});
        }}
        onSubmit={submit}
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
              onChange={(value) => {
                setName(value);
                setPageIndex(1);
              }}
            />

            {isAdmin && (
              <button
                type="button"
                onClick={openCreateForm}
                className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
              >
                + Nueva Especialidad
              </button>
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
        onDelete={remove}
        pagination={{
          currentPage: result.pageIndex,
          totalPages,
          totalItems: result.total,
          pageSize: result.pageSize,
          onPageChange: setPageIndex,
        }}
      />
    </div>
  );
}

export default SpecialtiesPage;

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
import PageHeader from '../../shared/components/PageHeader';
import SearchInput from '../../shared/components/SearchInput';
import SpecialtyFormCard from '../components/SpecialtyFormCard';
import SpecialtiesTable from '../components/SpecialtiesTable';

const initialForm = { name: '', description: '' };

function SpecialtiesPage() {
  const { role } = useAuth();
  const isAdmin = role === 'Administrador';
  const [searchParams, setSearchParams] = useSearchParams();

  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
  });
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(
    () => searchParams.get('action') === 'create'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreating(true);
      setEditingId(null);
      setForm(initialForm);
    }
  }, [searchParams]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const trimmedName = name.trim();
      const data = await getSpecialties({
        pageSize: 10,
        pageIndex,
        ...(trimmedName.length >= 3 ? { name: trimmedName } : {}),
      });
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setResult({
        data: items,
        total: data?.total ?? items.length,
        pageIndex: data?.pageIndex ?? pageIndex,
        pageSize: data?.pageSize ?? 10,
      });
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
    setError('');

    if (searchParams.get('action')) {
      setSearchParams({});
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setError('');
    setIsCreating(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
    });
    setIsCreating(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (editingId) await updateSpecialty(editingId, form);
      else await createSpecialty(form);

      closeForm();
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar esta especialidad?')) return;

    try {
      await deleteSpecialty(id);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  const trimmedFilter = name.trim().toLowerCase();
  const matchesFilter = (item) =>
    (item.name || '').toLowerCase().includes(trimmedFilter) ||
    (item.description || '').toLowerCase().includes(trimmedFilter);
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
        onChange={setForm}
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
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

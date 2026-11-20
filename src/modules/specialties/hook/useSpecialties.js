import { useCallback, useEffect, useState } from 'react';
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

const PAGE_SIZE = 10;
const INITIAL_FORM = { name: '', description: '' };

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

export function useSpecialties() {
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
  const [form, setForm] = useState(INITIAL_FORM);
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
      setForm(INITIAL_FORM);
      setFieldErrors({});
    }
  }, [searchParams]);

  const load = useCallback(async () => {
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
  }, [name, pageIndex]);

  useEffect(() => {
    load();
  }, [load]);

  const closeForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setError('');

    if (searchParams.get('action')) {
      setSearchParams({});
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
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

  const handleFormChange = (nextForm) => {
    setForm(nextForm);
    setFieldErrors({});
  };

  const handleSearchChange = (value) => {
    setName(value);
    setPageIndex(1);
  };

  const handleSubmit = async (event) => {
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

  const handleDelete = async (id) => {
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

  const trimmedFilter = name.trim().toLowerCase();
  const matchesFilter = (item) =>
    (item.name || '').toLowerCase().includes(trimmedFilter);
  const displayedSpecialties =
    trimmedFilter.length > 0 && trimmedFilter.length < 3
      ? result.data.filter(matchesFilter)
      : result.data;

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return {
    isAdmin,
    name,
    form,
    fieldErrors,
    isEditing: Boolean(editingId),
    isCreating,
    error,
    message,
    loading,
    saving,
    displayedSpecialties,
    pagination: {
      currentPage: result.pageIndex,
      totalPages,
      totalItems: result.total,
      pageSize: result.pageSize,
      onPageChange: setPageIndex,
    },
    openCreateForm,
    closeForm,
    handleEdit,
    handleFormChange,
    handleSearchChange,
    handleSubmit,
    handleDelete,
  };
}

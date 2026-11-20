import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from '../services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getApiError } from '../../shared/api/apiError';
import useAuth from '../../auth/hook/useAuth';
import { ROLES } from '../../auth/helpers/roles';

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: '', licenseNumber: '', specialtyId: '' };

function validateDoctor(form) {
  const errors = {};
  const name = form.name.trim();
  const license = form.licenseNumber.trim();

  if (name.length < 3 || name.length > 100) {
    errors.name =
      'El nombre es obligatorio y debe tener entre 3 y 100 caracteres.';
  }

  if (!license) {
    errors.licenseNumber = 'El número de licencia es obligatorio.';
  } else if (license.length > 50) {
    errors.licenseNumber =
      'El número de licencia no puede superar los 50 caracteres.';
  }

  if (!String(form.specialtyId).trim()) {
    errors.specialtyId = 'Seleccioná una especialidad.';
  }

  return errors;
}

export function useDoctors() {
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const [searchParams, setSearchParams] = useSearchParams();

  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: PAGE_SIZE,
  });
  const [specialties, setSpecialties] = useState([]);
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
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
      setForm(EMPTY_FORM);
      setFieldErrors({});
    }
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const trimmedName = name.trim();
      const response = await getDoctors({
        pageSize: PAGE_SIZE,
        pageIndex,
        ...(trimmedName.length >= 3 ? { name: trimmedName } : {}),
      });

      setResult(response);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  }, [name, pageIndex]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;

    getSpecialties({ pageSize: 100, pageIndex: 1 })
      .then((page) => {
        if (isMounted) setSpecialties(page.data);
      })
      .catch((requestError) => {
        if (isMounted) setError(getApiError(requestError).message);
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  const closeForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError('');

    if (searchParams.get('action')) {
      setSearchParams({});
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError('');
    setMessage('');
    setIsCreating(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      licenseNumber: item.licenseNumber || '',
      specialtyId: item.specialty?.id ?? '',
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

    const errors = validateDoctor(form);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setSaving(true);

    try {
      if (editingId) await updateDoctor(editingId, form);
      else await createDoctor(form);

      const successMessage = editingId
        ? 'Médico actualizado correctamente.'
        : 'Médico registrado correctamente.';

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
    if (!window.confirm('¿Eliminar este médico?')) return;

    setError('');
    setMessage('');

    try {
      await deleteDoctor(id);
      setMessage('Médico eliminado correctamente.');
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  const trimmedFilter = name.trim().toLowerCase();
  const matchesFilter = (doc) =>
    (doc.name || '').toLowerCase().includes(trimmedFilter);
  const displayedDoctors =
    trimmedFilter.length > 0 && trimmedFilter.length < 3
      ? result.data.filter(matchesFilter)
      : result.data;

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return {
    isAdmin,
    specialties,
    name,
    form,
    fieldErrors,
    isEditing: Boolean(editingId),
    isCreating,
    error,
    message,
    loading,
    saving,
    displayedDoctors,
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

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getApiError } from '../api/apiError';
import { useDebouncedValue } from './useDebouncedValue';

// Lógica común de un listado administrable (médicos, especialidades): listado paginado
// con búsqueda por nombre, alta/edición con formulario y baja con confirmación.
// Las funciones del servicio y toFormValues deben ser estables (definidas fuera del componente).
export function useCrudList({
  fetchPage,
  createItem,
  updateItem,
  deleteItem,
  toFormValues,
  emptyForm,
  messages,
  pageSize = 10,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize,
  });
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(
    () => searchParams.get('action') === 'create'
  );
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Se consulta al backend cuando el usuario deja de escribir, no en cada tecla.
  const debouncedName = useDebouncedValue(name.trim());
  const latestRequestId = useRef(0);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreating(true);
      setEditingItem(null);
    }
  }, [searchParams]);

  // Solo se aplica la respuesta del último pedido: una respuesta vieja no pisa a la nueva.
  const load = useCallback(async () => {
    const requestId = ++latestRequestId.current;

    setLoading(true);
    setError('');

    try {
      const page = await fetchPage({
        pageSize,
        pageIndex,
        name: debouncedName,
      });

      if (requestId === latestRequestId.current) setResult(page);
    } catch (requestError) {
      if (requestId === latestRequestId.current) {
        setError(getApiError(requestError).message);
      }
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, [fetchPage, pageSize, pageIndex, debouncedName]);

  useEffect(() => {
    load();

    return () => {
      latestRequestId.current += 1;
    };
  }, [load]);

  const closeForm = () => {
    setIsCreating(false);
    setEditingItem(null);
    setError('');

    if (searchParams.get('action')) {
      setSearchParams({});
    }
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setError('');
    setMessage('');
    setIsCreating(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setError('');
    setMessage('');
    setIsCreating(true);
  };

  const handleSearchChange = (value) => {
    setName(value);
    setPageIndex(1);
  };

  // Recibe los valores ya validados por React Hook Form.
  const handleSubmit = async (values) => {
    setError('');
    setSaving(true);

    try {
      if (editingItem) await updateItem(editingItem.id, values);
      else await createItem(values);

      const successMessage = editingItem ? messages.updated : messages.created;

      closeForm();
      setMessage(successMessage);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (item) => {
    setError('');
    setMessage('');
    setPendingDelete(item);
  };

  const cancelDelete = () => setPendingDelete(null);

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      await deleteItem(pendingDelete.id);
      setMessage(messages.deleted);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  // Mientras se escribe (o con 1-2 letras, que el backend no acepta) se filtra la página actual.
  const trimmedFilter = name.trim().toLowerCase();
  const filterLocally =
    trimmedFilter.length > 0 &&
    (trimmedFilter.length < 3 || trimmedFilter !== debouncedName.toLowerCase());
  const matchesFilter = (item) =>
    (item.name || '').toLowerCase().includes(trimmedFilter);
  const items = filterLocally ? result.data.filter(matchesFilter) : result.data;

  return {
    name,
    formDefaults: editingItem ? toFormValues(editingItem) : emptyForm,
    isEditing: Boolean(editingItem),
    isCreating,
    pendingDelete,
    error,
    setError,
    message,
    loading,
    saving,
    deleting,
    items,
    pagination: {
      currentPage: result.pageIndex,
      totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
      totalItems: result.total,
      pageSize: result.pageSize,
      onPageChange: setPageIndex,
    },
    openCreateForm,
    closeForm,
    handleEdit,
    handleSearchChange,
    handleSubmit,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}

export default useCrudList;

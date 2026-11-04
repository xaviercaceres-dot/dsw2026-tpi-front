import { useEffect, useState } from 'react';
import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
  updateSpecialty,
} from '../services/specialtiesApi';
import { getApiError } from '../../shared/api/apiError';
import useAuth from '../../auth/hook/useAuth';
import TablePagination from '../../shared/components/TablePagination';

const initialForm = { name: '', description: '' };

function SpecialtiesPage() {
  const { role } = useAuth();
  const isAdmin = role === 'Administrador';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSpecialties({
        pageSize: 10,
        pageIndex,
        ...(name.length >= 3 ? { name } : {}),
      });

      setResult(data);
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageIndex, name]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) await updateSpecialty(editingId, form);
      else await createSpecialty(form);

      setForm(initialForm);
      setEditingId(null);
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-text-main">
          Especialidades
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Listado real de especialidades activas.
        </p>
      </div>
      {isAdmin && (
        <form
          onSubmit={submit}
          className="bg-white rounded-lg border p-4 grid gap-3 md:grid-cols-3"
        >
          <input
            required
            minLength={3}
            maxLength={100}
            value={form.name}
            placeholder="Nombre"
            className="border rounded px-3 py-2"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            required
            minLength={10}
            maxLength={100}
            value={form.description}
            placeholder="Descripción"
            className="border rounded px-3 py-2"
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
          <div className="flex gap-2">
            <button
              className="bg-med-primary-900 text-white rounded px-4 py-2"
              type="submit"
            >
              {editingId ? 'Guardar' : 'Crear'}
            </button>
            {editingId && (
              <button
                type="button"
                className="border rounded px-4 py-2"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
      <div className="flex gap-2">
        <input
          value={name}
          placeholder="Buscar por nombre (mínimo 3 caracteres)"
          className="border rounded px-3 py-2 flex-1"
          onChange={(event) => {
            setName(event.target.value);
            setPageIndex(1);
          }}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : result.data.length === 0 ? (
        <p>No hay especialidades.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Descripción</th>
                {isAdmin && <th className="p-4">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {result.data.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.description}</td>
                  {isAdmin && (
                    <td className="p-4 flex gap-2">
                      <button
                        className="text-blue-700"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({
                            name: item.name,
                            description: item.description,
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="text-red-700"
                        onClick={() => remove(item.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={result.pageIndex}
            totalPages={Math.max(1, Math.ceil(result.total / result.pageSize))}
            totalItems={result.total}
            pageSize={result.pageSize}
            onPageChange={setPageIndex}
          />
        </div>
      )}
    </div>
  );
}

export default SpecialtiesPage;

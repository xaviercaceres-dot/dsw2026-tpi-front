import { useEffect, useState } from 'react';
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from '../services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getApiError } from '../../shared/api/apiError';
import useAuth from '../../auth/hook/useAuth';
import TablePagination from '../../shared/components/TablePagination';

const emptyForm = { name: '', licenseNumber: '', specialtyId: '' };

function DoctorsPage() {
  const { role } = useAuth();
  const isAdmin = role === 'Administrador';
  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
  });
  const [specialties, setSpecialties] = useState([]);
  const [name, setName] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setResult(
        await getDoctors({
          pageSize: 10,
          pageIndex,
          ...(name.length >= 3 ? { name } : {}),
        })
      );
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageIndex, name]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAdmin)
      getSpecialties({ pageSize: 100, pageIndex: 1 })
        .then((data) => setSpecialties(data.data || []))
        .catch((requestError) => setError(getApiError(requestError).message));
  }, [isAdmin]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) await updateDoctor(editingId, form);
      else await createDoctor(form);

      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este médico?')) return;

    try {
      await deleteDoctor(id);
      await load();
    } catch (requestError) {
      setError(getApiError(requestError).message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-text-main">
          Médicos
        </h1>
        <p className="text-sm text-med-text-sub mt-1">Profesionales activos.</p>
      </div>
      {isAdmin && (
        <form
          onSubmit={submit}
          className="bg-white rounded-lg border p-4 grid gap-3 md:grid-cols-4"
        >
          <input
            required
            minLength={3}
            maxLength={100}
            value={form.name}
            placeholder="Nombre"
            className="border rounded px-3 py-2"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            value={form.licenseNumber}
            placeholder="Matrícula"
            className="border rounded px-3 py-2"
            onChange={(e) =>
              setForm({ ...form, licenseNumber: e.target.value })
            }
          />
          <select
            required
            value={form.specialtyId}
            className="border rounded px-3 py-2"
            onChange={(e) => setForm({ ...form, specialtyId: e.target.value })}
          >
            <option value="">Especialidad</option>
            {specialties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-med-primary-900 text-white rounded px-4 py-2"
            >
              {editingId ? 'Guardar' : 'Crear'}
            </button>
            {editingId && (
              <button
                type="button"
                className="border rounded px-4"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
      <input
        value={name}
        placeholder="Buscar por nombre (mínimo 3 caracteres)"
        className="border rounded px-3 py-2"
        onChange={(e) => {
          setName(e.target.value);
          setPageIndex(1);
        }}
      />
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : result.data.length === 0 ? (
        <p>No hay médicos.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Matrícula</th>
                <th className="p-4">Especialidad</th>
                {isAdmin && <th className="p-4">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {result.data.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.licenseNumber}</td>
                  <td className="p-4">{item.specialty?.name || '—'}</td>
                  {isAdmin && (
                    <td className="p-4 flex gap-2">
                      <button
                        className="text-blue-700"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({
                            name: item.name,
                            licenseNumber: item.licenseNumber,
                            specialtyId: item.specialty?.id || '',
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

export default DoctorsPage;

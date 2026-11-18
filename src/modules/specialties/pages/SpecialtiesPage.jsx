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
      <div>
        {/* 1. Breadcrumb superior */}
        <div className="flex items-center gap-2">
          <span
            onClick={closeForm}
            className="text-xs text-slate-400 cursor-pointer hover:underline"
          >
            Especialidades
          </span>
          <span className="text-xs text-slate-400">›</span>
          <span className="text-xs font-bold text-[#133B5C]">
            Agregar Nueva Especialidad
          </span>
        </div>

        {/* 2. Título debajo del breadcrumb */}
        <h1 className="text-base font-bold text-[#133B5C] mt-2">
          Registrar Nueva Especialidad
        </h1>
        <p className="text-xs text-slate-600 mt-0.5 mb-5">
          Complete la información técnica y administrativa para dar de alta una
          especialidad médica en el sistema hospitalario.
        </p>

        {/* 3. Tarjeta del Formulario */}
        <form
          onSubmit={submit}
          className="max-w-3xl bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-5"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Campo 1 */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Nombre de la Especialidad
            </label>
            <input
              required
              minLength={3}
              maxLength={100}
              value={form.name}
              placeholder="Ej. Cardiología Intervencionista"
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              className="w-full border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            />
          </div>

          {/* Campo 2 */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Descripción
            </label>
            <textarea
              required
              rows={5}
              minLength={10}
              maxLength={100}
              value={form.description}
              placeholder="Detalle el alcance de la especialidad, procedimientos principales y requisitos de derivación..."
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="w-full border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            />
          </div>

          {/* Campo 3 */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Estado inicial
            </label>
            <select
              defaultValue="active"
              className="w-full border border-slate-200 rounded-md px-3.5 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            >
              <option value="active">
                Activo - Disponible para programación
              </option>
            </select>
          </div>

          {/* Pie del formulario */}
          <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="border border-[#133B5C]/50 text-[#133B5C] px-5 py-2 rounded-md text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-[#133B5C] hover:bg-[#0F2E49] text-white px-5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              <span>Guardar Especialidad</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Encabezado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2942]">
            Directorio de Especialidades
          </h1>
          <p className="text-sm text-slate-500">
            Administre las categorías médicas, servicios y disponibilidad del
            personal especializado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Buscador con lupa */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={name}
              placeholder="Buscar especialidad..."
              onChange={(event) => {
                setName(event.target.value);
                setPageIndex(1);
              }}
              className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs w-60 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openCreateForm}
              className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
            >
              + Nueva Especialidad
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {/* 2. Tarjeta de Tabla Registros de Especialidades */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-sm font-bold text-[#133B5C]">
            Registros de Especialidades
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F4F8FB] border-y border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">NOMBRE DE LA ESPECIALIDAD</th>
                <th className="px-6 py-3.5">DESCRIPCIÓN</th>
                <th className="px-6 py-3.5">ESTADO</th>
                <th className="px-6 py-3.5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-xs text-slate-400"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : displayedSpecialties.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-xs text-slate-400"
                  >
                    No hay especialidades registradas.
                  </td>
                </tr>
              ) : (
                displayedSpecialties.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#E6F2FA] text-[#133B5C] flex items-center justify-center shrink-0">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </div>
                        <span className="font-bold text-[#133B5C] text-xs">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-md">
                      {item.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-3 py-1 rounded-full inline-block">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            title="Editar especialidad"
                            onClick={() => {
                              setEditingId(item.id);
                              setForm({
                                name: item.name,
                                description: item.description,
                              });
                              setIsCreating(true);
                            }}
                            className="text-slate-400 hover:text-[#133B5C] transition"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            title="Eliminar especialidad"
                            onClick={() => remove(item.id)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla */}
        <div className="bg-[#F8FAFC] px-6 py-3 border-t border-slate-200/80 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Mostrando {displayedSpecialties.length} de {result.total} registros
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={result.pageIndex <= 1}
              onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
              className="w-7 h-7 border border-slate-200 bg-white rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={result.pageIndex >= totalPages}
              onClick={() =>
                setPageIndex((prev) => Math.min(totalPages, prev + 1))
              }
              className="w-7 h-7 border border-slate-200 bg-white rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpecialtiesPage;

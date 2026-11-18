import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from '../services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getApiError } from '../../shared/api/apiError';
import useAuth from '../../auth/hook/useAuth';

const emptyForm = { name: '', licenseNumber: '', specialtyId: '' };

function DoctorsPage() {
  const { role } = useAuth();
  const isAdmin = role === 'Administrador';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [isCreating, setIsCreating] = useState(
    () => searchParams.get('action') === 'create'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreating(true);
      setEditingId(null);
      setForm(emptyForm);
    }
  }, [searchParams]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const trimmedName = name.trim();
      const response = await getDoctors({
        pageSize: 10,
        pageIndex,
        ...(trimmedName.length >= 3 ? { name: trimmedName } : {}),
      });
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setResult({
        data: items,
        total: response?.total ?? items.length,
        pageIndex: response?.pageIndex ?? pageIndex,
        pageSize: response?.pageSize ?? 10,
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

  useEffect(() => {
    if (isAdmin) {
      getSpecialties({ pageSize: 100, pageIndex: 1 })
        .then((data) =>
          setSpecialties(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.data)
                ? data.data
                : []
          )
        )
        .catch((requestError) => setError(getApiError(requestError).message));
    }
  }, [isAdmin]);

  const closeForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');

    if (searchParams.get('action')) {
      setSearchParams({});
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setIsCreating(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const trimmedName = form.name.trim();
    const trimmedLicense = form.licenseNumber.trim();

    if (
      trimmedName.length < 3 ||
      !trimmedLicense ||
      !String(form.specialtyId).trim()
    ) {
      setError(
        'Completá nombre (mín. 3 caracteres), matrícula y especialidad.'
      );

      return;
    }

    try {
      const payload = {
        name: trimmedName,
        licenseNumber: trimmedLicense,
        license_number: trimmedLicense,
        specialtyId: form.specialtyId,
      };

      if (editingId) await updateDoctor(editingId, payload);
      else await createDoctor(payload);

      closeForm();
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

  const trimmedFilter = name.trim().toLowerCase();
  const matchesFilter = (doc) =>
    (doc.name || '').toLowerCase().includes(trimmedFilter);
  const displayedDoctors =
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
            Doctors
          </span>
          <span className="text-xs text-slate-400">›</span>
          <span className="text-xs font-bold text-[#133B5C]">
            Agregar Nuevo Doctor
          </span>
        </div>

        {/* 2. Tarjeta del Formulario */}
        <div className="max-w-3xl mt-4 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Cabecera de la tarjeta */}
          <div className="px-8 py-5 border-b border-slate-100">
            <h1 className="text-base font-bold text-[#133B5C] flex items-center gap-2.5">
              <svg
                className="w-5 h-5 text-[#133B5C]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>Registrar Nuevo Doctor</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete todos los campos obligatorios para integrar al nuevo
              facultativo al sistema del centro médico.
            </p>
          </div>

          {/* Cuerpo del formulario */}
          <form onSubmit={submit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Campo 1 (Ancho completo) */}
            <div>
              <label className="text-xs font-bold text-[#0F2942] mb-2 block">
                Nombre Completo del Doctor
              </label>
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  required
                  minLength={3}
                  maxLength={100}
                  value={form.name}
                  placeholder="Ej: Dr. Alejandro Martínez"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
                />
              </div>
            </div>

            {/* Fila 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna 1: Especialidad */}
              <div>
                <label className="text-xs font-bold text-[#0F2942] mb-2 block">
                  Especialidad
                </label>
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
                        d="M9 12h6m-3-3v6m-7 5h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <select
                    required
                    value={form.specialtyId}
                    onChange={(e) =>
                      setForm({ ...form, specialtyId: e.target.value })
                    }
                    className="w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
                  >
                    <option value="">Seleccione especialidad</option>
                    {specialties.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Columna 2: Número de Licencia Médica */}
              <div>
                <label className="text-xs font-bold text-[#0F2942] mb-2 block">
                  Número de Licencia Médica
                </label>
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
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"
                      />
                    </svg>
                  </span>
                  <input
                    required
                    value={form.licenseNumber}
                    placeholder="ID-45920-X"
                    onChange={(e) =>
                      setForm({ ...form, licenseNumber: e.target.value })
                    }
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
                  />
                </div>
              </div>
            </div>

            {/* Pie del formulario */}
            <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[#133B5C] hover:bg-[#0F2E49] text-white px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
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
                <span>Guardar Doctor</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Encabezado Superior */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2942]">
            Directorio de Doctores
          </h1>
          <p className="text-sm text-slate-500">
            Gestione el personal médico y supervise su disponibilidad actual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Input buscador con lupa */}
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
              placeholder="Buscar doctor por nombre..."
              onChange={(e) => {
                setName(e.target.value);
                setPageIndex(1);
              }}
              className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs w-60 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            />
          </div>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => navigate('/admin/availability')}
                className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition"
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Agregar Disponibilidad Horaria</span>
              </button>

              <button
                type="button"
                onClick={openCreateForm}
                className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
              >
                + Nuevo Doctor
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {/* 2. Tarjeta de Tabla Registros de Doctores */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-sm font-bold text-[#133B5C]">
            Registros de Doctores
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F4F8FB] border-y border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">NOMBRE DEL DOCTOR</th>
                <th className="px-6 py-3.5">ESPECIALIDAD</th>
                <th className="px-6 py-3.5">ESTADO DE DISPONIBILIDAD</th>
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
              ) : displayedDoctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-xs text-slate-400"
                  >
                    No hay médicos registrados.
                  </td>
                </tr>
              ) : (
                displayedDoctors.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#E6F2FA] text-[#133B5C] flex items-center justify-center relative shrink-0 text-base">
                          <span>👨‍⚕️</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#133B5C] text-xs">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ID:{' '}
                            {item.licenseNumber || item.license_number || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#E6F2FA] text-[#133B5C] text-[11px] font-bold px-3 py-1 rounded-full inline-block">
                        {item.specialty?.name || item.specialty || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                        <span>•</span>
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          title="Ver disponibilidad"
                          onClick={() =>
                            navigate(`/admin/availability?doctorId=${item.id}`)
                          }
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              title="Editar doctor"
                              onClick={() => {
                                setEditingId(item.id);
                                setForm({
                                  name: item.name,
                                  licenseNumber:
                                    item.licenseNumber ||
                                    item.license_number ||
                                    '',
                                  specialtyId:
                                    item.specialty?.id ??
                                    item.specialtyId ??
                                    '',
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
                              title="Eliminar doctor"
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
                          </>
                        )}
                      </div>
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
            Mostrando {displayedDoctors.length} de {result.total} registros
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

export default DoctorsPage;

import { useEffect, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import {
  getAppointmentsByDate,
  searchAppointments,
} from '../services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';

const SHORT_MONTHS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

function getTodayString() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '—';

  const clean = String(dateStr).substring(0, 10);
  const parts = clean.split('-').map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) return clean;

  const [year, month, day] = parts;
  const monthLabel = SHORT_MONTHS[month - 1] || '';

  return `${String(day).padStart(2, '0')} ${monthLabel}, ${year}`;
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return 'Turno programado';

  const clean = String(timeStr).substring(0, 5);
  const [hStr, mStr] = clean.split(':');
  const h = Number(hStr);

  if (Number.isNaN(h)) return clean;

  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;

  return `${String(hour12).padStart(2, '0')}:${mStr || '00'} ${suffix}`;
}

function matchesLocalQuery(item, query) {
  if (!query) return true;

  const q = query.toLowerCase();
  const dniStr = String(item.patient?.dni ?? item.patientDni ?? '');
  const emailStr = String(item.patient?.email ?? '').toLowerCase();
  const fullNameStr = String(
    item.patient?.fullName ?? item.patientName ?? ''
  ).toLowerCase();
  const doctorNameStr = String(
    item.doctor?.name ?? item.doctorName ?? ''
  ).toLowerCase();

  return (
    dniStr.includes(query) ||
    emailStr.includes(q) ||
    fullNameStr.includes(q) ||
    doctorNameStr.includes(q)
  );
}

function AppointmentsSearchPage() {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState(() => ({
    specialtyId: '',
    doctorId: '',
    dni: '',
    date: getTodayString(),
  }));
  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const executeSearch = async (activeFilters, pageIndex = 1) => {
    const trimmedQuery = String(activeFilters.dni ?? '').trim();
    const isValidDni = /^\d{7,8}$/.test(trimmedQuery);
    const hasDate = Boolean(
      activeFilters.date && String(activeFilters.date).trim()
    );
    const hasSpecialty = Boolean(
      activeFilters.specialtyId && String(activeFilters.specialtyId).trim()
    );
    const hasDoctor = Boolean(
      activeFilters.doctorId && String(activeFilters.doctorId).trim()
    );
    const hasBackendFilter = hasDate || hasSpecialty || hasDoctor || isValidDni;

    if (!hasBackendFilter) {
      setError(
        'Para buscar en el servidor debes seleccionar al menos una Fecha, Especialidad, Médico o ingresar un DNI válido de 7 u 8 dígitos.'
      );
      setResult({ data: [], total: 0, pageIndex: 1, pageSize: 10 });

      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;

      if (hasDate && !hasSpecialty && !hasDoctor && !isValidDni) {
        response = await getAppointmentsByDate({
          date: String(activeFilters.date).trim(),
          pageSize: 10,
          pageIndex,
        });
      } else {
        const params = {
          pageSize: 10,
          pageIndex,
          ...(hasSpecialty
            ? { specialtyId: String(activeFilters.specialtyId).trim() }
            : {}),
          ...(hasDoctor
            ? { doctorId: String(activeFilters.doctorId).trim() }
            : {}),
          ...(isValidDni ? { dni: Number(trimmedQuery) } : {}),
          ...(hasDate ? { date: String(activeFilters.date).trim() } : {}),
        };

        response = await searchAppointments(params);
      }

      const rawItems = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const filteredItems =
        trimmedQuery && !isValidDni
          ? rawItems.filter((item) => matchesLocalQuery(item, trimmedQuery))
          : rawItems;

      setResult({
        data: filteredItems,
        total:
          trimmedQuery && !isValidDni
            ? filteredItems.length
            : (response?.total ?? filteredItems.length),
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
    Promise.all([
      getSpecialties({ pageSize: 100, pageIndex: 1 }),
      getDoctors({ pageSize: 100, pageIndex: 1 }),
    ])
      .then(([specialtyData, doctorData]) => {
        setSpecialties(
          Array.isArray(specialtyData)
            ? specialtyData
            : Array.isArray(specialtyData?.data)
              ? specialtyData.data
              : []
        );
        setDoctors(
          Array.isArray(doctorData)
            ? doctorData
            : Array.isArray(doctorData?.data)
              ? doctorData.data
              : []
        );
      })
      .catch((requestError) => setError(getApiError(requestError).message));

    const initialFilters = {
      specialtyId: '',
      doctorId: '',
      dni: '',
      date: getTodayString(),
    };

    executeSearch(initialFilters, 1);
  }, []);

  const search = (pageIndex = 1) => {
    executeSearch(filters, pageIndex);
  };

  const handleClear = () => {
    const resetFilters = {
      specialtyId: '',
      doctorId: '',
      dni: '',
      date: getTodayString(),
    };

    setFilters(resetFilters);
    executeSearch(resetFilters, 1);
  };

  const selectedSpecialtyObj = specialties.find(
    (s) => String(s.id) === String(filters.specialtyId)
  );
  const selectedDoctorObj = doctors.find(
    (d) => String(d.id) === String(filters.doctorId)
  );
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div>
      {/* 1. Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F2942]">
          Búsqueda y Filtrado de Citas
        </h1>
        <p className="text-sm text-slate-500">
          Gestione y supervise el flujo de pacientes del departamento.
        </p>
      </div>

      {/* 2. Tarjeta 1: Criterios de Búsqueda */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm mt-5">
        {/* Fila superior */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-[#133B5C]">
            Criterios de Búsqueda
          </h2>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Última actualización: hace un momento</span>
          </div>
        </div>

        {/* Fila de Controles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Col 1: Nombre o DNI del Paciente */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Nombre o DNI del Paciente
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={filters.dni}
                placeholder="Johnathan Doe"
                onChange={(e) =>
                  setFilters({ ...filters, dni: e.target.value })
                }
                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
              />
            </div>
          </div>

          {/* Col 2: Especialidad */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Especialidad
            </label>
            <select
              value={filters.specialtyId}
              onChange={(e) =>
                setFilters({ ...filters, specialtyId: e.target.value })
              }
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            >
              <option value="">Todas las Especialidades</option>
              {specialties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Col 3: Doctor */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Doctor
            </label>
            <select
              value={filters.doctorId}
              onChange={(e) =>
                setFilters({ ...filters, doctorId: e.target.value })
              }
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            >
              <option value="">Todos los Doctores</option>
              {doctors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Col 4: Fecha */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Fecha
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            />
          </div>

          {/* Col 5: Botón Aplicar Filtros */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => search(1)}
              className="w-full bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Aplicar Filtros</span>
            </button>
          </div>
        </div>

        {/* Fila de Píldoras de Filtros Activos */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {filters.dni.trim() && (
            <span className="bg-[#E6F2FA] text-[#133B5C] text-[11px] font-semibold px-3 py-1 rounded-full">
              {/^\d+$/.test(filters.dni.trim())
                ? `DNI: ${filters.dni.trim()}`
                : `Paciente: ${filters.dni.trim()}`}
            </span>
          )}
          {selectedSpecialtyObj && (
            <span className="bg-[#E6F2FA] text-[#133B5C] text-[11px] font-semibold px-3 py-1 rounded-full">
              Especialidad: {selectedSpecialtyObj.name}
            </span>
          )}
          {selectedDoctorObj && (
            <span className="bg-[#E6F2FA] text-[#133B5C] text-[11px] font-semibold px-3 py-1 rounded-full">
              Doctor: {selectedDoctorObj.name}
            </span>
          )}
          {filters.date && (
            <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold px-3 py-1 rounded-full">
              Filtro Activo: Fecha {filters.date}
            </span>
          )}
          {(filters.dni || filters.specialtyId || filters.doctorId) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-slate-400 hover:text-[#133B5C] underline ml-1"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      {/* 3. Tarjeta 2: Registros de Citas */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm mt-6 overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-sm font-bold text-[#133B5C]">
            Registros de Citas
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F4F8FB] border-y border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">FECHA</th>
                <th className="px-6 py-3.5">DEPARTAMENTO</th>
                <th className="px-6 py-3.5">PACIENTE</th>
                <th className="px-6 py-3.5">ESTADO</th>
                <th className="px-6 py-3.5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-xs text-slate-400"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : result.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-xs text-slate-400"
                  >
                    No hay resultados para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                result.data.map((item, index) => {
                  const rawStatus = String(
                    item.appointmentsStatus || item.status || 'BOOKED'
                  ).toUpperCase();
                  const dateToFormat =
                    item.date || filters.date || getTodayString();
                  const specialtyName =
                    item.doctor?.specialty?.name ||
                    item.specialty ||
                    item.speciality ||
                    'Medicina General';
                  const doctorName =
                    item.doctor?.name || item.doctorName || '—';
                  const patientLabel =
                    item.patient?.fullName ||
                    item.patient?.email ||
                    item.patientName ||
                    'Paciente';
                  const patientDni =
                    item.patient?.dni ?? item.patientDni ?? '—';

                  return (
                    <tr
                      key={item.appointmentsId || item.id || index}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* FECHA */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#133B5C] text-xs">
                          {formatDisplayDate(dateToFormat)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatDisplayTime(item.startTime)}
                        </p>
                      </td>

                      {/* DEPARTAMENTO */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#E6F2FA] text-[#133B5C] flex items-center justify-center shrink-0">
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
                          <div>
                            <p className="font-bold text-[#133B5C] text-xs">
                              {specialtyName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {doctorName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PACIENTE */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700 text-xs">
                          {patientLabel}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          DNI: {patientDni}
                        </p>
                      </td>

                      {/* ESTADO */}
                      <td className="px-6 py-4">
                        {rawStatus === 'ATTENDED' ? (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                            • COMPLETADO
                          </span>
                        ) : rawStatus === 'CANCELLED' ? (
                          <span className="bg-[#FEE2E2] text-[#B91C1C] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                            • CANCELADO
                          </span>
                        ) : (
                          <span className="bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                            • CONFIRMADO
                          </span>
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-[#133B5C] font-bold text-xs cursor-pointer hover:underline">
                          Ver Detalle
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla */}
        <div className="bg-[#F8FAFC] px-6 py-3 border-t border-slate-200/80 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Mostrando {result.data.length} de {result.total} registros
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={result.pageIndex <= 1}
              onClick={() => search(Math.max(1, result.pageIndex - 1))}
              className="w-7 h-7 border border-slate-200 bg-white rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={result.pageIndex >= totalPages}
              onClick={() => search(Math.min(totalPages, result.pageIndex + 1))}
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

export default AppointmentsSearchPage;

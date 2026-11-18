import { useEffect, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import {
  getAppointmentsByDate,
  searchAppointments,
} from '../services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import TablePagination from '../../shared/components/TablePagination';

function getTodayString() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function matchesLocalQuery(item, query) {
  if (!query) return true;

  const q = query.toLowerCase();
  const dniStr = String(item.patient?.dni ?? '');
  const emailStr = String(item.patient?.email ?? '').toLowerCase();
  const fullNameStr = String(item.patient?.fullName ?? '').toLowerCase();
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-text-main">
          Búsqueda de turnos
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Los filtros se combinan con lógica AND.
        </p>
      </div>
      <div className="bg-white rounded-lg border p-5 grid gap-3 md:grid-cols-5">
        <select
          value={filters.specialtyId}
          className="border rounded px-2 py-2"
          onChange={(e) =>
            setFilters({ ...filters, specialtyId: e.target.value })
          }
        >
          <option value="">Especialidad</option>
          {specialties.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={filters.doctorId}
          className="border rounded px-2 py-2"
          onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}
        >
          <option value="">Médico</option>
          {doctors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          value={filters.dni}
          inputMode="numeric"
          placeholder="DNI o búsqueda"
          className="border rounded px-2 py-2"
          onChange={(e) => setFilters({ ...filters, dni: e.target.value })}
        />
        <input
          type="date"
          value={filters.date}
          className="border rounded px-2 py-2"
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-med-primary-900 text-white rounded px-3"
            onClick={() => search(1)}
          >
            Buscar
          </button>
          <button
            type="button"
            className="border rounded px-3"
            onClick={handleClear}
          >
            Limpiar
          </button>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : result.data.length === 0 ? (
        <p>No hay resultados.</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-med-primary-50">
              <tr>
                <th className="p-4">Paciente</th>
                <th className="p-4">Médico</th>
                <th className="p-4">Especialidad</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((item, index) => (
                <tr
                  key={item.appointmentsId || item.id || index}
                  className="border-t"
                >
                  <td className="p-4">
                    {item.patient?.fullName ||
                      item.patient?.email ||
                      'Paciente'}{' '}
                    ({item.patient?.dni ?? '—'})
                  </td>
                  <td className="p-4">
                    {item.doctor?.name || item.doctorName || '—'}
                  </td>
                  <td className="p-4">
                    {item.doctor?.specialty?.name ||
                      item.specialty ||
                      item.speciality ||
                      '—'}
                  </td>
                  <td className="p-4">
                    {item.appointmentsStatus || item.status || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={result.pageIndex}
            totalPages={Math.max(1, Math.ceil(result.total / result.pageSize))}
            totalItems={result.total}
            pageSize={result.pageSize}
            onPageChange={search}
          />
        </div>
      )}
    </div>
  );
}

export default AppointmentsSearchPage;

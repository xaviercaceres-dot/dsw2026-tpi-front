import { useEffect, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { searchAppointments } from '../services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import TablePagination from '../../shared/components/TablePagination';

function AppointmentsSearchPage() {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({
    specialtyId: '',
    doctorId: '',
    dni: '',
    date: '',
  });
  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getSpecialties({ pageSize: 100, pageIndex: 1 }),
      getDoctors({ pageSize: 100, pageIndex: 1 }),
    ])
      .then(([specialtyData, doctorData]) => {
        setSpecialties(specialtyData.data || []);
        setDoctors(doctorData.data || []);
      })
      .catch((requestError) => setError(getApiError(requestError).message));
  }, []);

  const search = async (pageIndex = 1) => {
    setLoading(true);
    setError('');
    const params = {
      pageSize: 10,
      pageIndex,
      ...(filters.specialtyId ? { specialtyId: filters.specialtyId } : {}),
      ...(filters.doctorId ? { doctorId: filters.doctorId } : {}),
      ...(filters.dni ? { dni: Number(filters.dni) } : {}),
      ...(filters.date ? { date: filters.date } : {}),
    };

    try {
      setResult(await searchAppointments(params));
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setLoading(false);
    }
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
          placeholder="DNI"
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
            onClick={() => search()}
          >
            Buscar
          </button>
          <button
            type="button"
            className="border rounded px-3"
            onClick={() => {
              setFilters({ specialtyId: '', doctorId: '', dni: '', date: '' });
              setResult({ data: [], total: 0, pageIndex: 1, pageSize: 10 });
            }}
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
              {result.data.map((item) => (
                <tr key={item.appointmentsId} className="border-t">
                  <td className="p-4">
                    {item.patient?.fullName} ({item.patient?.dni})
                  </td>
                  <td className="p-4">{item.doctor?.name}</td>
                  <td className="p-4">{item.doctor?.specialty?.name}</td>
                  <td className="p-4">{item.appointmentsStatus}</td>
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

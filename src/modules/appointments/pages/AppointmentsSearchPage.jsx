import { useEffect, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import {
  getAppointmentsByDate,
  searchAppointments,
} from '../services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import PageHeader from '../../shared/components/PageHeader';
import { getTodayIsoLocal } from '../../shared/utils/dateUtils';
import AppointmentSearchFilters from '../components/AppointmentSearchFilters';
import AppointmentsTable from '../components/AppointmentsTable';

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
    date: getTodayIsoLocal(),
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
      date: getTodayIsoLocal(),
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
      date: getTodayIsoLocal(),
    };

    setFilters(resetFilters);
    executeSearch(resetFilters, 1);
  };

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div>
      <PageHeader
        title="Búsqueda y Filtrado de Citas"
        subtitle="Gestione y supervise el flujo de pacientes del departamento."
        className="mb-0"
      />

      <AppointmentSearchFilters
        filters={filters}
        specialties={specialties}
        doctors={doctors}
        onChange={setFilters}
        onApply={() => search(1)}
        onClear={handleClear}
      />

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      <AppointmentsTable
        appointments={result.data}
        fallbackDate={filters.date}
        loading={loading}
        pagination={{
          currentPage: result.pageIndex,
          totalPages,
          totalItems: result.total,
          pageSize: result.pageSize,
          onPageChange: search,
        }}
      />
    </div>
  );
}

export default AppointmentsSearchPage;

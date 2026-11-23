import { useCallback, useEffect, useRef, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import {
  getAppointmentsByDate,
  searchAppointments,
} from '../services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import { fetchAllPages, paginateItems } from '../../shared/api/pagination';
import { getTodayIsoLocal } from '../../shared/utils/dateUtils';

const PAGE_SIZE = 10;

function createInitialFilters() {
  return {
    specialtyId: '',
    doctorId: '',
    dni: '',
    date: getTodayIsoLocal(),
  };
}

// Filtro local por nombre o DNI parcial sobre los campos del DTO SearchItem del backend.
function matchesLocalQuery(item, query) {
  if (!query) return true;

  const q = query.toLowerCase();
  const dni = String(item.patient?.dni ?? '');
  const patientName = String(item.patient?.fullName ?? '').toLowerCase();
  const doctorName = String(item.doctor?.name ?? '').toLowerCase();

  return (
    dni.includes(query) || patientName.includes(q) || doctorName.includes(q)
  );
}

export function useAppointmentsSearch() {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [initialFilters] = useState(createInitialFilters);
  // Últimos filtros aplicados: la paginación los reutiliza aunque el formulario se esté editando.
  const appliedFilters = useRef(initialFilters);
  const [result, setResult] = useState({
    data: [],
    total: 0,
    pageIndex: 1,
    pageSize: PAGE_SIZE,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const latestRequestId = useRef(0);

  const executeSearch = useCallback(async (activeFilters, pageIndex = 1) => {
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

    const requestId = ++latestRequestId.current;

    if (!hasBackendFilter) {
      setError(
        'Para buscar, seleccioná al menos una fecha, una especialidad o un doctor, o ingresá un DNI de 7 u 8 dígitos.'
      );
      setResult({ data: [], total: 0, pageIndex: 1, pageSize: PAGE_SIZE });
      setLoading(false);

      return;
    }

    setLoading(true);
    setError('');

    // Turnos del día si solo hay fecha; si no, búsqueda combinada (ambos endpoints del enunciado).
    const onlyDate = hasDate && !hasSpecialty && !hasDoctor && !isValidDni;
    const serverFilters = {
      ...(hasSpecialty
        ? { specialtyId: String(activeFilters.specialtyId).trim() }
        : {}),
      ...(hasDoctor ? { doctorId: String(activeFilters.doctorId).trim() } : {}),
      ...(isValidDni ? { dni: Number(trimmedQuery) } : {}),
      ...(hasDate ? { date: String(activeFilters.date).trim() } : {}),
    };
    const fetchPage = (pageParams) =>
      onlyDate
        ? getAppointmentsByDate({ date: serverFilters.date, ...pageParams })
        : searchAppointments({ ...serverFilters, ...pageParams });

    try {
      let page;

      if (trimmedQuery && !isValidDni) {
        // El backend no filtra por nombre: se traen todas las páginas, se filtra y se pagina acá.
        const items = await fetchAllPages(fetchPage);
        const matches = items.filter((item) =>
          matchesLocalQuery(item, trimmedQuery)
        );

        page = paginateItems(matches, pageIndex, PAGE_SIZE);
      } else {
        page = await fetchPage({ pageSize: PAGE_SIZE, pageIndex });
      }

      if (requestId !== latestRequestId.current) return;

      setResult(page);
    } catch (requestError) {
      if (requestId !== latestRequestId.current) return;

      setError(getApiError(requestError).message);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getSpecialties({ pageSize: 100, pageIndex: 1 }),
      getDoctors({ pageSize: 100, pageIndex: 1 }),
    ])
      .then(([specialtyData, doctorData]) => {
        if (!isMounted) return;

        setSpecialties(specialtyData.data);
        setDoctors(doctorData.data);
      })
      .catch((requestError) => {
        if (isMounted) setError(getApiError(requestError).message);
      });

    executeSearch(appliedFilters.current, 1);

    return () => {
      isMounted = false;
      latestRequestId.current += 1;
    };
  }, [executeSearch]);

  const handlePageChange = (pageIndex) => {
    executeSearch(appliedFilters.current, pageIndex);
  };

  const handleApply = (values) => {
    appliedFilters.current = values;
    executeSearch(values, 1);
  };

  const handleClear = () => {
    appliedFilters.current = initialFilters;
    executeSearch(initialFilters, 1);
  };

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return {
    specialties,
    doctors,
    initialFilters,
    appointments: result.data,
    error,
    loading,
    pagination: {
      currentPage: result.pageIndex,
      totalPages,
      totalItems: result.total,
      pageSize: result.pageSize,
      onPageChange: handlePageChange,
    },
    handleApply,
    handleClear,
  };
}

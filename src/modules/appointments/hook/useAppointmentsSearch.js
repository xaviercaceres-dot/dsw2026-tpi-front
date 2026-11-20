import { useCallback, useEffect, useRef, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import {
  getAppointmentsByDate,
  searchAppointments,
} from '../services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
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

export function useAppointmentsSearch() {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState(createInitialFilters);
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

    try {
      let response;

      if (hasDate && !hasSpecialty && !hasDoctor && !isValidDni) {
        response = await getAppointmentsByDate({
          date: String(activeFilters.date).trim(),
          pageSize: PAGE_SIZE,
          pageIndex,
        });
      } else {
        const params = {
          pageSize: PAGE_SIZE,
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

      if (requestId !== latestRequestId.current) return;

      const rawItems = response.data;
      const isLocalFilter = Boolean(trimmedQuery && !isValidDni);
      const filteredItems = isLocalFilter
        ? rawItems.filter((item) => matchesLocalQuery(item, trimmedQuery))
        : rawItems;

      setResult({
        data: filteredItems,
        total: isLocalFilter ? filteredItems.length : response.total,
        pageIndex: response.pageIndex,
        pageSize: response.pageSize,
      });
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

    executeSearch(createInitialFilters(), 1);

    return () => {
      isMounted = false;
      latestRequestId.current += 1;
    };
  }, [executeSearch]);

  const handleSearch = (pageIndex = 1) => {
    executeSearch(filters, pageIndex);
  };

  const handleApply = () => {
    executeSearch(filters, 1);
  };

  const handleClear = () => {
    const resetFilters = createInitialFilters();

    setFilters(resetFilters);
    executeSearch(resetFilters, 1);
  };

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return {
    specialties,
    doctors,
    filters,
    setFilters,
    appointments: result.data,
    error,
    loading,
    pagination: {
      currentPage: result.pageIndex,
      totalPages,
      totalItems: result.total,
      pageSize: result.pageSize,
      onPageChange: handleSearch,
    },
    handleApply,
    handleClear,
  };
}

import { useEffect, useMemo, useState } from 'react';
import { getAppointmentsByDate } from '../../appointments/services/appointmentsApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getApiError } from '../../shared/api/apiError';
import { usePagination } from '../../shared/hooks/usePagination';
import { getTodayIsoLocal } from '../../shared/utils/dateUtils';

export function useOverview(pageSizeLimit = 3) {
  const [doctors, setDoctors] = useState([]);
  const [doctorsTotal, setDoctorsTotal] = useState(0);
  const [specialtiesCount, setSpecialtiesCount] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const [doctorResult, specialtyResult, appointmentResult] =
          await Promise.all([
            getDoctors({ pageSize: 100, pageIndex: 1 }),
            getSpecialties({ pageSize: 100, pageIndex: 1 }),
            getAppointmentsByDate({
              date: getTodayIsoLocal(),
              pageSize: 100,
              pageIndex: 1,
            }),
          ]);

        if (!isMounted) return;

        const bookedAppointments = appointmentResult.data.filter(
          (item) => item.appointmentsStatus === 'BOOKED'
        );

        setDoctors(doctorResult.data);
        setDoctorsTotal(doctorResult.total);
        setSpecialtiesCount(specialtyResult.total);
        setAppointmentsToday(bookedAppointments.length);
      } catch (requestError) {
        if (isMounted) setError(getApiError(requestError).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) =>
        (doctor.name || '').toLowerCase().includes(search.toLowerCase())
      ),
    [doctors, search]
  );

  const {
    currentPage,
    totalPages,
    paginatedItems: visibleDoctors,
    totalItems,
    pageSize,
    setCurrentPage,
    handlePageChange,
  } = usePagination(filteredDoctors, pageSizeLimit);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return {
    metrics: {
      doctorsTotal,
      specialtiesCount,
      appointmentsToday,
    },
    visibleDoctors,
    search,
    loading,
    error,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      onPageChange: handlePageChange,
    },
    handleSearchChange,
  };
}

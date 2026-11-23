import { useEffect, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getApiError } from '../../shared/api/apiError';

// Catálogo para reservar: especialidades y médicos. onError debe ser estable (un setter de estado).
export function useBookingCatalog(onError) {
  const [catalog, setCatalog] = useState({
    specialties: [],
    doctors: [],
    loaded: false,
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getSpecialties({ pageSize: 100, pageIndex: 1 }),
      getDoctors({ pageSize: 100, pageIndex: 1 }),
    ])
      .then(([specialtyPage, doctorPage]) => {
        if (!isMounted) return;

        setCatalog({
          specialties: specialtyPage.data,
          doctors: doctorPage.data,
          loaded: true,
        });
      })
      .catch((requestError) => {
        if (!isMounted) return;

        onError(getApiError(requestError).message);
        setCatalog((current) => ({ ...current, loaded: true }));
      });

    return () => {
      isMounted = false;
    };
  }, [onError]);

  return catalog;
}

export default useBookingCatalog;

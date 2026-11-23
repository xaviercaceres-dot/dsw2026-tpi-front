import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAvailableSlots } from '../../availability/services/availabilityApi';
import { getApiError } from '../../shared/api/apiError';
import {
  DAYS_IN_WINDOW,
  buildDaysWindow,
  filterValidSlotsForDate,
} from '../helpers/bookingUtils';

// Ventana de días visible y turnos libres de cada día para un médico.
// onError debe ser estable (un setter de estado).
export function useWeeklySlots(onError) {
  const [windowOffset, setWindowOffset] = useState(0);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const latestRequestId = useRef(0);

  const daysWindow = useMemo(
    () => buildDaysWindow(windowOffset),
    [windowOffset]
  );

  // Pide los turnos de cada día de la ventana; solo se aplica la respuesta del último pedido.
  const loadWeek = useCallback(
    async (doctorId, startOffset) => {
      const requestId = ++latestRequestId.current;

      if (!doctorId) {
        setLoadingSlots(false);

        return;
      }

      setLoadingSlots(true);

      try {
        const days = buildDaysWindow(startOffset);
        const responses = await Promise.all(
          days.map((day) => getAvailableSlots(doctorId, day.dateStr))
        );

        if (requestId !== latestRequestId.current) return;

        const nextSlots = {};

        days.forEach((day, index) => {
          nextSlots[day.dateStr] = filterValidSlotsForDate(
            responses[index],
            day.dateStr
          );
        });
        setSlotsByDate(nextSlots);
      } catch (requestError) {
        if (requestId !== latestRequestId.current) return;

        setSlotsByDate({});
        onError(getApiError(requestError).message);
      } finally {
        if (requestId === latestRequestId.current) setLoadingSlots(false);
      }
    },
    [onError]
  );

  // Si la pantalla se desmonta, las respuestas pendientes se ignoran.
  useEffect(() => {
    const requestCounter = latestRequestId;

    return () => {
      requestCounter.current += 1;
    };
  }, []);

  // Muestra la primera ventana (desde hoy) de otro médico.
  const startWeek = useCallback(
    (doctorId) => {
      setWindowOffset(0);
      setSlotsByDate({});
      loadWeek(doctorId, 0);
    },
    [loadWeek]
  );

  const shiftWeek = (doctorId, direction) => {
    const nextOffset = Math.max(0, windowOffset + direction * DAYS_IN_WINDOW);

    setWindowOffset(nextOffset);
    loadWeek(doctorId, nextOffset);
  };

  const reloadWeek = (doctorId) => loadWeek(doctorId, windowOffset);

  return {
    daysWindow,
    slotsByDate,
    loadingSlots,
    canGoBack: windowOffset > 0,
    startWeek,
    shiftWeek,
    reloadWeek,
  };
}

export default useWeeklySlots;

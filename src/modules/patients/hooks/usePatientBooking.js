import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getAvailableSlots } from '../../availability/services/availabilityApi';
import { createAppointment } from '../../appointments/services/appointmentsApi';
import useAuth from '../../auth/hook/useAuth';
import { getApiError } from '../../shared/api/apiError';
import {
  BOOKING_ERROR_MESSAGES,
  DAYS_IN_WINDOW,
  buildDaysWindow,
  filterValidSlotsForDate,
  formatRangeHeaderLabel,
  validateBookingReason,
} from '../helpers/bookingUtils';

const matchesSpecialty = (doc, specId) =>
  String(doc.specialty?.id) === String(specId);

export function usePatientBooking() {
  const { dni } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [specialtyId, setSpecialtyId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [windowOffset, setWindowOffset] = useState(0);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const latestRequestId = useRef(0);

  const daysWindow = useMemo(
    () => buildDaysWindow(windowOffset),
    [windowOffset]
  );

  const invalidatePendingSlots = useCallback(() => {
    latestRequestId.current += 1;
    setLoadingSlots(false);
  }, []);

  const loadWeekSlots = useCallback(async (targetDoctorId, startOffset) => {
    if (!targetDoctorId) return;

    const requestId = ++latestRequestId.current;

    setLoadingSlots(true);

    try {
      const targetDays = buildDaysWindow(startOffset);
      const responses = await Promise.all(
        targetDays.map((dayMeta) =>
          getAvailableSlots(targetDoctorId, dayMeta.dateStr)
        )
      );

      if (requestId !== latestRequestId.current) return;

      const nextMap = {};

      targetDays.forEach((dayMeta, idx) => {
        nextMap[dayMeta.dateStr] = filterValidSlotsForDate(
          responses[idx],
          dayMeta.dateStr
        );
      });

      setSlotsByDate(nextMap);
    } catch (requestError) {
      if (requestId !== latestRequestId.current) return;

      setSlotsByDate({});
      setError(getApiError(requestError).message);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoadingSlots(false);
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

        const docItems = doctorData.data;

        setSpecialties(specialtyData.data);
        setDoctors(docItems);

        if (docItems.length > 0) {
          setDoctorId(docItems[0].id);
          loadWeekSlots(docItems[0].id, 0);
        }
      })
      .catch((requestError) => {
        if (isMounted) setError(getApiError(requestError).message);
      })
      .finally(() => {
        if (isMounted) setCatalogLoaded(true);
      });

    return () => {
      isMounted = false;
      latestRequestId.current += 1;
    };
  }, [loadWeekSlots]);

  const filteredDoctors = useMemo(
    () =>
      specialtyId
        ? doctors.filter((doctor) => matchesSpecialty(doctor, specialtyId))
        : doctors,
    [doctors, specialtyId]
  );

  const selectedDoctor = useMemo(
    () => doctors.find((doc) => String(doc.id) === String(doctorId)),
    [doctors, doctorId]
  );

  const resetSelection = useCallback(() => {
    setSelectedSlot(null);
    setSelectedDateStr('');
    setReasonError('');
    setMessage('');
    setError('');
  }, []);

  const handleSpecialtyChange = (nextSpecId) => {
    const matchingDocs = nextSpecId
      ? doctors.filter((doc) => matchesSpecialty(doc, nextSpecId))
      : doctors;
    const nextDocId = matchingDocs[0]?.id || '';

    setSpecialtyId(nextSpecId);
    resetSelection();
    setDoctorId(nextDocId);
    setSlotsByDate({});
    setWindowOffset(0);

    if (nextDocId) loadWeekSlots(nextDocId, 0);
    else invalidatePendingSlots();
  };

  const handleDoctorChange = (nextDocId) => {
    setDoctorId(nextDocId);
    resetSelection();
    setSlotsByDate({});
    setWindowOffset(0);

    if (nextDocId) loadWeekSlots(nextDocId, 0);
    else invalidatePendingSlots();
  };

  const handleSearch = () => {
    resetSelection();

    if (!doctorId) {
      setError('Seleccioná un profesional para buscar disponibilidad.');

      return;
    }

    loadWeekSlots(doctorId, windowOffset);
  };

  const handleShiftWeek = (direction) => {
    const nextOffset = Math.max(0, windowOffset + direction * DAYS_IN_WINDOW);

    setWindowOffset(nextOffset);
    resetSelection();

    if (doctorId) loadWeekSlots(doctorId, nextOffset);
  };

  const handleSelectSlot = (dateStr, item) => {
    setSelectedDateStr(dateStr);
    setSelectedSlot(item);
    setMessage('');
    setError('');
  };

  const handleReasonChange = (value) => {
    setReason(value);
    setReasonError('');
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !doctorId) return;

    const validationError = validateBookingReason(reason);

    if (validationError) {
      setReasonError(validationError);

      return;
    }

    setBooking(true);
    setReasonError('');
    setError('');
    setMessage('');

    try {
      await createAppointment({
        doctorId,
        availabilitySlotId: selectedSlot.id,
        patient: { dni },
        reason: reason.trim(),
      });
      setMessage('Turno reservado correctamente.');
      setSelectedSlot(null);
      setSelectedDateStr('');
      setReason('');
      await loadWeekSlots(doctorId, windowOffset);
    } catch (requestError) {
      const apiError = getApiError(requestError, BOOKING_ERROR_MESSAGES);

      setError(apiError.message);

      if (apiError.status === 409) {
        setSelectedSlot(null);
        setSelectedDateStr('');
        await loadWeekSlots(doctorId, windowOffset);
      }
    } finally {
      setBooking(false);
    }
  };

  const rangeHeaderLabel = formatRangeHeaderLabel(daysWindow);
  const selectedDayMeta =
    daysWindow.find((d) => d.dateStr === selectedDateStr) || daysWindow[0];

  const noDoctorsMessage = !catalogLoaded
    ? ''
    : doctors.length === 0
      ? 'Todavía no hay profesionales disponibles para reservar turnos.'
      : filteredDoctors.length === 0
        ? 'No hay profesionales para la especialidad seleccionada.'
        : '';

  return {
    specialties,
    filteredDoctors,
    selectedDoctor,
    specialtyId,
    doctorId,
    daysWindow,
    slotsByDate,
    selectedSlot,
    selectedDayMeta,
    rangeHeaderLabel,
    canGoBack: windowOffset > 0,
    reason,
    reasonError,
    message,
    error,
    noDoctorsMessage,
    loadingSlots,
    booking,
    handleSpecialtyChange,
    handleDoctorChange,
    handleSearch,
    handleShiftWeek,
    handleSelectSlot,
    handleReasonChange,
    handleConfirmBooking,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createAppointment } from '../../appointments/services/appointmentsApi';
import useAuth from '../../auth/hook/useAuth';
import { getApiError } from '../../shared/api/apiError';
import {
  BOOKING_ERROR_MESSAGES,
  formatRangeHeaderLabel,
  REASON_RULES,
} from '../helpers/bookingUtils';
import { useBookingCatalog } from './useBookingCatalog';
import { useWeeklySlots } from './useWeeklySlots';

const matchesSpecialty = (doc, specId) =>
  String(doc.specialty?.id) === String(specId);

// Reserva de turnos (CU01): compone el catálogo, la ventana de turnos y el formulario del motivo.
export function usePatientBooking() {
  const { dni } = useAuth();
  const [specialtyId, setSpecialtyId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  const { specialties, doctors, loaded } = useBookingCatalog(setError);
  const {
    daysWindow,
    slotsByDate,
    loadingSlots,
    canGoBack,
    startWeek,
    shiftWeek,
    reloadWeek,
  } = useWeeklySlots(setError);

  // Formulario del motivo (React Hook Form). Vive en el hook para conservar el texto
  // aunque el paciente cambie de horario o el turno elegido ya no esté disponible.
  const {
    register,
    handleSubmit,
    reset: resetReasonForm,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues: { reason: '' }, mode: 'onTouched' });

  // Al cargar el catálogo se preselecciona el primer médico y se muestran sus turnos.
  useEffect(() => {
    if (doctors.length === 0) return;

    setDoctorId(doctors[0].id);
    startWeek(doctors[0].id);
  }, [doctors, startWeek]);

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
    clearErrors();
    setMessage('');
    setError('');
  }, [clearErrors]);

  const handleSpecialtyChange = (nextSpecId) => {
    const matchingDocs = nextSpecId
      ? doctors.filter((doc) => matchesSpecialty(doc, nextSpecId))
      : doctors;
    const nextDocId = matchingDocs[0]?.id || '';

    setSpecialtyId(nextSpecId);
    resetSelection();
    setDoctorId(nextDocId);
    startWeek(nextDocId);
  };

  const handleDoctorChange = (nextDocId) => {
    setDoctorId(nextDocId);
    resetSelection();
    startWeek(nextDocId);
  };

  const handleSearch = () => {
    resetSelection();

    if (!doctorId) {
      setError('Seleccioná un profesional para buscar disponibilidad.');

      return;
    }

    reloadWeek(doctorId);
  };

  const handleShiftWeek = (direction) => {
    resetSelection();
    shiftWeek(doctorId, direction);
  };

  const handleSelectSlot = (dateStr, item) => {
    setSelectedDateStr(dateStr);
    setSelectedSlot(item);
    setMessage('');
    setError('');
  };

  const confirmBooking = async ({ reason }) => {
    if (!selectedSlot || !doctorId) return;

    setBooking(true);
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
      resetReasonForm();
      await reloadWeek(doctorId);
    } catch (requestError) {
      const apiError = getApiError(requestError, BOOKING_ERROR_MESSAGES);

      setError(apiError.message);

      // 409: el horario lo tomó otro paciente; se recargan los turnos libres.
      if (apiError.status === 409) {
        setSelectedSlot(null);
        setSelectedDateStr('');
        await reloadWeek(doctorId);
      }
    } finally {
      setBooking(false);
    }
  };

  const selectedDayMeta =
    daysWindow.find((d) => d.dateStr === selectedDateStr) || daysWindow[0];

  let noDoctorsMessage = '';

  if (loaded && doctors.length === 0) {
    noDoctorsMessage =
      'Todavía no hay profesionales disponibles para reservar turnos.';
  } else if (loaded && filteredDoctors.length === 0) {
    noDoctorsMessage =
      'No hay profesionales para la especialidad seleccionada.';
  }

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
    rangeHeaderLabel: formatRangeHeaderLabel(daysWindow),
    canGoBack,
    reasonField: register('reason', REASON_RULES),
    reasonError: errors.reason?.message,
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
    handleConfirmBooking: handleSubmit(confirmBooking),
  };
}

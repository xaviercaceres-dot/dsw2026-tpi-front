import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import DoctorSearchBar from '../components/DoctorSearchBar';
import SelectedDoctorBanner from '../components/SelectedDoctorBanner';
import WeeklySlotsGrid from '../components/WeeklySlotsGrid';
import AppointmentSummaryBar from '../components/AppointmentSummaryBar';

function PatientHome() {
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

  const daysWindow = buildDaysWindow(windowOffset);

  const loadWeekSlots = async (targetDoctorId, startOffset) => {
    if (!targetDoctorId) return;

    setLoadingSlots(true);
    try {
      const targetDays = buildDaysWindow(startOffset);
      const responses = await Promise.all(
        targetDays.map((dayMeta) =>
          getAvailableSlots(targetDoctorId, dayMeta.dateStr)
        )
      );

      const nextMap = {};

      targetDays.forEach((dayMeta, idx) => {
        nextMap[dayMeta.dateStr] = filterValidSlotsForDate(
          responses[idx],
          dayMeta.dateStr
        );
      });

      setSlotsByDate(nextMap);
    } catch (requestError) {
      setSlotsByDate({});
      setError(getApiError(requestError).message);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    Promise.all([
      getSpecialties({ pageSize: 100, pageIndex: 1 }),
      getDoctors({ pageSize: 100, pageIndex: 1 }),
    ])
      .then(([specialtyData, doctorData]) => {
        const docItems = doctorData.data;

        setSpecialties(specialtyData.data);
        setDoctors(docItems);

        if (docItems.length > 0) {
          setDoctorId(docItems[0].id);
          loadWeekSlots(docItems[0].id, 0);
        }
      })
      .catch((requestError) => setError(getApiError(requestError).message))
      .finally(() => setCatalogLoaded(true));
  }, []);

  const matchesSpecialty = (doc, specId) =>
    String(doc.specialty?.id) === String(specId);

  const filteredDoctors = specialtyId
    ? doctors.filter((doctor) => matchesSpecialty(doctor, specialtyId))
    : doctors;

  const selectedDoctor = doctors.find(
    (doc) => String(doc.id) === String(doctorId)
  );

  const resetSelection = () => {
    setSelectedSlot(null);
    setSelectedDateStr('');
    setReasonError('');
    setMessage('');
    setError('');
  };

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
  };

  const handleDoctorChange = (nextDocId) => {
    setDoctorId(nextDocId);
    resetSelection();
    setSlotsByDate({});
    setWindowOffset(0);

    if (nextDocId) loadWeekSlots(nextDocId, 0);
  };

  const handleSearch = () => {
    resetSelection();

    if (!doctorId) {
      setError('Seleccioná un profesional para buscar disponibilidad.');

      return;
    }

    loadWeekSlots(doctorId, windowOffset);
  };

  const handleShiftWeek = (delta) => {
    const nextOffset = Math.max(0, windowOffset + delta);

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

  const book = async () => {
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-5">
      <DoctorSearchBar
        specialties={specialties}
        doctors={filteredDoctors}
        specialtyId={specialtyId}
        doctorId={doctorId}
        onSpecialtyChange={handleSpecialtyChange}
        onDoctorChange={handleDoctorChange}
        onSearch={handleSearch}
      />

      {error && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium"
        >
          {message}{' '}
          <Link to="/appointments" className="underline font-semibold">
            Ver Mis Turnos
          </Link>
        </div>
      )}
      {noDoctorsMessage && (
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
          {noDoctorsMessage}
        </div>
      )}

      <SelectedDoctorBanner doctor={selectedDoctor} />

      {selectedDoctor && (
        <WeeklySlotsGrid
          daysWindow={daysWindow}
          slotsByDate={slotsByDate}
          selectedSlot={selectedSlot}
          rangeHeaderLabel={rangeHeaderLabel}
          canGoBack={windowOffset > 0}
          loading={loadingSlots}
          onShiftWeek={(direction) =>
            handleShiftWeek(direction * DAYS_IN_WINDOW)
          }
          onSelectSlot={handleSelectSlot}
        />
      )}

      <AppointmentSummaryBar
        selectedSlot={selectedSlot}
        selectedDayMeta={selectedDayMeta}
        reason={reason}
        reasonError={reasonError}
        loading={booking}
        onReasonChange={(value) => {
          setReason(value);
          setReasonError('');
        }}
        onConfirm={book}
      />
    </div>
  );
}

export default PatientHome;

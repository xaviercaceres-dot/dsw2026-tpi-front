import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getAvailableSlots } from '../../availability/services/availabilityApi';
import { createAppointment } from '../../appointments/services/appointmentsApi';
import useAuth from '../../auth/hook/useAuth';
import { getApiError } from '../../shared/api/apiError';
import FormField from '../../shared/components/FormField';
import {
  formatDateToIsoLocal,
  formatTimeHHmm,
} from '../../shared/utils/dateUtils';
import SelectedDoctorBanner from '../components/SelectedDoctorBanner';
import WeeklySlotsGrid from '../components/WeeklySlotsGrid';
import AppointmentSummaryBar from '../components/AppointmentSummaryBar';

const DAYS_IN_WINDOW = 5;
const REASON_MIN_LENGTH = 5;
const REASON_MAX_LENGTH = 300;
const DAY_ABBR = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const DAY_FULL = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const bookingErrorMessages = {
  APPOINTMENT_CONFLICT:
    'Lo sentimos, ese horario acaba de ser reservado por otro paciente. Por favor, seleccioná otro turno.',
};

function buildDayMeta(offsetFromToday) {
  const base = new Date();
  const d = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + offsetFromToday
  );

  return {
    dateStr: formatDateToIsoLocal(d),
    dayAbbr: DAY_ABBR[d.getDay()],
    fullDayName: DAY_FULL[d.getDay()],
    dayNumber: String(d.getDate()).padStart(2, '0'),
    monthName: MONTH_NAMES[d.getMonth()],
    monthShort: MONTH_NAMES[d.getMonth()].slice(0, 3).toUpperCase(),
    year: d.getFullYear(),
  };
}

function buildDaysWindow(startOffset) {
  return Array.from({ length: DAYS_IN_WINDOW }, (_, i) =>
    buildDayMeta(startOffset + i)
  );
}

function filterValidSlotsForDate(rawSlots, selectedDateStr) {
  if (!Array.isArray(rawSlots)) return [];

  const now = new Date();
  const todayStr = formatDateToIsoLocal(now);
  const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return rawSlots
    .filter((item) => {
      if (item.status && item.status !== 'AVAILABLE') return false;

      if (selectedDateStr === todayStr) {
        return formatTimeHHmm(item.startTime) > currentHHmm;
      }

      return true;
    })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

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

  // Consulta los turnos libres (GET /api/availabilities?doctorId=&date=) de cada día de la ventana.
  // No limpia los mensajes: así un conflicto informado antes de recargar sigue visible.
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

  const handleSpecialtyChange = (event) => {
    const nextSpecId = event.target.value;
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

  const handleDoctorChange = (event) => {
    const nextDocId = event.target.value;

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

    const finalReason = reason.trim();

    if (
      finalReason.length < REASON_MIN_LENGTH ||
      finalReason.length > REASON_MAX_LENGTH
    ) {
      setReasonError(
        `Ingresá el motivo de la consulta (entre ${REASON_MIN_LENGTH} y ${REASON_MAX_LENGTH} caracteres).`
      );

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
        reason: finalReason,
      });
      setMessage('Turno reservado correctamente.');
      setSelectedSlot(null);
      setSelectedDateStr('');
      setReason('');
      await loadWeekSlots(doctorId, windowOffset);
    } catch (requestError) {
      const apiError = getApiError(requestError, bookingErrorMessages);

      setError(apiError.message);

      // Flujo alternativo del CU01: el turno fue tomado por otro paciente, se informa
      // el conflicto y se actualizan los horarios para que elija otro.
      if (apiError.status === 409) {
        setSelectedSlot(null);
        setSelectedDateStr('');
        await loadWeekSlots(doctorId, windowOffset);
      }
    } finally {
      setBooking(false);
    }
  };

  const firstDay = daysWindow[0];
  const lastDay = daysWindow[daysWindow.length - 1];
  const rangeHeaderLabel = `${firstDay.fullDayName} ${firstDay.dayNumber} - ${lastDay.fullDayName} ${lastDay.dayNumber}, ${lastDay.monthName}`;

  const selectedDayMeta =
    daysWindow.find((d) => d.dateStr === selectedDateStr) || firstDay;

  const noDoctorsMessage = !catalogLoaded
    ? ''
    : doctors.length === 0
      ? 'Todavía no hay profesionales disponibles para reservar turnos.'
      : filteredDoctors.length === 0
        ? 'No hay profesionales para la especialidad seleccionada.'
        : '';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-5">
      {/* 1. Buscador de Especialidad y Doctor */}
      <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#0F2942]">
          Reservar Turno Médico
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          Seleccione la especialidad y el profesional para continuar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <FormField
            label="Seleccionar Especialidad"
            labelClassName="text-xs font-semibold text-slate-600 mb-1.5 block"
            className="md:col-span-5"
          >
            <select
              value={specialtyId}
              onChange={handleSpecialtyChange}
              aria-label="Seleccionar Especialidad"
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            >
              <option value="">Todas las especialidades</option>
              {specialties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Seleccionar Doctor"
            labelClassName="text-xs font-semibold text-slate-600 mb-1.5 block"
            className="md:col-span-4"
          >
            <select
              value={doctorId}
              onChange={handleDoctorChange}
              aria-label="Seleccionar Doctor"
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            >
              <option value="">Seleccionar profesional</option>
              {filteredDoctors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="md:col-span-3">
            <button
              type="button"
              onClick={handleSearch}
              className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 w-full transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Buscar Disponibilidad</span>
            </button>
          </div>
        </div>
      </section>

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

      {/* 2. Banner del Médico Seleccionado */}
      <SelectedDoctorBanner doctor={selectedDoctor} />

      {/* 3. Grilla Semanal de Horarios */}
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

      {/* 4. Barra Inferior de RESUMEN DE SELECCIÓN */}
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

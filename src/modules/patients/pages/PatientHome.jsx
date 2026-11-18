import { useEffect, useState } from 'react';
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
    year: d.getFullYear(),
  };
}

function filterValidSlotsForDate(rawSlots, selectedDateStr) {
  if (!Array.isArray(rawSlots)) return [];

  const now = new Date();
  const todayStr = formatDateToIsoLocal(now);
  const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return rawSlots
    .filter((item) => {
      if (item.isReserved === true) return false;

      if (item.status && item.status !== 'AVAILABLE') return false;

      if (selectedDateStr === todayStr) {
        const slotTime = formatTimeHHmm(item.startTime);

        return slotTime > currentHHmm;
      }

      return true;
    })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

function PatientHome() {
  const { dni } = useAuth();
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [windowOffset, setWindowOffset] = useState(0);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const daysWindow = [0, 1, 2, 3, 4].map((i) => buildDayMeta(windowOffset + i));

  const loadWeekSlots = async (targetDoctorId, startOffset) => {
    if (!targetDoctorId) return;

    setLoading(true);
    setError('');
    try {
      const targetDays = [0, 1, 2, 3, 4].map((i) =>
        buildDayMeta(startOffset + i)
      );
      const responses = await Promise.all(
        targetDays.map((dayMeta) =>
          getAvailableSlots(targetDoctorId, dayMeta.dateStr).catch(() => [])
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
        const specItems = Array.isArray(specialtyData)
          ? specialtyData
          : Array.isArray(specialtyData?.data)
            ? specialtyData.data
            : [];
        const docItems = Array.isArray(doctorData)
          ? doctorData
          : Array.isArray(doctorData?.data)
            ? doctorData.data
            : [];

        setSpecialties(specItems);
        setDoctors(docItems);

        if (docItems.length > 0) {
          const firstDoc = docItems[0];

          setDoctorId(firstDoc.id);
          loadWeekSlots(firstDoc.id, 0);
        }
      })
      .catch((requestError) => setError(getApiError(requestError).message));
  }, []);

  const matchesSpecialty = (doc, specId) =>
    String(doc.specialty?.id ?? doc.specialtyId) === String(specId);

  const filteredDoctors = specialtyId
    ? doctors.filter((doctor) => matchesSpecialty(doctor, specialtyId))
    : doctors;

  const selectedDoctor = doctors.find(
    (doc) => String(doc.id) === String(doctorId)
  );

  const handleSpecialtyChange = (event) => {
    const nextSpecId = event.target.value;

    setSpecialtyId(nextSpecId);
    setSelectedSlot(null);
    setSelectedDateStr('');
    setMessage('');
    setError('');

    const matchingDocs = nextSpecId
      ? doctors.filter((doc) => matchesSpecialty(doc, nextSpecId))
      : doctors;

    const nextDocId = matchingDocs[0]?.id || '';

    setDoctorId(nextDocId);
    setSlotsByDate({});

    if (nextDocId) {
      setWindowOffset(0);
      loadWeekSlots(nextDocId, 0);
    }
  };

  const handleDoctorChange = (event) => {
    const nextDocId = event.target.value;

    setDoctorId(nextDocId);
    setSelectedSlot(null);
    setSelectedDateStr('');
    setMessage('');
    setError('');
    setSlotsByDate({});

    if (nextDocId) {
      setWindowOffset(0);
      loadWeekSlots(nextDocId, 0);
    }
  };

  const handleShiftWeek = (delta) => {
    const nextOffset = Math.max(0, windowOffset + delta);

    setWindowOffset(nextOffset);
    setSelectedSlot(null);
    setSelectedDateStr('');

    if (doctorId) {
      loadWeekSlots(doctorId, nextOffset);
    }
  };

  const book = async () => {
    if (!selectedSlot || !doctorId) return;

    const finalReason = reason.trim() || 'Consulta médica general';

    if (finalReason.length < 5 || finalReason.length > 300) {
      setError('El motivo de la consulta debe tener entre 5 y 300 caracteres.');

      return;
    }

    setLoading(true);
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
      const apiError = getApiError(requestError);
      const backendCode =
        requestError.response?.data?.code ||
        requestError.response?.data?.errorCode ||
        apiError.code;

      if (apiError.status === 409 || backendCode === 'APPOINTMENT_CONFLICT') {
        setError(
          requestError.response?.data?.message ||
            'Lo sentimos, este horario acaba de ser reservado por otro paciente o ya no está disponible. Por favor, seleccione otro horario.'
        );
        setSelectedSlot(null);
        setSelectedDateStr('');
        await loadWeekSlots(doctorId, windowOffset);
      } else {
        setError(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const firstDay = daysWindow[0];
  const lastDay = daysWindow[daysWindow.length - 1];
  const rangeHeaderLabel = `${firstDay.fullDayName} ${firstDay.dayNumber} - ${lastDay.fullDayName} ${lastDay.dayNumber}, ${lastDay.monthName}`;

  const selectedDayMeta =
    daysWindow.find((d) => d.dateStr === selectedDateStr) || firstDay;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-5">
      {/* 1. Buscador de Especialidad y Doctor */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
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
              onClick={() => loadWeekSlots(doctorId, windowOffset)}
              className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 w-full transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
          {message}
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
          loading={loading}
          onShiftWeek={handleShiftWeek}
          onSelectSlot={(dateStr, item) => {
            setSelectedDateStr(dateStr);
            setSelectedSlot(item);
          }}
        />
      )}

      {/* 4. Barra Inferior de RESUMEN DE SELECCIÓN */}
      <AppointmentSummaryBar
        selectedSlot={selectedSlot}
        selectedDayMeta={selectedDayMeta}
        reason={reason}
        loading={loading}
        onReasonChange={setReason}
        onConfirm={book}
      />
    </div>
  );
}

export default PatientHome;

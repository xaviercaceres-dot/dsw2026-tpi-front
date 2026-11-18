import { useEffect, useState } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesApi';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getAvailableSlots } from '../../availability/services/availabilityApi';
import { createAppointment } from '../../appointments/services/appointmentsApi';
import useAuth from '../../auth/hook/useAuth';
import { getApiError } from '../../shared/api/apiError';

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

function formatDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildDayMeta(offsetFromToday) {
  const base = new Date();
  const d = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + offsetFromToday
  );

  return {
    dateStr: formatDate(d),
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
  const todayStr = formatDate(now);
  const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return rawSlots
    .filter((item) => {
      if (item.isReserved === true) return false;

      if (item.status && item.status !== 'AVAILABLE') return false;

      if (selectedDateStr === todayStr) {
        const slotTime = (item.startTime || '').substring(0, 5);

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
      {/* 1. Tarjeta 1: Buscador de Especialidad y Doctor */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#0F2942]">
          Reservar Turno Médico
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          Seleccione la especialidad y el profesional para continuar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Seleccionar Especialidad */}
          <div className="md:col-span-5">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Seleccionar Especialidad
            </label>
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
          </div>

          {/* Seleccionar Doctor */}
          <div className="md:col-span-4">
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Seleccionar Doctor
            </label>
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
          </div>

          {/* Botón Buscar Disponibilidad */}
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

      {/* 2. Tarjeta 2: Banner del Médico Seleccionado */}
      {selectedDoctor && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#E6F2FA] flex items-center justify-center text-2xl relative shrink-0">
            <span>👨‍⚕️</span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center">
              <h2 className="font-bold text-[#0F2942] text-base">
                {selectedDoctor.name}
              </h2>
              <span className="bg-[#E0F2FE] text-[#133B5C] text-[10px] font-bold px-2 py-0.5 rounded ml-2">
                Verificado
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              {selectedDoctor.specialty?.name ||
                selectedDoctor.specialty ||
                'Especialista Médico'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Clínica San Rafael • Sede Central Consultorio 402
              {selectedDoctor.licenseNumber || selectedDoctor.license_number
                ? ` • Matrícula: ${selectedDoctor.licenseNumber || selectedDoctor.license_number}`
                : ''}
            </p>
          </div>
        </div>
      )}

      {/* 3. Tarjeta 3: Grilla Semanal de Horarios */}
      {selectedDoctor && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          {/* Cabecera de la grilla */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={windowOffset <= 0}
                onClick={() => handleShiftWeek(-5)}
                className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              >
                ‹
              </button>
              <span className="text-sm font-bold text-[#133B5C]">
                {rangeHeaderLabel}
              </span>
              <button
                type="button"
                onClick={() => handleShiftWeek(5)}
                className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center text-slate-500 hover:bg-slate-50"
              >
                ›
              </button>
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#133B5C]" />
                <span>Disponible</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#52C47C]" />
                <span>Seleccionado</span>
              </span>
            </div>
          </div>

          {/* Columnas de Días */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-5">
            {daysWindow.map((dayMeta) => {
              const daySlots = slotsByDate[dayMeta.dateStr] || [];

              return (
                <div key={dayMeta.dateStr} className="flex flex-col">
                  {/* Cabecera de columna */}
                  <div className="text-center pb-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {dayMeta.dayAbbr}
                    </p>
                    <p className="text-lg font-extrabold text-[#133B5C]">
                      {dayMeta.dayNumber}
                    </p>
                  </div>

                  {/* Lista vertical de horarios */}
                  <div className="space-y-2.5 mt-3">
                    {loading ? (
                      <p className="text-[11px] text-slate-400 text-center py-10 px-2">
                        Cargando...
                      </p>
                    ) : daySlots.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-10 px-2 leading-relaxed">
                        No hay turnos disponibles para este día.
                      </p>
                    ) : (
                      daySlots.map((item) => {
                        const isSelected = selectedSlot?.id === item.id;
                        const labelTime = (item.startTime || '').substring(
                          0,
                          5
                        );

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedDateStr(dayMeta.dateStr);
                              setSelectedSlot(item);
                            }}
                            className={
                              isSelected
                                ? 'w-full py-2 bg-[#52C47C] text-white border border-[#52C47C] rounded-lg text-xs font-bold shadow-sm transition'
                                : 'w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-[#133B5C] hover:border-[#133B5C] transition'
                            }
                          >
                            {labelTime}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Tarjeta 4: Barra Inferior de RESUMEN DE SELECCIÓN */}
      {selectedSlot && (
        <div className="bg-[#F0F7FC] rounded-xl border border-[#D0E5F5] p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Izquierda */}
            <div className="border-l-4 border-[#133B5C] pl-4 w-full md:w-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                RESUMEN DE SELECCIÓN
              </span>
              <p className="text-sm font-extrabold text-[#133B5C] mt-0.5">
                📅 {selectedDayMeta.fullDayName} {selectedDayMeta.dayNumber} de{' '}
                {selectedDayMeta.monthName} de {selectedDayMeta.year},{' '}
                {(selectedSlot.startTime || '').substring(0, 5)} HS
              </p>
              <p className="text-[11px] text-slate-500">
                Clínica San Rafael - Sede Central Consultorio 402 • Duración: 30
                min
              </p>
            </div>

            {/* Centro / Input compacto de Motivo de Consulta */}
            <div className="w-full md:w-auto">
              <input
                type="text"
                minLength={5}
                maxLength={300}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo de consulta (ej. Control general)"
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs w-full md:w-64 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
              />
            </div>

            {/* Derecha */}
            <button
              type="button"
              disabled={loading}
              onClick={book}
              className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold text-xs px-6 py-3 rounded-lg flex items-center justify-center gap-2 shrink-0 w-full md:w-auto transition disabled:opacity-50"
            >
              <span>{loading ? 'Confirmando...' : 'Confirmar Turno'}</span>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientHome;

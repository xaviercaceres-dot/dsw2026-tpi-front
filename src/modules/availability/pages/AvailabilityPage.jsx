import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getDoctorAvailabilities,
  getDoctors,
} from '../../doctors/services/doctorsApi';
import { updateAvailability } from '../services/availabilityApi';
import { getApiError } from '../../shared/api/apiError';

const DAYS_OF_WEEK = [
  { key: 'LUNES', label: 'Lunes' },
  { key: 'MARTES', label: 'Martes' },
  { key: 'MIÉRCOLES', label: 'Miércoles' },
  { key: 'JUEVES', label: 'Jueves' },
  { key: 'VIERNES', label: 'Viernes' },
  { key: 'SÁBADO', label: 'Sábado' },
  { key: 'DOMINGO', label: 'Domingo' },
];

const REVERSE_DAY_MAP = {
  0: 'DOMINGO',
  1: 'LUNES',
  2: 'MARTES',
  3: 'MIÉRCOLES',
  4: 'JUEVES',
  5: 'VIERNES',
  6: 'SÁBADO',
};

function createDefaultSchedule() {
  return DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.key] = {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
    };

    return acc;
  }, {});
}

function toMinutes(timeStr) {
  if (!timeStr) return 0;

  const [hours, minutes] = timeStr.substring(0, 5).split(':').map(Number);

  return hours * 60 + minutes;
}

function buildScheduleFromData(items) {
  const initialSchedule = createDefaultSchedule();

  if (!Array.isArray(items) || items.length === 0) {
    return initialSchedule;
  }

  const groupedByDay = {};

  items.forEach((slot) => {
    let dayName = null;

    if (slot.day !== undefined && slot.day !== null) {
      if (typeof slot.day === 'number') {
        dayName = REVERSE_DAY_MAP[slot.day];
      } else {
        dayName = String(slot.day).trim().toUpperCase();
      }
    } else if (slot.date) {
      const datePart = String(slot.date).substring(0, 10);
      const [year, month, day] = datePart.split('-').map(Number);
      const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

      dayName = REVERSE_DAY_MAP[dayIndex];
    }

    if (!dayName || !initialSchedule[dayName]) return;

    const start = slot.startTime ? slot.startTime.substring(0, 5) : '09:00';
    const end = slot.endTime ? slot.endTime.substring(0, 5) : '17:00';

    if (!groupedByDay[dayName]) {
      groupedByDay[dayName] = { startTime: start, endTime: end };
    } else {
      if (start < groupedByDay[dayName].startTime) {
        groupedByDay[dayName].startTime = start;
      }

      if (end > groupedByDay[dayName].endTime) {
        groupedByDay[dayName].endTime = end;
      }
    }
  });

  Object.keys(groupedByDay).forEach((dayName) => {
    initialSchedule[dayName] = {
      enabled: true,
      startTime: groupedByDay[dayName].startTime,
      endTime: groupedByDay[dayName].endTime,
    };
  });

  return initialSchedule;
}

function AvailabilityPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialDoctorIdParam = searchParams.get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(initialDoctorIdParam);
  const [schedule, setSchedule] = useState(createDefaultSchedule);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchAvailabilities = async (selectedId) => {
    if (!selectedId) {
      setSchedule(createDefaultSchedule());

      return;
    }

    setLoadingSchedule(true);
    setError('');
    try {
      const data = await getDoctorAvailabilities(selectedId);

      setSchedule(buildScheduleFromData(data));
    } catch (requestError) {
      setError(getApiError(requestError).message);
      setSchedule(createDefaultSchedule());
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    getDoctors({ pageSize: 100, pageIndex: 1 })
      .then((result) => {
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : [];

        setDoctors(list);

        const targetId =
          initialDoctorIdParam &&
          list.some((d) => String(d.id) === String(initialDoctorIdParam))
            ? initialDoctorIdParam
            : list[0]?.id || '';

        if (targetId) {
          setDoctorId(targetId);
          fetchAvailabilities(targetId);
        }
      })
      .catch((requestError) => setError(getApiError(requestError).message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDoctorChange = (event) => {
    const selectedId = event.target.value;

    setDoctorId(selectedId);
    setMessage('');
    setError('');
    fetchAvailabilities(selectedId);
  };

  const toggleDay = (dayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
      },
    }));
    setMessage('');
    setError('');
  };

  const updateDayTime = (dayKey, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
    setMessage('');
    setError('');
  };

  const validateSchedule = () => {
    if (!doctorId) {
      setError('Seleccioná un profesional.');

      return false;
    }

    const enabledDays = DAYS_OF_WEEK.filter((d) => schedule[d.key]?.enabled);

    if (enabledDays.length === 0) {
      setError('Debe habilitar al menos un día de disponibilidad.');

      return false;
    }

    for (const day of enabledDays) {
      const { startTime, endTime } = schedule[day.key];

      if (!startTime || !endTime || startTime >= endTime) {
        setError(
          `En ${day.label}, la hora de entrada debe ser anterior a la hora de salida.`
        );

        return false;
      }

      if (toMinutes(endTime) - toMinutes(startTime) < 30) {
        setError(
          `En ${day.label}, la diferencia entre entrada y salida debe ser de al menos 30 minutos.`
        );

        return false;
      }
    }

    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!validateSchedule()) return;

    setSaving(true);
    try {
      const enabledPayload = DAYS_OF_WEEK.filter((d) =>
        Boolean(schedule[d.key]?.enabled)
      ).map((d) => ({
        day: d.key,
        startTime: schedule[d.key].startTime.substring(0, 5),
        endTime: schedule[d.key].endTime.substring(0, 5),
      }));

      await updateAvailability({
        doctorId,
        days: enabledPayload,
      });

      await fetchAvailabilities(doctorId);
      setMessage('Disponibilidad guardada correctamente.');
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSaving(false);
    }
  };

  const selectedDoctor = doctors.find(
    (doc) => String(doc.id) === String(doctorId)
  );

  return (
    <div>
      {/* 1. Breadcrumb superior */}
      <div className="flex items-center gap-2">
        <span
          onClick={() => navigate('/admin/doctors')}
          className="text-xs text-slate-400 cursor-pointer hover:underline"
        >
          Doctores
        </span>
        <span className="text-xs text-slate-400">›</span>
        <span className="text-xs font-bold text-[#133B5C]">
          Disponibilidad Horaria
        </span>
      </div>

      {/* 2. Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-[#0F2942] mt-2">
          Gestionar Disponibilidad Horaria
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina los días y rangos horarios de atención para el profesional
          seleccionado.
        </p>
      </div>

      {/* 3. Grilla de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Columna Izquierda */}
        <div className="lg:col-span-4 space-y-4">
          {/* Tarjeta 1: Seleccionar Profesional */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <label className="text-xs font-bold text-[#133B5C] mb-2 block">
              Seleccionar Profesional
            </label>
            <select
              value={doctorId}
              onChange={handleDoctorChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            >
              <option value="">Seleccionar médico</option>
              {doctors.map((doctor) => {
                const specName =
                  doctor.specialty?.name || doctor.specialty || 'General';

                return (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {specName}
                  </option>
                );
              })}
            </select>

            {selectedDoctor && (
              <div className="mt-4 bg-[#EBF5FB] rounded-xl p-3.5 flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                  👨‍⚕️
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-[#133B5C] text-xs leading-snug truncate">
                    {selectedDoctor.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    ID:{' '}
                    {selectedDoctor.licenseNumber ||
                      selectedDoctor.license_number ||
                      'MED-99201'}
                  </p>
                  <p className="text-[11px] font-bold text-[#133B5C] mt-0.5">
                    Sede Central
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tarjeta 2: Caja informativa */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex items-start gap-3">
            <svg
              className="text-[#133B5C] w-5 h-5 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-slate-600 leading-relaxed">
              Los cambios realizados se aplicarán a partir de la próxima semana
              calendario. Las citas ya programadas no se verán afectadas
              automáticamente.
            </p>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
          >
            {/* Cabecera */}
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h2 className="text-sm font-bold text-[#133B5C]">
                Configuración de Horarios
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Intervalos automáticos de 30 minutos</span>
              </div>
            </div>

            {/* Cabecera de tabla */}
            <div className="bg-[#DCEEFB] px-6 py-2.5 grid grid-cols-12 text-[11px] font-bold text-[#133B5C] uppercase">
              <div className="col-span-3">DÍA</div>
              <div className="col-span-3">ESTADO</div>
              <div className="col-span-3">ENTRADA</div>
              <div className="col-span-3">SALIDA</div>
            </div>

            {/* Filas por cada día */}
            <div className="divide-y divide-slate-100">
              {loadingSchedule ? (
                <div className="px-6 py-8 text-center text-xs text-slate-400">
                  Cargando disponibilidad actual...
                </div>
              ) : (
                DAYS_OF_WEEK.map((day) => {
                  const dayData = schedule[day.key] || {
                    enabled: false,
                    startTime: '09:00',
                    endTime: '17:00',
                  };
                  const isActive = Boolean(dayData.enabled);

                  return (
                    <div
                      key={day.key}
                      className="px-6 py-3.5 grid grid-cols-12 items-center gap-2"
                    >
                      {/* DÍA */}
                      <div className="col-span-3">
                        <span
                          className={`text-xs font-semibold ${
                            isActive ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {day.label}
                        </span>
                      </div>

                      {/* ESTADO */}
                      <div className="col-span-3 flex items-center gap-2.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          onClick={() => toggleDay(day.key)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            isActive ? 'bg-[#133B5C]' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={
                            isActive
                              ? 'text-xs font-bold text-[#133B5C]'
                              : 'text-xs text-slate-400'
                          }
                        >
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      {/* ENTRADA */}
                      <div className="col-span-3">
                        <input
                          type="time"
                          disabled={!isActive}
                          value={dayData.startTime}
                          onChange={(e) =>
                            updateDayTime(day.key, 'startTime', e.target.value)
                          }
                          className={`border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium w-28 sm:w-32 focus:outline-none focus:ring-1 focus:ring-[#133B5C] ${
                            isActive
                              ? 'bg-white text-slate-700'
                              : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                          }`}
                        />
                      </div>

                      {/* SALIDA */}
                      <div className="col-span-3">
                        <input
                          type="time"
                          disabled={!isActive}
                          value={dayData.endTime}
                          onChange={(e) =>
                            updateDayTime(day.key, 'endTime', e.target.value)
                          }
                          className={`border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium w-28 sm:w-32 focus:outline-none focus:ring-1 focus:ring-[#133B5C] ${
                            isActive
                              ? 'bg-white text-slate-700'
                              : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {error && (
              <div className="mx-6 my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}
            {message && (
              <div className="mx-6 my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
                {message}
              </div>
            )}

            {/* Pie de tarjeta */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/doctors')}
                className="border border-[#133B5C]/40 text-[#133B5C] px-5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#133B5C] hover:bg-[#0F2E49] text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span>
                  {saving ? 'Guardando...' : 'Guardar Disponibilidad'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AvailabilityPage;

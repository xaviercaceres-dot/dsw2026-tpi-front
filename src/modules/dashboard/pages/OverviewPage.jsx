import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointmentsByDate } from '../../appointments/services/appointmentsApi';
import { getApiError } from '../../shared/api/apiError';
import { getDoctors } from '../../doctors/services/doctorsApi';
import { getSpecialties } from '../../specialties/services/specialtiesApi';

function getLocalDate() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function OverviewPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [doctorsTotal, setDoctorsTotal] = useState(0);
  const [specialtiesCount, setSpecialtiesCount] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const pageSize = 3;

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [doctorResult, specialtyResult, appointmentResult] =
          await Promise.all([
            getDoctors({ pageSize: 100, pageIndex: 1 }),
            getSpecialties({ pageSize: 100, pageIndex: 1 }),
            getAppointmentsByDate({
              date: getLocalDate(),
              pageSize: 100,
              pageIndex: 1,
            }),
          ]);

        const doctorItems = Array.isArray(doctorResult)
          ? doctorResult
          : Array.isArray(doctorResult?.data)
            ? doctorResult.data
            : [];
        const specialtyItems = Array.isArray(specialtyResult)
          ? specialtyResult
          : Array.isArray(specialtyResult?.data)
            ? specialtyResult.data
            : [];
        const appointmentItems = Array.isArray(appointmentResult)
          ? appointmentResult
          : Array.isArray(appointmentResult?.data)
            ? appointmentResult.data
            : [];

        const bookedAppointments = appointmentItems.filter(
          (item) =>
            (item.appointmentsStatus || item.status || 'BOOKED') === 'BOOKED'
        );

        setDoctors(doctorItems);
        setDoctorsTotal(doctorResult?.total ?? doctorItems.length);
        setSpecialtiesCount(specialtyResult?.total ?? specialtyItems.length);
        setAppointmentsToday(
          appointmentItems.length > 0
            ? bookedAppointments.length
            : (appointmentResult?.total ?? 0)
        );
      } catch (requestError) {
        setError(getApiError(requestError).message);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    (doctor.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleDoctors = filteredDoctors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      {/* 1. Encabezado Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2942]">
            Vista General de Gestión
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure el personal médico y las especialidades del departamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/doctors?action=create')}
            className="bg-[#133B5C] hover:bg-[#0F2E49] text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition"
          >
            + Agregar Nuevo Doctor
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/specialties?action=create')}
            className="bg-white border border-[#133B5C] text-[#133B5C] hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-lg text-xs transition"
          >
            + Agregar Nueva Especialidad
          </button>
        </div>
      </div>

      {/* 2. Fila de 3 Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta 1 (Doctores) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#EBF4FA] text-[#133B5C] flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-1 rounded-full">
              +4 este mes
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 block">
              DOCTORES ACTIVOS
            </p>
            <p className="text-3xl font-extrabold text-[#0F2942] mt-1">
              {loading ? '...' : doctorsTotal}
            </p>
          </div>
        </div>

        {/* Tarjeta 2 (Especialidades) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#EBF4FA] text-[#133B5C] flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
              Estable
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 block">
              ESPECIALIDADES ACTIVAS
            </p>
            <p className="text-3xl font-extrabold text-[#0F2942] mt-1">
              {loading ? '...' : specialtiesCount}
            </p>
          </div>
        </div>

        {/* Tarjeta 3 (Turnos Hoy) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#EBF4FA] text-[#133B5C] flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="bg-[#E0F2FE] text-[#133B5C] text-[11px] font-bold px-2.5 py-1 rounded-full">
              Hoy
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 block">
              TURNOS CONFIRMADOS PARA HOY
            </p>
            <p className="text-3xl font-extrabold text-[#0F2942] mt-1">
              {loading ? '...' : appointmentsToday}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Tarjeta de Tabla: Directorio de Profesionales Médicos */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cabecera de la tarjeta */}
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-bold text-[#133B5C]">
            Directorio de Profesionales Médicos
          </h2>
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
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
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre..."
              aria-label="Buscar por nombre"
              className="bg-[#F4F7F9] border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs w-full sm:w-64 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#133B5C]"
            />
          </div>
        </div>

        {error && <p className="px-6 py-4 text-xs text-red-600">{error}</p>}

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F4F8FB] border-y border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">NOMBRE DEL DOCTOR</th>
                <th className="px-6 py-3.5">ESPECIALIDAD</th>
                <th className="px-6 py-3.5">ESTADO DE DISPONIBILIDAD</th>
                <th className="px-6 py-3.5 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && visibleDoctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-xs text-slate-400"
                  >
                    No hay médicos para mostrar.
                  </td>
                </tr>
              ) : (
                visibleDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#E6F2FA] text-[#133B5C] flex items-center justify-center text-base shrink-0">
                          👨‍⚕️
                        </div>
                        <span className="font-bold text-[#133B5C] text-xs">
                          {doctor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {doctor.specialty?.name ||
                        doctor.specialty ||
                        'Sin especialidad'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#DCFCE7] text-[#15803D] text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1">
                        <span>•</span>
                        <span>Activo</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/doctors')}
                        className="text-[#133B5C] font-bold text-xs hover:underline"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla */}
        <div className="bg-[#F8FAFC] px-6 py-3 border-t border-slate-200/80 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Mostrando {visibleDoctors.length} de {filteredDoctors.length}{' '}
            registros
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="w-7 h-7 border border-slate-200 bg-white rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="w-7 h-7 border border-slate-200 bg-white rounded flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;

import { instance } from '../../shared/api/axiosInstance';
import { normalizePage } from '../../shared/api/pagination';
import { getTodayIsoLocal } from '../../shared/utils/dateUtils';

// POST /api/appointments — body: { doctorId, availabilitySlotId, patient: { dni }, reason }.
export async function createAppointment(payload) {
  const response = await instance.post('/api/appointments', payload);

  return response.data;
}

// GET /api/appointments/patient?dni= — turnos activos del paciente autenticado.
export async function getPatientAppointments(dni) {
  const response = await instance.get('/api/appointments/patient', {
    params: { dni },
  });

  return Array.isArray(response.data) ? response.data : [];
}

// DELETE /api/appointments/{id} — cancela un turno en estado BOOKED.
export async function cancelAppointment(id) {
  const response = await instance.delete(`/api/appointments/${id}`);

  return response.data;
}

// GET /api/appointments?date=YYYY-MM-DD — turnos del día (administrador).
export async function getAppointmentsByDate(params = {}) {
  const queryParams = {
    pageSize: params.pageSize ?? 10,
    pageIndex: params.pageIndex ?? 1,
    date: params.date ? String(params.date).trim() : getTodayIsoLocal(),
  };

  const response = await instance.get('/api/appointments', {
    params: queryParams,
  });

  return normalizePage(response.data, queryParams);
}

// GET /api/appointments/search?specialtyId=&doctorId=&dni=&date= — búsqueda combinada (administrador).
export async function searchAppointments(params = {}) {
  const queryParams = {
    pageSize: params.pageSize ?? 10,
    pageIndex: params.pageIndex ?? 1,
  };

  ['specialtyId', 'doctorId', 'dni', 'date'].forEach((key) => {
    const value = String(params[key] ?? '').trim();

    if (value !== '') queryParams[key] = value;
  });

  const response = await instance.get('/api/appointments/search', {
    params: queryParams,
  });

  return normalizePage(response.data, queryParams);
}

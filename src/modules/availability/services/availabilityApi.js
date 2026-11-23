import { instance } from '../../shared/api/axiosInstance';

// GET /api/availabilities?doctorId=&date= → turnos (slots) del día [{ id, startTime, endTime, status }].
export async function getAvailableSlots(doctorId, date) {
  const response = await instance.get('/api/availabilities', {
    params: { doctorId, date },
  });

  return Array.isArray(response.data) ? response.data : [];
}

export async function createAvailability(payload) {
  const response = await instance.post('/api/availabilities', payload);

  return response.data;
}

export async function updateAvailability(payload) {
  const response = await instance.put('/api/availabilities', payload);

  return response.data;
}

// GET /api/doctors/{id}/availabilities → disponibilidad del mes en curso [{ id, day, startTime, endTime }].
export async function getDoctorAvailabilities(doctorId) {
  const response = await instance.get(
    `/api/doctors/${doctorId}/availabilities`
  );

  return Array.isArray(response.data) ? response.data : [];
}

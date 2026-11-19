import { instance } from '../../shared/api/axiosInstance';

// GET /api/availabilities?doctorId=&date=YYYY-MM-DD → turnos libres [{ id, startTime, endTime, status }].
export async function getAvailableSlots(doctorId, date) {
  const response = await instance.get('/api/availabilities', {
    params: { doctorId, date },
  });

  return Array.isArray(response.data) ? response.data : [];
}

// POST /api/availabilities — body: { doctorId, days: [{ day, startTime, endTime }] }.
export async function createAvailability(payload) {
  const response = await instance.post('/api/availabilities', payload);

  return response.data;
}

// PUT /api/availabilities — mismo body que el POST; sobrescribe la disponibilidad del mes.
export async function updateAvailability(payload) {
  const response = await instance.put('/api/availabilities', payload);

  return response.data;
}

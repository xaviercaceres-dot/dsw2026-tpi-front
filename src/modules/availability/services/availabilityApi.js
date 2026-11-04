import { instance } from '../../shared/api/axiosInstance';

export async function getAvailableSlots(doctorId, date) {
  const response = await instance.get('/api/availabilities', {
    params: { doctorId, date },
  });

  return response.data || [];
}

export async function createAvailability(payload) {
  const response = await instance.post('/api/availabilities', payload);

  return response.data;
}

export async function updateAvailability(payload) {
  const response = await instance.put('/api/availabilities', payload);

  return response.data;
}

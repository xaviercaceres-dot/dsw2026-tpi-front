import { instance } from '../../shared/api/axiosInstance';

export async function getDoctors(params = {}) {
  const response = await instance.get('/api/doctors', { params });

  return response.data;
}

export async function createDoctor(payload) {
  const response = await instance.post('/api/doctors', payload);

  return response.data;
}

export async function updateDoctor(id, payload) {
  const response = await instance.put(`/api/doctors/${id}`, payload);

  return response.data;
}

export async function deleteDoctor(id) {
  const response = await instance.delete(`/api/doctors/${id}`);

  return response.data;
}

export async function getDoctorAvailabilities(id) {
  const response = await instance.get(`/api/doctors/${id}/availabilities`);

  return response.data;
}

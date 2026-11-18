import { instance } from '../../shared/api/axiosInstance';

export async function getSpecialties(params = {}) {
  const response = await instance.get('/api/specialties', { params });

  return response.data;
}

export async function createSpecialty(payload) {
  const response = await instance.post('/api/specialties', payload);

  return response.data;
}

export async function updateSpecialty(id, payload) {
  const response = await instance.put(`/api/specialties/${id}`, payload);

  return response.data;
}

export async function deleteSpecialty(id) {
  const response = await instance.delete(`/api/specialties/${id}`);

  return response.data;
}

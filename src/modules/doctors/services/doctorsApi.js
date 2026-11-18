import { instance } from '../../shared/api/axiosInstance';

export async function getDoctors(params = {}) {
  const response = await instance.get('/api/doctors', { params });
  const payload = response.data;

  if (Array.isArray(payload)) {
    return {
      data: payload,
      total: payload.length,
      pageIndex: params.pageIndex || 1,
      pageSize: params.pageSize || payload.length || 10,
    };
  }

  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    total: payload?.total ?? 0,
    pageIndex: payload?.pageIndex ?? params.pageIndex ?? 1,
    pageSize: payload?.pageSize ?? params.pageSize ?? 10,
  };
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

  return Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.availabilities)
      ? response.data.availabilities
      : [];
}

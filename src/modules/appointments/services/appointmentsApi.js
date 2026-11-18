import { instance } from '../../shared/api/axiosInstance';

export async function createAppointment(payload) {
  const response = await instance.post('/api/appointments', payload);

  return response.data;
}

export async function getPatientAppointments(dni) {
  const response = await instance.get('/api/appointments/patient', {
    params: { dni },
  });

  return response.data || [];
}

export async function cancelAppointment(id) {
  const response = await instance.delete(`/api/appointments/${id}`);

  return response.data;
}

export async function getAppointmentsByDate(params) {
  const response = await instance.get('/api/appointments', { params });

  return response.data;
}

export async function searchAppointments(params) {
  const response = await instance.get('/api/appointments/search', { params });

  return response.data;
}

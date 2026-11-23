import { instance } from '../../shared/api/axiosInstance';
import { normalizePage } from '../../shared/api/pagination';

// Cuerpo esperado por el backend (DoctorModel.Request): { name, licenseNumber, specialtyId }.
function toDoctorRequest(payload = {}) {
  const license = (payload.licenseNumber ?? '').trim();

  return {
    name: (payload.name ?? '').trim(),
    licenseNumber: license === '' ? null : license,
    specialtyId: payload.specialtyId,
  };
}

// GET /api/doctors?pageSize=&pageIndex=&name= (name: entre 3 y 100 caracteres).
export async function getDoctors(params = {}) {
  const queryParams = { ...params };
  const trimmedName = String(queryParams.name ?? '').trim();

  if (trimmedName.length >= 3) queryParams.name = trimmedName;
  else delete queryParams.name;

  const response = await instance.get('/api/doctors', { params: queryParams });

  return normalizePage(response.data, queryParams);
}

export async function createDoctor(payload) {
  const response = await instance.post(
    '/api/doctors',
    toDoctorRequest(payload)
  );

  return response.data;
}

export async function updateDoctor(id, payload) {
  const response = await instance.put(
    `/api/doctors/${id}`,
    toDoctorRequest(payload)
  );

  return response.data;
}

export async function deleteDoctor(id) {
  const response = await instance.delete(`/api/doctors/${id}`);

  return response.data;
}

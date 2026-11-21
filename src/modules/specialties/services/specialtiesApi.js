import { instance } from '../../shared/api/axiosInstance';
import { normalizePage } from '../../shared/api/pagination';

// Cuerpo esperado por el backend (SpecialityModel.Request): { name, description }.
const toSpecialtyRequest = (payload) => ({
  name: (payload?.name ?? '').trim(),
  description: (payload?.description ?? '').trim(),
});

// GET /api/specialties?pageSize=&pageIndex=&name= (name: entre 3 y 100 caracteres).
export async function getSpecialties(params = {}) {
  const queryParams = { ...params };
  const trimmedName = String(queryParams.name ?? '').trim();

  if (trimmedName.length >= 3) queryParams.name = trimmedName;
  else delete queryParams.name;

  const response = await instance.get('/api/specialties', {
    params: queryParams,
  });

  return normalizePage(response.data, queryParams);
}

export async function createSpecialty(payload) {
  const response = await instance.post(
    '/api/specialties',
    toSpecialtyRequest(payload)
  );

  return response.data;
}

export async function updateSpecialty(id, payload) {
  const response = await instance.put(
    `/api/specialties/${id}`,
    toSpecialtyRequest(payload)
  );

  return response.data;
}

export async function deleteSpecialty(id) {
  const response = await instance.delete(`/api/specialties/${id}`);

  return response.data;
}

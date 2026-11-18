import { instance } from '../../shared/api/axiosInstance';

export async function getSpecialties(params = {}) {
  const queryParams = { ...params };

  if (queryParams.name !== undefined) {
    const trimmedName = String(queryParams.name).trim();

    if (trimmedName.length >= 3) {
      queryParams.name = trimmedName;
    } else {
      delete queryParams.name;
    }
  }

  const response = await instance.get('/api/specialties', {
    params: queryParams,
  });
  const payload = response.data;

  if (Array.isArray(payload)) {
    return {
      data: payload,
      total: payload.length,
      pageIndex: queryParams.pageIndex || 1,
      pageSize: queryParams.pageSize || payload.length || 10,
    };
  }

  const items = Array.isArray(payload?.data) ? payload.data : [];

  return {
    data: items,
    total: payload?.total ?? items.length,
    pageIndex: payload?.pageIndex ?? queryParams.pageIndex ?? 1,
    pageSize: payload?.pageSize ?? queryParams.pageSize ?? 10,
  };
}

export async function createSpecialty(payload) {
  const response = await instance.post('/api/specialties', {
    name: (payload?.name ?? '').trim(),
    description: (payload?.description ?? '').trim(),
  });

  return response.data;
}

export async function updateSpecialty(id, payload) {
  const response = await instance.put(`/api/specialties/${id}`, {
    name: (payload?.name ?? '').trim(),
    description: (payload?.description ?? '').trim(),
  });

  return response.data;
}

export async function deleteSpecialty(id) {
  const response = await instance.delete(`/api/specialties/${id}`);

  return response.data;
}

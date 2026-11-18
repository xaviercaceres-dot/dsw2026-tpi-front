import { instance } from '../../shared/api/axiosInstance';

function normalizeDoctorPayload(payload = {}) {
  const rawSpecialtyId = payload.specialtyId;
  const numericSpecialtyId = Number(rawSpecialtyId);
  const specialtyId =
    !Number.isNaN(numericSpecialtyId) &&
    String(rawSpecialtyId).trim() !== '' &&
    !/[a-fA-F-]/.test(String(rawSpecialtyId))
      ? numericSpecialtyId
      : rawSpecialtyId;

  const license = (
    payload.licenseNumber ??
    payload.license_number ??
    ''
  ).trim();

  return {
    name: (payload.name ?? '').trim(),
    specialtyId,
    licenseNumber: license,
    license_number: license,
  };
}

export async function getDoctors(params = {}) {
  const queryParams = { ...params };

  if (queryParams.name !== undefined) {
    const trimmedName = String(queryParams.name).trim();

    if (trimmedName.length >= 3) {
      queryParams.name = trimmedName;
    } else {
      delete queryParams.name;
    }
  }

  const response = await instance.get('/api/doctors', { params: queryParams });
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

export async function createDoctor(payload) {
  const response = await instance.post(
    '/api/doctors',
    normalizeDoctorPayload(payload)
  );

  return response.data;
}

export async function updateDoctor(id, payload) {
  const response = await instance.put(
    `/api/doctors/${id}`,
    normalizeDoctorPayload(payload)
  );

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

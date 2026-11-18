import { instance } from '../../shared/api/axiosInstance';

function getTodayString() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function normalizePaginationResult(payload, queryParams = {}) {
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

export async function createAppointment(payload) {
  const response = await instance.post('/api/appointments', payload);

  return response.data;
}

export async function getPatientAppointments(dni) {
  const response = await instance.get('/api/appointments/patient', {
    params: { dni },
  });

  return Array.isArray(response.data) ? response.data : [];
}

export async function cancelAppointment(id) {
  const response = await instance.delete(`/api/appointments/${id}`);

  return response.data;
}

export async function getAppointmentsByDate(params = {}) {
  const queryParams = {
    pageSize: params.pageSize ?? 10,
    pageIndex: params.pageIndex ?? 1,
    date: params.date ? String(params.date).trim() : getTodayString(),
  };

  const response = await instance.get('/api/appointments', {
    params: queryParams,
  });

  return normalizePaginationResult(response.data, queryParams);
}

export async function searchAppointments(params = {}) {
  const criteria = {};

  if (
    params.specialtyId !== undefined &&
    String(params.specialtyId).trim() !== ''
  ) {
    const rawSpecialty = String(params.specialtyId).trim();
    const numericSpecialty = Number(rawSpecialty);

    if (!Number.isNaN(numericSpecialty) && !/[a-fA-F-]/.test(rawSpecialty)) {
      if (numericSpecialty > 0) {
        criteria.specialtyId = numericSpecialty;
      }
    } else {
      criteria.specialtyId = rawSpecialty;
    }
  }

  if (params.doctorId !== undefined && String(params.doctorId).trim() !== '') {
    criteria.doctorId = String(params.doctorId).trim();
  }

  if (params.dni !== undefined && String(params.dni).trim() !== '') {
    const rawDni = String(params.dni).trim();

    if (/^\d{7,8}$/.test(rawDni)) {
      criteria.dni = Number(rawDni);
    }
  }

  if (params.date !== undefined && String(params.date).trim() !== '') {
    criteria.date = String(params.date).trim();
  }

  const criteriaKeys = Object.keys(criteria);

  if (criteriaKeys.length === 0) {
    return getAppointmentsByDate({
      date: getTodayString(),
      pageSize: params.pageSize,
      pageIndex: params.pageIndex,
    });
  }

  const queryParams = {
    pageSize: params.pageSize ?? 10,
    pageIndex: params.pageIndex ?? 1,
    ...criteria,
  };

  if (criteriaKeys.length === 1 && criteria.date) {
    return getAppointmentsByDate(queryParams);
  }

  const response = await instance.get('/api/appointments/search', {
    params: queryParams,
  });

  return normalizePaginationResult(response.data, queryParams);
}

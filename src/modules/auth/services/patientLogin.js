import { instance } from '../../shared/api/axiosInstance';

export const loginPatient = async (email, dni) => {
  const response = await instance.post('/api/auth/patient/login', {
    email,
    dni: Number(dni),
  });

  return { data: response.data, error: null };
};

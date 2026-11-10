import { instance } from '../../shared/api/axiosInstance';

export const loginPatient = async (username, password) => {
  try {
    const response = await instance.post('api/auth/patient/login', {
      email: username,
      dni: Number(password),
    });

    return { data: response.data.token, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

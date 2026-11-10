import { instance } from '../../shared/api/axiosInstance';

export const loginAdmin = async (username, password) => {
  try {
    const response = await instance.post('api/auth/admin/login', {
      email: username,
      password: password,
    });

    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

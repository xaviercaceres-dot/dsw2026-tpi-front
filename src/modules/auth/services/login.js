import { instance } from '../../shared/api/axiosInstance';

export const login = async (username, password) => {
  try {
    const response = await instance.post('api/auth/login', {
      email: username,
      password: password,
    });

    return { data: response.data.token, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

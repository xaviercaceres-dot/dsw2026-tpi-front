import { instance } from '../../shared/api/axiosInstance';

export const loginAdmin = async (username, password) => {
  const response = await instance.post('api/auth/admin/login', {
    email: username,
    password: password,
  });

  return { data: response.data.token, error: null };
};

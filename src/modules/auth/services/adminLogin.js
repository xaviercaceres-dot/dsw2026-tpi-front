import { instance } from '../../shared/api/axiosInstance';

export const loginAdmin = async (email, password) => {
  const response = await instance.post('/api/auth/admin/login', {
    email,
    password,
  });

  return { data: response.data, error: null };
};

import { instance } from '../../shared/api/axiosInstance';

export const registerAdmin = async (email, password) => {
  const response = await instance.post('/api/auth/admin/register', {
    email,
    password,
  });

  return response.data;
};

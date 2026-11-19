import { instance } from '../../shared/api/axiosInstance';

// El backend revoca los tokens emitidos al usuario (renueva su sello de seguridad).
export const logout = async () => {
  const response = await instance.post('/api/auth/logout');

  return response.data;
};

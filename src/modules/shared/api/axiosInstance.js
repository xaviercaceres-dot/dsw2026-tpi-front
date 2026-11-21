import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Evita redirecciones repetidas cuando varias solicitudes simultáneas reciben 401.
let redirectingToLogin = false;

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      const isAdminPath = window.location.pathname.startsWith('/admin');
      const isPublicPath =
        window.location.pathname === '/login' ||
        window.location.pathname === '/admin/login';

      if (!isPublicPath && !redirectingToLogin) {
        redirectingToLogin = true;
        window.location.href = isAdminPath ? '/admin/login' : '/login';
      }
    }

    return Promise.reject(error);
  }
);

export { instance };

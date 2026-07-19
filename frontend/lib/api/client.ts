import axios from 'axios';

const apiBase =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: apiBase.endsWith('/api') ? apiBase : `${apiBase.replace(/\/$/, '')}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Backend TransformInterceptor: { success, data, timestamp, path }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const payload = error.response?.data;
    if (payload) {
      const msg =
        payload.message ||
        (typeof payload.details === 'object' &&
          (payload.details.message ||
            (Array.isArray(payload.details.message)
              ? payload.details.message.join(', ')
              : null))) ||
        payload.error;
      if (msg) {
        error.message = Array.isArray(msg) ? msg.join(', ') : String(msg);
      }
    }

    if (error.response?.status === 429) {
      if (!error.message || error.message === 'Request failed with status code 429') {
        error.message = 'Muitas tentativas. Aguarde e tente novamente.';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const base = apiClient.defaults.baseURL || 'http://localhost:3001/api';
        const response = await axios.post(`${base}/auth/refresh`, {
          refreshToken,
        });

        const payload = response.data?.data || response.data;
        const accessToken = payload.accessToken;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

import axiosInstance from './axiosInstance';

export const authApi = {
  register: (email, password, fullName) => {
    return axiosInstance.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
    });
  },

  login: (email, password) => {
    return axiosInstance.post('/api/auth/login', {
      email,
      password,
    });
  },

  getMe: () => {
    return axiosInstance.get('/api/auth/me');
  },
};

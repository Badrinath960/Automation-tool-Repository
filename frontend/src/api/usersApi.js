import axiosInstance from './axiosInstance';

export const usersApi = {
  getUsers: (params = {}) => {
    return axiosInstance.get('/api/users', { params });
  },

  updateUserRole: (userId, role) => {
    return axiosInstance.put(`/api/users/${userId}/role`, { role });
  },

  deleteUser: (userId) => {
    return axiosInstance.delete(`/api/users/${userId}`);
  },

  getUserDownloads: (userId, params = {}) => {
    return axiosInstance.get(`/api/users/${userId}/downloads`, { params });
  },
};

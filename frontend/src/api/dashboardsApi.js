import axiosInstance from './axiosInstance';

export const dashboardsApi = {
  getDashboards: (params = {}) => {
    return axiosInstance.get('/api/dashboards', { params });
  },

  getDashboard: (dashboardId) => {
    return axiosInstance.get(`/api/dashboards/${dashboardId}`);
  },

  // Admin endpoints
  createDashboard: (formData) => {
    return axiosInstance.post('/api/dashboards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateDashboard: (dashboardId, formData) => {
    return axiosInstance.put(`/api/dashboards/${dashboardId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteDashboard: (dashboardId) => {
    return axiosInstance.delete(`/api/dashboards/${dashboardId}`);
  },
};

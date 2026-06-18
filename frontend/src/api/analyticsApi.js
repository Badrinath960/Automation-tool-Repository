import axiosInstance from './axiosInstance';

export const analyticsApi = {
  getOverview: () => {
    return axiosInstance.get('/api/analytics/overview');
  },

  getTrends: (days = 30) => {
    return axiosInstance.get('/api/analytics/downloads', {
      params: { days },
    });
  },

  getTopTools: (limit = 10) => {
    return axiosInstance.get('/api/analytics/top-tools', {
      params: { limit },
    });
  },

  getUserActivity: (days = 30) => {
    return axiosInstance.get('/api/analytics/user-activity', {
      params: { days },
    });
  },

  getRecentDownloads: (limit = 20) => {
    return axiosInstance.get('/api/analytics/recent-downloads', {
      params: { limit },
    });
  },

  exportCsv: (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return axiosInstance.get('/api/analytics/export-csv', {
      params,
      responseType: 'blob',
    });
  },

  getCategories: () => {
    return axiosInstance.get('/api/analytics/categories');
  },

  createCategory: (data) => {
    return axiosInstance.post('/api/analytics/categories', data);
  },

  deleteCategory: (categoryId) => {
    return axiosInstance.delete(`/api/analytics/categories/${categoryId}`);
  },
};

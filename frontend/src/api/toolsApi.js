import axiosInstance from './axiosInstance';

export const toolsApi = {
  getTools: (params = {}) => {
    return axiosInstance.get('/api/tools', { params });
  },

  getCategories: () => {
    return axiosInstance.get('/api/tools/categories');
  },

  getTool: (toolId) => {
    return axiosInstance.get(`/api/tools/${toolId}`);
  },

  downloadTool: (toolId) => {
    return axiosInstance.get(`/api/tools/${toolId}/download`, {
      responseType: 'blob',
    });
  },

  downloadToolVersion: (toolId, versionNumber) => {
    return axiosInstance.get(`/api/tools/${toolId}/versions/${versionNumber}/download`, {
      responseType: 'blob',
    });
  },

  // Admin endpoints
  createTool: (formData) => {
    return axiosInstance.post('/api/tools', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateTool: (toolId, formData) => {
    return axiosInstance.put(`/api/tools/${toolId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteTool: (toolId) => {
    return axiosInstance.delete(`/api/tools/${toolId}`);
  },

  uploadVersion: (toolId, formData) => {
    return axiosInstance.post(`/api/tools/${toolId}/version`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

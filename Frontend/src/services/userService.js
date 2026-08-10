import api from './api';

export const userService = {
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  updateUserProfile: async (userId, data) => {
    const response = await api.put(`/users/${userId}/profile`, data);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get('/users/search', { params: { query } });
    return response.data;
  }
};

import api from './api';

export const getDashboardStats = async (adminUserId) => {
  const response = await api.get(`/admin/dashboard/stats?adminUserId=${adminUserId}`);
  return response.data;
};

// --- Users ---
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const banUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/ban`);
  return response.data;
};

export const unbanUser = async (userId) => {
  const response = await api.put(`/admin/users/${userId}/unban`);
  return response.data;
};

// --- Teams ---
export const getAllTeamsAdmin = async () => {
  const response = await api.get('/admin/teams');
  return response.data;
};

export const deleteTeamAdmin = async (teamId) => {
  const response = await api.delete(`/admin/teams/${teamId}`);
  return response.data;
};

import api from './api';

export const teamService = {
  getAllTeams: async () => {
    const response = await api.get('/teams');
    return response.data;
  },

  getTeamDetails: async (teamId) => {
    const response = await api.get(`/teams/${teamId}`);
    return response.data;
  },

  getTeamsByCaptain: async (captainId) => {
    const response = await api.get(`/teams/captain/${captainId}`);
    return response.data;
  },

  joinTeam: async (teamId, userId, inGameName) => {
    try {
      const response = await api.post(`/teams/${teamId}/join`, { userId, inGameName });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approveJoinRequest: async (teamId, memberId, captainId) => {
    const response = await api.put(`/teams/${teamId}/members/${memberId}/approve`, null, {
      params: { captainId }
    });
    return response.data;
  },

  rejectJoinRequest: async (teamId, memberId, captainId) => {
    const response = await api.put(`/teams/${teamId}/members/${memberId}/reject`, null, {
      params: { captainId }
    });
    return response.data;
  },

  kickMember: async (teamId, memberId, captainId) => {
    const response = await api.delete(`/teams/${teamId}/members/${memberId}/kick`, {
      params: { captainId }
    });
    return response.data;
  }
};

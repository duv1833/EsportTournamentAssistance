import api from './api';

// === Internal Match APIs (our own bracket system) ===

export const getAllUpcomingMatches = async () => {
  const response = await api.get('/matches');
  return response.data;
};

export const getMatchesByTournament = async (tournamentId) => {
  const response = await api.get(`/matches/tournament/${tournamentId}`);
  return response.data;
};

export const generateBracket = async (tournamentId, userId, payload) => {
  const response = await api.post(`/matches/tournament/${tournamentId}/generate`, payload, {
    params: { userId }
  });
  return response.data;
};

export const updateMatchResult = async (matchId, data, userId) => {
  const response = await api.put(`/matches/${matchId}/score`, data, {
    params: { userId }
  });
  return response.data;
};

// === External Match APIs (PandaScore proxy) ===

export const getExternalUpcomingMatches = async (page = 1, perPage = 20) => {
  const response = await api.get('/external/matches/upcoming', {
    params: { page, perPage }
  });
  return response.data;
};

export const getExternalRunningMatches = async (page = 1, perPage = 20) => {
  const response = await api.get('/external/matches/running', {
    params: { page, perPage }
  });
  return response.data;
};

export const getExternalPastMatches = async (page = 1, perPage = 20) => {
  const response = await api.get('/external/matches/past', {
    params: { page, perPage }
  });
  return response.data;
};

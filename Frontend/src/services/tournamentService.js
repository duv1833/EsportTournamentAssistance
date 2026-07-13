import api from './api';

export const getAllTournaments = async () => {
  const response = await api.get('/tournaments');
  return response.data;
};

export const getTournamentDetails = async (id) => {
  const response = await api.get(`/tournaments/${id}`);
  return response.data;
};

export const createTournament = async (name, format, maxTeams, rulesDescription, creatorId) => {
  const response = await api.post('/tournaments', { name, format, maxTeams, rulesDescription, creatorId });
  return response.data;
};

export const registerForTournament = async (tournamentId, teamName, teamTag, userId) => {
  const response = await api.post(`/tournaments/${tournamentId}/register`, { teamName, teamTag, userId });
  return response.data;
};

export const getTournamentRegistrations = async (tournamentId, organizerUserId) => {
  const response = await api.get(`/tournaments/${tournamentId}/registrations`, { params: { organizerUserId } });
  return response.data;
};

export const approveRegistration = async (tournamentId, teamId, organizerUserId) => {
  const response = await api.put(`/tournaments/${tournamentId}/registrations/${teamId}/approve`, null, { params: { organizerUserId } });
  return response.data;
};

export const rejectRegistration = async (tournamentId, teamId, organizerUserId) => {
  const response = await api.put(`/tournaments/${tournamentId}/registrations/${teamId}/reject`, null, { params: { organizerUserId } });
  return response.data;
};


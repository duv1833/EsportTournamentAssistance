import api from './api';

export const getAllTournaments = async () => {
  const response = await api.get('/tournaments');
  return response.data;
};

export const getTournamentDetails = async (id) => {
  const response = await api.get(`/tournaments/${id}`);
  return response.data;
};

export const createTournament = async (name, maxTeams, rulesDescription, creatorId) => {
  const response = await api.post('/tournaments', { name, maxTeams, rulesDescription, creatorId });
  return response.data;
};

export const registerForTournament = async (tournamentId, teamName, teamTag, userId, captainInGameName, logoUrl, captainPhoneNumber) => {
  const response = await api.post(`/tournaments/${tournamentId}/register`, { 
    teamName, 
    teamTag, 
    userId, 
    captainInGameName,
    logoUrl,
    captainPhoneNumber
  });
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

// Admin endpoints
export const getAdminTournaments = async (adminUserId) => {
  const response = await api.get('/tournaments/admin/all', { params: { adminUserId } });
  return response.data;
};

export const approveTournament = async (tournamentId, adminUserId) => {
  const response = await api.put(`/tournaments/${tournamentId}/approve-tournament`, null, { params: { adminUserId } });
  return response.data;
};

export const rejectTournament = async (tournamentId, adminUserId) => {
  const response = await api.put(`/tournaments/${tournamentId}/reject-tournament`, null, { params: { adminUserId } });
  return response.data;
};

export const updateTournamentByAdmin = async (tournamentId, data, adminUserId) => {
  const response = await api.put(`/tournaments/${tournamentId}/admin-update`, data, { params: { adminUserId } });
  return response.data;
};

export const deleteTournamentByAdmin = async (tournamentId, adminUserId) => {
  const response = await api.delete(`/tournaments/${tournamentId}/admin-delete`, { params: { adminUserId } });
  return response.data;
};


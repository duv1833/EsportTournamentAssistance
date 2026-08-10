import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { teamService } from '../services/teamService';
import { getAllUpcomingMatches } from '../services/matchService';
import { getAllTournaments } from '../services/tournamentService';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load saved read IDs for current user from localStorage
  useEffect(() => {
    if (currentUser?.id) {
      const saved = localStorage.getItem(`read_notifications_${currentUser.id}`);
      if (saved) {
        try {
          setReadIds(new Set(JSON.parse(saved)));
        } catch (e) {
          setReadIds(new Set());
        }
      } else {
        setReadIds(new Set());
      }
    } else {
      setReadIds(new Set());
      setNotifications([]);
    }
  }, [currentUser?.id]);

  // Save read IDs when updated
  const saveReadIds = (newSet) => {
    setReadIds(newSet);
    if (currentUser?.id) {
      localStorage.setItem(`read_notifications_${currentUser.id}`, JSON.stringify(Array.from(newSet)));
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    const newNotifications = [];

    try {
      // 1. Fetch Teams for Invitations and Join Requests
      const resTeams = await teamService.getAllTeams();
      const allTeams = (resTeams?.success && resTeams?.data) ? resTeams.data : (Array.isArray(resTeams) ? resTeams : []);

      allTeams.forEach(team => {
        const isCaptain = (team.captainId && team.captainId === currentUser.id) ||
                          (team.captainUsername && team.captainUsername === currentUser.username);
        const isAdminOrOrg = ['ADMIN', 'ORGANIZER'].includes(currentUser.globalRole);

        if (isCaptain) {
          // Notification for Team Captain about team creation
          newNotifications.push({
            id: `team-created-self-${team.id}`,
            type: 'TEAM_CREATED',
            title: '🛡️ TẠO ĐỘI TUYỂN THÀNH CÔNG',
            message: `Bạn đã khởi tạo thành công đội tuyển ${team.name} (${team.tag || 'TEAM'}). Hãy mời các thành viên tham gia!`,
            timestamp: team.createdAt || new Date().toISOString(),
            teamId: team.id,
            teamName: team.name,
            link: '/manage-team',
            actionLabel: 'QUẢN LÝ ĐỘI'
          });

          // Check for pending join requests from others
          const pendingMembers = team.members?.filter(
            m => (m.status === 'INVITED' || m.status === 'PENDING') && m.userId !== currentUser.id
          ) || [];

          pendingMembers.forEach(member => {
            const notifId = `request-${team.id}-${member.id}`;
            newNotifications.push({
              id: notifId,
              type: 'JOIN_REQUEST',
              title: 'Yêu Cầu Gia Nhập Đội',
              message: `Game thủ ${member.username || member.inGameName || 'Người chơi'} muốn tham gia đội ${team.name}.`,
              timestamp: new Date().toISOString(),
              teamId: team.id,
              teamName: team.name,
              memberId: member.id,
              captainId: currentUser.id,
              link: '/manage-team',
              hasActions: true
            });
          });
        } else {
          // If member, check if current user is invited or joined
          const myMembership = team.members?.find(
            m => m.userId === currentUser.id && (m.status === 'INVITED' || m.status === 'PENDING')
          );

          if (myMembership) {
            const notifId = `invite-${team.id}-${myMembership.id}`;
            newNotifications.push({
              id: notifId,
              type: 'TEAM_INVITE',
              title: 'Lời Mời Gia Nhập Đội',
              message: `Bạn nhận được lời mời gia nhập đội tuyển ${team.name} (${team.tag || 'TEAM'}).`,
              timestamp: new Date().toISOString(),
              teamId: team.id,
              teamName: team.name,
              memberId: myMembership.id,
              captainId: team.captainId,
              link: '/manage-team',
              hasActions: true
            });
          }

          const acceptedMembership = team.members?.find(
            m => m.userId === currentUser.id && (m.status === 'ACCEPTED' || m.status === 'APPROVED')
          );
          if (acceptedMembership) {
            newNotifications.push({
              id: `team-joined-${team.id}-${currentUser.id}`,
              type: 'TEAM_JOINED',
              title: '🛡️ THÀNH VIÊN ĐỘI TUYỂN',
              message: `Bạn hiện là thành viên chính thức của đội tuyển ${team.name} (${team.tag || 'TEAM'}).`,
              timestamp: new Date().toISOString(),
              teamId: team.id,
              teamName: team.name,
              link: '/manage-team',
              actionLabel: 'XEM ĐỘI'
            });
          }
        }

        // Notification for Admin / Organizers when any user creates a team
        if (isAdminOrOrg && !isCaptain) {
          newNotifications.push({
            id: `team-created-admin-${team.id}`,
            type: 'TEAM_CREATED_ADMIN',
            title: '🛡️ ĐỘI TUYỂN MỚI ĐƯỢC TẠO',
            message: `Game thủ ${team.captainUsername || 'Captain'} vừa tạo đội tuyển mới "${team.name}" (${team.tag || 'TEAM'}).`,
            timestamp: team.createdAt || new Date().toISOString(),
            teamId: team.id,
            teamName: team.name,
            link: '/teams',
            actionLabel: 'XEM ĐỘI TUYỂN'
          });
        }
      });

      // 2. Fetch Matches for Upcoming & Live Match Reminders
      const resMatches = await getAllUpcomingMatches();
      const allMatches = (resMatches?.success && resMatches?.data) ? resMatches.data : (Array.isArray(resMatches) ? resMatches : []);

      const isRefOrAdmin = ['ADMIN', 'ORGANIZER', 'REFEREE'].includes(currentUser.globalRole);

      allMatches.forEach(match => {
        // User's teams in this match
        const userTeamsInMatch = allTeams.filter(
          t => (t.id === match.team1Id || t.id === match.team2Id) &&
               t.members?.some(m => m.userId === currentUser.id && (m.status === 'ACCEPTED' || m.status === 'APPROVED'))
        );
        const isParticipant = userTeamsInMatch.length > 0 || isRefOrAdmin;

        if (isParticipant) {
          if (match.status === 'LIVE') {
            newNotifications.push({
              id: `match-live-${match.id}`,
              type: 'MATCH_LIVE',
              title: '🔴 TRẬN ĐẤU ĐANG DIỄN RA!',
              message: `Trận đấu giữa ${match.team1Name || 'TBD'} và ${match.team2Name || 'TBD'} (${match.tournamentName || 'Giải đấu'}) đang ở phòng Ban/Pick.`,
              timestamp: match.scheduledTime || new Date().toISOString(),
              matchId: match.id,
              link: `/lobby/${match.id}`,
              actionLabel: 'VÀO BAN/PICK'
            });
          } else if (match.status === 'PENDING') {
            newNotifications.push({
              id: `match-upcoming-${match.id}`,
              type: 'MATCH_UPCOMING',
              title: '⚡ LỊCH THI ĐẤU SẮP TỚI',
              message: `Trận đấu ${match.team1Name || 'TBD'} vs ${match.team2Name || 'TBD'} (${match.tournamentName || 'Giải đấu'}) chuẩn bị diễn ra.`,
              timestamp: match.scheduledTime || new Date().toISOString(),
              matchId: match.id,
              link: `/lobby/${match.id}`,
              actionLabel: 'XEM CHI TIẾT'
            });
          }
        }
      });

      // 3. Fetch Tournaments for Registration Notifications
      try {
        const resTournaments = await getAllTournaments();
        const allTournaments = (resTournaments?.success && resTournaments?.data) 
          ? resTournaments.data 
          : (Array.isArray(resTournaments) ? resTournaments : []);

        allTournaments.forEach(tour => {
          const isCreator = (tour.creatorId && tour.creatorId === currentUser.id) ||
                            (tour.creatorUsername && tour.creatorUsername === currentUser.username);
          const isOrganizerRole = ['ADMIN', 'ORGANIZER'].includes(currentUser.globalRole);

          if (tour.registeredTeams && Array.isArray(tour.registeredTeams)) {
            tour.registeredTeams.forEach(registeredTeam => {
              // Notification for Tournament Creator / Organizer when a team registers
              if (isCreator || isOrganizerRole) {
                const regStatusText = registeredTeam.registrationStatus === 'APPROVED' ? 'Đã duyệt' :
                                      registeredTeam.registrationStatus === 'REJECTED' ? 'Đã từ chối' : 'Chờ duyệt';
                
                newNotifications.push({
                  id: `tour-reg-${tour.id}-${registeredTeam.id || registeredTeam.teamId}`,
                  type: 'TOURNAMENT_REGISTRATION',
                  title: '🏆 ĐĂNG KÝ GIẢI ĐẤU MỚI',
                  message: `Đội tuyển ${registeredTeam.name || registeredTeam.teamName} (${registeredTeam.tag || 'TEAM'}) đã đăng ký tham gia giải đấu "${tour.name}". Trạng thái: ${regStatusText}.`,
                  timestamp: registeredTeam.registeredAt || tour.createdAt || new Date().toISOString(),
                  tournamentId: tour.id,
                  tournamentName: tour.name,
                  teamName: registeredTeam.name || registeredTeam.teamName,
                  link: `/tournaments/${tour.id}`,
                  actionLabel: 'XEM CHI TIẾT'
                });
              }

              // Notification for Team Captain / Members about their team's registration
              const isUserInTeam = (registeredTeam.captainId && registeredTeam.captainId === currentUser.id) ||
                                   (registeredTeam.captainUsername && registeredTeam.captainUsername === currentUser.username) ||
                                   (registeredTeam.members && registeredTeam.members.some(m => m.userId === currentUser.id));

              if (isUserInTeam) {
                const statusLabel = registeredTeam.registrationStatus === 'APPROVED' ? 'đã được Ban Tổ Chức DUYỆT!' :
                                    registeredTeam.registrationStatus === 'REJECTED' ? 'đã bị Ban Tổ Chức TỪ CHỐI.' :
                                    'đã gửi thành công và đang chờ duyệt.';
                newNotifications.push({
                  id: `tour-user-reg-${tour.id}-${registeredTeam.id || registeredTeam.teamId}-${registeredTeam.registrationStatus || 'PENDING'}`,
                  type: 'TOURNAMENT_REGISTRATION_USER',
                  title: '📢 TRẠNG THÁI ĐĂNG KÝ GIẢI ĐẤU',
                  message: `Đăng ký của đội ${registeredTeam.name || registeredTeam.teamName} tại giải đấu "${tour.name}" ${statusLabel}`,
                  timestamp: registeredTeam.registeredAt || tour.createdAt || new Date().toISOString(),
                  tournamentId: tour.id,
                  tournamentName: tour.name,
                  link: `/tournaments/${tour.id}`,
                  actionLabel: 'XEM GIẢI ĐẤU'
                });
              }
            });
          }
        });
      } catch (errTour) {
        console.warn("Lỗi lấy giải đấu cho thông báo:", errTour);
      }

      // 4. Load custom system action notifications (Disband, Kick, Invite, etc.)
      const customKey = `custom_notifications_${currentUser.id}`;
      const savedCustom = localStorage.getItem(customKey);
      if (savedCustom) {
        try {
          const parsedCustom = JSON.parse(savedCustom);
          if (Array.isArray(parsedCustom)) {
            newNotifications.push(...parsedCustom);
          }
        } catch (e) {
          console.warn('Lỗi đọc custom notifications:', e);
        }
      }

    } catch (err) {
      console.warn('Lỗi tải thông báo:', err);
    } finally {
      setLoading(false);
    }

    // Sort all notifications by newest timestamp first
    newNotifications.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    setNotifications(newNotifications);
  }, [currentUser?.id, currentUser?.globalRole]);

  // Initial fetch and 30s poll
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const addNotification = useCallback((notif) => {
    if (!currentUser?.id) return;
    const customKey = `custom_notifications_${currentUser.id}`;
    const savedCustom = localStorage.getItem(customKey);
    let customList = [];
    if (savedCustom) {
      try {
        customList = JSON.parse(savedCustom);
      } catch (e) {
        customList = [];
      }
    }
    const newNotif = {
      id: notif.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      hasActions: false,
      ...notif
    };
    customList.unshift(newNotif);
    if (customList.length > 50) customList = customList.slice(0, 50);
    localStorage.setItem(customKey, JSON.stringify(customList));
    setNotifications(prev => [newNotif, ...prev]);
  }, [currentUser?.id]);

  const markAsRead = (id) => {
    const next = new Set(readIds);
    next.add(id);
    saveReadIds(next);
  };

  const markAllAsRead = () => {
    const next = new Set(readIds);
    notifications.forEach(n => next.add(n.id));
    saveReadIds(next);
  };

  const acceptRequest = async (teamId, memberId, captainId) => {
    try {
      const targetCaptainId = captainId || currentUser.id;
      const res = await teamService.approveJoinRequest(teamId, memberId, targetCaptainId);
      await fetchNotifications();
      return res;
    } catch (err) {
      console.error('Lỗi khi chấp nhận lời mời:', err);
      throw err;
    }
  };

  const rejectRequest = async (teamId, memberId, captainId) => {
    try {
      const targetCaptainId = captainId || currentUser.id;
      const res = await teamService.rejectJoinRequest(teamId, memberId, targetCaptainId);
      await fetchNotifications();
      return res;
    } catch (err) {
      console.error('Lỗi khi từ chối lời mời:', err);
      throw err;
    }
  };

  // Attach isRead property to notifications
  const enrichedNotifications = notifications.map(n => ({
    ...n,
    isRead: readIds.has(n.id)
  }));

  const unreadCount = enrichedNotifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: enrichedNotifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        acceptRequest,
        rejectRequest,
        addNotification,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { teamService } from '../services/teamService';
import { getAllUpcomingMatches } from '../services/matchService';

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
        const isCaptain = team.captainId === currentUser.id;

        if (isCaptain) {
          // If captain, check for pending requests from others
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
          // If member, check if current user is invited to this team
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

      // 3. Load custom system action notifications (Disband, Kick, Invite, etc.)
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

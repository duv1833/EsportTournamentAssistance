import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Calendar, Trophy, MapPin, Shield, Users, Plus, Lock, CheckCircle2, ChevronRight, Award, Zap, AlertCircle, RefreshCw, Layers, ExternalLink, UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMatchesByTournament } from '../services/matchService';
import { getTournamentDetails } from '../services/tournamentService';
import { useAuth } from '../contexts/AuthContext';
import TournamentOverview from './tournament/TournamentOverview';
import TournamentMatches from './tournament/TournamentMatches';
import TournamentAgents from './tournament/TournamentAgents';
import OrganizerDashboard from './OrganizerDashboard';
import TournamentRegistrationForm from '../components/tournament/TournamentRegistrationForm';
import TactileButton from '../components/common/TactileButton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function TournamentDetailsVLR({ onJoinTeam }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [internalMatches, setInternalMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('Overview');

  const fetchTournamentData = async () => {
    setLoading(true);
    try {
      const [tourRes, matchRes] = await Promise.all([
        getTournamentDetails(id),
        getMatchesByTournament(id)
      ]);

      if (tourRes.success) {
        setTournament(tourRes.data);
        if (tourRes.data.structure === 'GROUP_KNOCKOUT') {
          try {
            const { getGroupStandings } = await import('../services/tournamentService');
            const stRes = await getGroupStandings(id);
            if (stRes.success) setStandings(stRes.data);
          } catch (err) {
            console.error("Lỗi khi tải bảng xếp hạng:", err);
          }
        }
      }
      if (matchRes.success) setInternalMatches(matchRes.data || []);
    } catch (error) {
      console.error("Lỗi khi tải thông tin giải đấu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTournamentData();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full bg-background min-h-[calc(100vh-80px)] p-8 text-off-white container mx-auto max-w-7xl mt-12">
        <div className="max-w-[1200px] mx-auto">
          <LoadingSkeleton type="text" count={3} />
          <div className="mt-8"><LoadingSkeleton type="card" count={3} /></div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="w-full bg-background min-h-screen text-off-white flex items-center justify-center font-mono">
        Không tìm thấy giải đấu.
      </div>
    );
  }

  const tabs = ['Overview', 'Matches', 'Agents'];

  // Check if current user is in any team in this tournament
  const userTeamInTournament = tournament.registeredTeams?.find(team => {
    const isCaptain = (team.captainId && currentUser?.id && team.captainId === currentUser.id) ||
                      (team.captainUsername && currentUser?.username && team.captainUsername === currentUser.username);
    const isMember = team.members && team.members.some(m =>
      ((m.userId && currentUser?.id && m.userId === currentUser.id) ||
       (m.username && currentUser?.username && m.username === currentUser.username)) &&
      (m.status === 'APPROVED' || m.status === 'ACCEPTED' || m.status === 'PENDING' || m.status === 'INVITED')
    );
    return isCaptain || isMember;
  });

  const upcomingMatches = internalMatches.filter(m => m.status === 'PENDING' || m.status === 'LIVE').sort((a,b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  const pastMatches = internalMatches.filter(m => m.status === 'COMPLETED').sort((a,b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));
  const registeredTeams = tournament.registeredTeams || [];

  const handleBack = () => {
    navigate('/tournaments');
  };

  const handleRegister = () => {
    if (!currentUser) {
      navigate('/login');
    } else {
      navigate(`/tournaments/${id}/register`);
    }
  };

  const handleManage = () => {
    navigate(`/tournaments/${id}/manage`);
  };

  // Determine active tab from URL
  const currentPath = location.pathname;
  const isOverview = currentPath.endsWith(id) || currentPath.endsWith('overview');
  const isMatches = currentPath.endsWith('matches');
  const isAgents = currentPath.endsWith('agents');

  const getTabPath = (tab) => {
    const base = `/tournaments/${id}`;
    if (tab === 'Overview') return `${base}/overview`;
    if (tab === 'Matches') return `${base}/matches`;
    if (tab === 'Agents') return `${base}/agents`;
    return base;
  };

  return (
    <div className="w-full bg-background min-h-screen text-off-white font-body pb-16 animate-fade-in">
      {/* Header Section */}
      <div className="max-w-[1200px] mx-auto pt-6 px-4">
        {tournament.registrationStatus === 'COMPLETED' && (() => {
          const finalMatch = internalMatches.find(m => (!m.nextMatchId || m.nextMatchId === null) && (m.stage === 'KNOCKOUT' || internalMatches.length === 1));
          const championName = finalMatch && finalMatch.winnerName ? finalMatch.winnerName : (tournament.registeredTeams?.[0]?.name || 'NHÀ VÔ ĐỊCH');
          return (
            <div className="mb-6 p-4 bg-gradient-to-r from-warning-amber/20 via-warning-amber/10 to-transparent border border-warning-amber text-warning-amber clip-corner flex items-center justify-between shadow-[0_0_20px_rgba(255,191,0,0.15)] animate-pulse">
              <div className="flex items-center gap-3">
                <Trophy size={32} className="text-warning-amber animate-bounce" />
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-warning-amber/80 block">// GIẢI ĐẤU ĐÃ KẾT THÚC</span>
                  <h3 className="font-display text-2xl uppercase tracking-wider text-off-white">
                    QUÁN QUÂN: <span className="text-warning-amber font-bold">{championName}</span>
                  </h3>
                </div>
              </div>
              <span className="font-mono text-xs border border-warning-amber px-3 py-1 bg-warning-amber/20 uppercase font-bold tracking-widest">
                🏆 CHAMPION 🏆
              </span>
            </div>
          );
        })()}

        <button
          onClick={handleBack}
          className="text-tactical-gray hover:text-off-white text-xs uppercase font-bold flex items-center gap-1 mb-4 transition-colors font-mono"
        >
          <ArrowLeft size={14} /> QUAY LẠI GIẢI ĐẤU
        </button>

        <div className="bg-surface-charcoal border border-outline-variant flex flex-col md:flex-row items-start p-6 gap-6 relative clip-corner">
          {/* Logo */}
          <div className="w-32 h-32 bg-surface-bright flex items-center justify-center shrink-0 border border-outline-variant">
            <Trophy className="text-primary-red w-16 h-16" />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-success-cyan font-bold">// ID: {tournament.id}</span>
              <span className="font-mono text-xs text-warning-amber border border-warning-amber/30 bg-warning-amber/10 px-2 py-0.5 uppercase">
                {tournament.structure === 'GROUP_KNOCKOUT' ? 'Vòng Bảng + Knockout' : 'Single Elimination'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight leading-none text-off-white">
              {tournament.name}
            </h1>
            <p className="text-tactical-gray text-sm font-body">
              {tournament.rulesDescription || "Giải đấu Esports chính thức trên hệ thống Tactical Edge Engine."}
            </p>

            <div className="flex flex-wrap gap-x-12 gap-y-4 pt-2 font-mono text-xs">
              <div>
                <p className="text-tactical-gray text-[10px] uppercase font-bold tracking-wider mb-1">Thời gian</p>
                <p className="font-semibold text-off-white">
                  {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('vi-VN') : 'TBD'}
                  {tournament.endDate ? ` – ${new Date(tournament.endDate).toLocaleDateString('vi-VN')}` : ''}
                </p>
              </div>
              <div>
                <p className="text-tactical-gray text-[10px] uppercase font-bold tracking-wider mb-1">Giải thưởng</p>
                <p className="font-semibold text-warning-amber">{tournament.prizePool || 'TBD'}</p>
              </div>
              <div>
                <p className="text-tactical-gray text-[10px] uppercase font-bold tracking-wider mb-1">Địa điểm</p>
                <p className="font-semibold text-off-white">
                  {tournament.location || 'Online'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="md:absolute top-6 right-6 flex flex-col gap-2 w-full md:w-auto">
            {tournament.registrationStatus === 'OPEN' && !userTeamInTournament && (
              <TactileButton
                variant="primary"
                onClick={handleRegister}
                className="w-full justify-center"
              >
                ĐĂNG KÝ ĐỘI TUYỂN
              </TactileButton>
            )}

            {userTeamInTournament && (
              <span className="font-mono text-xs text-success-cyan border border-success-cyan/30 bg-success-cyan/10 px-3 py-2 text-center rounded">
                ✓ Bạn đã trong giải đấu này
              </span>
            )}

            {currentUser && (currentUser.id === tournament.creatorId || (tournament.organizerIds && tournament.organizerIds.includes(currentUser.id)) || currentUser.globalRole === 'ADMIN') && (
              <TactileButton
                variant="cyan"
                onClick={handleManage}
                className="w-full justify-center mt-1"
              >
                Quản lý Giải đấu
              </TactileButton>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs (Hidden if on manage page) */}
      {!currentPath.endsWith('manage') && !currentPath.endsWith('register') && (
        <div className="max-w-[1200px] mx-auto px-4 mt-4">
          <div className="flex items-end border-b border-outline-variant">
            <div className="flex bg-surface-charcoal">
              {tabs.map(tab => {
                const isActive = (tab === 'Overview' && isOverview) ||
                                 (tab === 'Matches' && isMatches) ||
                                 (tab === 'Agents' && isAgents);
                return (
                  <Link
                    key={tab}
                    to={getTabPath(tab)}
                    className={`
                      px-6 py-3 text-xs font-display uppercase tracking-wider transition-colors border-t border-x border-transparent
                      ${isActive
                        ? 'bg-background text-off-white border-t-outline-variant border-x-outline-variant border-b-background relative top-[1px]'
                        : 'bg-surface-charcoal text-tactical-gray hover:text-off-white'}
                    `}
                  >
                    {tab === 'Overview' ? 'Tổng Quan' : tab === 'Matches' ? 'Trận Đấu' : 'Thống Kê Tướng'}
                    {tab === 'Matches' && <span className="ml-1 text-[10px] text-tactical-gray">({internalMatches.length})</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 mt-6">
        <Routes>
          <Route path="/" element={
            <TournamentOverview
              internalMatches={internalMatches}
              registeredTeams={registeredTeams}
              upcomingMatches={upcomingMatches}
              pastMatches={pastMatches}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              tournament={tournament}
              standings={standings}
              currentUser={currentUser}
              onJoinTeam={onJoinTeam}
            />
          } />
          <Route path="overview" element={
            <TournamentOverview
              internalMatches={internalMatches}
              registeredTeams={registeredTeams}
              upcomingMatches={upcomingMatches}
              pastMatches={pastMatches}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              tournament={tournament}
              standings={standings}
              currentUser={currentUser}
              onJoinTeam={onJoinTeam}
            />
          } />
          <Route path="matches" element={
            <TournamentMatches 
              internalMatches={internalMatches} 
              currentUser={currentUser} 
              tournament={tournament} 
              onMatchUpdate={async () => {
                try {
                  const [tourRes, matchRes] = await Promise.all([
                    getTournamentDetails(id),
                    getMatchesByTournament(id)
                  ]);
                  if (tourRes.success) setTournament(tourRes.data);
                  if (matchRes.success) setInternalMatches(matchRes.data || []);
                } catch (e) {
                  console.error(e);
                }
              }}
            />
          } />
          <Route path="agents" element={
            <TournamentAgents />
          } />
          <Route path="register" element={
            <TournamentRegistrationForm
              tournament={tournament}
              onCancel={() => navigate(`/tournaments/${id}`)}
              onSuccess={async () => {
                await fetchTournamentData();
                navigate(`/tournaments/${id}`);
              }}
            />
          } />
          <Route path="manage" element={
            <OrganizerDashboard
              tournament={tournament}
              currentUser={currentUser}
              onBack={() => navigate(`/tournaments/${id}`)}
            />
          } />
        </Routes>
      </div>
    </div>
  );
}

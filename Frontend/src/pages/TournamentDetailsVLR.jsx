import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getMatchesByTournament } from '../services/matchService';
import { getTournamentDetails, registerForTournament } from '../services/tournamentService';
import TournamentOverview from './tournament/TournamentOverview';
import TournamentMatches from './tournament/TournamentMatches';
import OrganizerDashboard from './OrganizerDashboard';

export default function TournamentDetailsVLR({ currentUser, onJoinTeam }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [tournament, setTournament] = useState(null);
  const [internalMatches, setInternalMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('Overview');

  useEffect(() => {
    const fetchData = async () => {
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
              console.error("Error fetching standings", err);
            }
          }
        }
        if (matchRes.success) setInternalMatches(matchRes.data || []);
      } catch (error) {
        console.error("Error fetching tournament details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full bg-[#1b1b1b] min-h-screen text-off-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-red" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="w-full bg-[#1b1b1b] min-h-screen text-off-white flex items-center justify-center">
        Tournament not found.
      </div>
    );
  }

  const tabs = ['Overview', 'Matches', 'Stats', 'Agents'];

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
  const isStats = currentPath.endsWith('stats');
  const isAgents = currentPath.endsWith('agents');
  
  const getTabPath = (tab) => {
    const base = `/tournaments/${id}`;
    if (tab === 'Overview') return `${base}/overview`;
    if (tab === 'Matches') return `${base}/matches`;
    if (tab === 'Stats') return `${base}/stats`;
    if (tab === 'Agents') return `${base}/agents`;
    return base;
  };

  return (
    <div className="w-full bg-[#1b1b1b] min-h-screen text-off-white font-sans pb-16">
      
      {/* Header Section */}
      <div className="max-w-[1200px] mx-auto pt-6 px-4">
        <button onClick={handleBack} className="text-[#a0a0a0] hover:text-white text-xs uppercase font-bold flex items-center gap-1 mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Tournaments
        </button>
        
        <div className="bg-[#222] border border-[#333] flex flex-col md:flex-row items-start p-6 gap-6 relative">
          
          {/* Logo */}
          <div className="w-32 h-32 bg-[#111] flex items-center justify-center shrink-0 border border-[#333]">
            <div className="text-primary-red font-display text-5xl font-bold">V</div>
          </div>
          
          {/* Info */}
          <div className="flex-1 space-y-3 pt-1">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-none text-white">
              {tournament.name}
            </h1>
            <p className="text-[#a0a0a0] text-sm">
              {tournament.rulesDescription || "Part of the Valorant Champions Tour, Riot's official tournament circuit."}
            </p>
            
            <div className="flex flex-wrap gap-x-12 gap-y-4 pt-2">
              <div>
                <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider mb-1">Dates</p>
                <p className="text-sm font-semibold text-white">
                  {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'} 
                  {tournament.endDate ? ` – ${new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                </p>
              </div>
              <div>
                <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider mb-1">Prize</p>
                <p className="text-sm font-semibold text-white">{tournament.prizePool || 'TBD'}</p>
              </div>
              <div>
                <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider mb-1">Location</p>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  {tournament.location || 'TBD'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
             <button className="bg-[#2a2a2a] hover:bg-[#333] border border-[#444] text-white text-xs font-bold px-4 py-2 transition-colors">
              Add to Calendar ▾
            </button>
            
            {tournament.registrationStatus === 'OPEN' && !userTeamInTournament && (
              <button 
                onClick={handleRegister}
                className="bg-primary-red hover:bg-red-700 text-white text-xs font-bold px-4 py-2 transition-colors uppercase mt-2"
              >
                Register Team
              </button>
            )}
            
            {currentUser && (currentUser.id === tournament.creatorId || (tournament.organizerIds && tournament.organizerIds.includes(currentUser.id)) || currentUser.globalRole === 'ADMIN') && (
              <button 
                onClick={handleManage}
                className="bg-success-cyan hover:bg-cyan-600 text-[#111] text-xs font-bold px-4 py-2 transition-colors uppercase mt-2"
              >
                Manage
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs (Hidden if on manage page) */}
      {!currentPath.endsWith('manage') && (
        <div className="max-w-[1200px] mx-auto px-4 mt-2">
          <div className="flex items-end border-b border-[#333]">
            <div className="flex bg-[#222]">
              {tabs.map(tab => {
                const isActive = (tab === 'Overview' && isOverview) || 
                                 (tab === 'Matches' && isMatches) || 
                                 (tab === 'Stats' && isStats) || 
                                 (tab === 'Agents' && isAgents);
                return (
                  <Link
                    key={tab}
                    to={getTabPath(tab)}
                    className={`
                      px-6 py-3 text-xs font-bold transition-colors border-t border-x border-transparent
                      ${isActive 
                        ? 'bg-[#1b1b1b] text-white border-t-[#333] border-x-[#333] border-b-transparent relative top-[1px]' 
                        : 'bg-[#222] text-[#a0a0a0] hover:text-white'}
                    `}
                  >
                    {tab}
                    {tab === 'Matches' && <span className="ml-1 text-[9px] text-[#666]">(30)</span>}
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
          <Route path="matches" element={<TournamentMatches internalMatches={internalMatches} />} />
          <Route path="register" element={
            <TournamentRegisterForm 
              tournament={tournament} 
              currentUser={currentUser} 
              onCancel={() => navigate(`/tournaments/${id}`)} 
              onSuccess={async () => { 
                const tourRes = await getTournamentDetails(id); 
                if (tourRes.success) setTournament(tourRes.data); 
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

function TournamentRegisterForm({ tournament, currentUser, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    teamName: '',
    teamTag: '',
    captainInGameName: '',
    captainPhoneNumber: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Vui lòng đăng nhập để đăng ký!');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await registerForTournament(
        tournament.id,
        formData.teamName,
        formData.teamTag,
        currentUser.id,
        formData.captainInGameName,
        formData.logoUrl,
        formData.captainPhoneNumber
      );
      if (res.success) {
        setSuccess('Đăng ký tham gia giải đấu thành công! Đang chờ BTC duyệt.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(res.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi đăng ký!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-[#222] border border-[#333] p-8 text-off-white shadow-2xl relative my-8">
      <button onClick={onCancel} className="absolute top-4 right-4 text-[#888] hover:text-white">
        <X size={20} />
      </button>

      <h2 className="font-display text-2xl font-bold uppercase mb-1 text-white">Đăng Ký Tham Gia Giải Đấu</h2>
      <p className="font-mono text-xs text-primary-red mb-6">// Giải đấu: {tournament.name}</p>

      {error && (
        <div className="bg-red-950/60 border border-red-500 text-red-200 p-3 mb-4 text-xs font-mono flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/60 border border-emerald-500 text-emerald-200 p-3 mb-4 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase font-bold text-[#aaa] mb-1">Tên đội tuyển <span className="text-primary-red">*</span></label>
          <input
            type="text"
            required
            placeholder="VD: Saigon Phantom"
            value={formData.teamName}
            onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
            className="w-full bg-[#111] border border-[#444] p-2.5 text-sm text-white focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold text-[#aaa] mb-1">Tag đội (2-5 ký tự) <span className="text-primary-red">*</span></label>
          <input
            type="text"
            required
            maxLength={5}
            placeholder="VD: SGP"
            value={formData.teamTag}
            onChange={(e) => setFormData({ ...formData, teamTag: e.target.value.toUpperCase() })}
            className="w-full bg-[#111] border border-[#444] p-2.5 text-sm text-white focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold text-[#aaa] mb-1">In-Game Name Đội trưởng <span className="text-primary-red">*</span></label>
          <input
            type="text"
            required
            placeholder="VD: SGP.Bâng#123"
            value={formData.captainInGameName}
            onChange={(e) => setFormData({ ...formData, captainInGameName: e.target.value })}
            className="w-full bg-[#111] border border-[#444] p-2.5 text-sm text-white focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold text-[#aaa] mb-1">Số điện thoại liên hệ <span className="text-primary-red">*</span></label>
          <input
            type="tel"
            required
            placeholder="VD: 0912345678"
            value={formData.captainPhoneNumber}
            onChange={(e) => setFormData({ ...formData, captainPhoneNumber: e.target.value })}
            className="w-full bg-[#111] border border-[#444] p-2.5 text-sm text-white focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold text-[#aaa] mb-1">Link Logo Đội (Tùy chọn)</label>
          <input
            type="url"
            placeholder="https://..."
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            className="w-full bg-[#111] border border-[#444] p-2.5 text-sm text-white focus:outline-none focus:border-primary-red"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#333] hover:bg-[#444] text-xs font-bold text-white uppercase transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-red hover:bg-red-700 disabled:opacity-50 text-xs font-bold text-white uppercase transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Xác Nhận Đăng Ký
          </button>
        </div>
      </form>
    </div>
  );
}


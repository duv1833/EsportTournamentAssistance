import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Pause, Play, ArrowRight,
  MonitorPlay, Bell, Layers, Shield, User, Lock, Key,
  BadgeCheck, Mail, Globe, Menu, X, LogOut,
  Swords, Trophy, Newspaper, Gamepad2, Home as HomeIcon, Plus, Users, Info
} from 'lucide-react';
import { login, register, logout, getCurrentUser } from './services/authService';
import { getAllTournaments, getTournamentDetails, createTournament, registerForTournament } from './services/tournamentService';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Teams from './pages/Teams';
import ManageTeam from './pages/ManageTeam';
import OrganizerDashboard from './pages/OrganizerDashboard';
import TactileButton from './components/common/TactileButton';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import EmptyState from './components/common/EmptyState';
import Home from './pages/Home';
import JoinTeamModal from './components/tournament/JoinTeamModal';
import AdminTournamentManagement from './pages/AdminTournamentManagement';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import MatchSchedule from './pages/MatchSchedule';
import TournamentDetailsVLR from './pages/TournamentDetailsVLR';




// ─── Main App ─────────────────────────────────────────────
function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/tournaments')) return 'tournaments';
    if (path === '/lobby') return 'lobby';
    if (path === '/matches') return 'matches';
    if (path === '/manage_team') return 'manage_team';
    if (path === '/news') return 'news';
    if (path === '/profile') return 'profile';
    if (path === '/admin_dashboard') return 'admin_dashboard';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    return 'home';
  };
  
  const activeTab = getActiveTab();

  const setActiveTab = (tab) => {
    if (tab === 'home') navigate('/');
    else navigate(`/${tab}`);
  };

  // Auth states
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '', tos: false });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tournament states
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentViewMode, setTournamentViewMode] = useState('list'); // list, create, details, register
  const [createForm, setCreateForm] = useState({ name: '', maxTeams: 16, rulesDescription: '', startDate: '', endDate: '', prizePool: '', location: '', structure: 'SINGLE_ELIMINATION' });
  const [registerFormTeam, setRegisterFormTeam] = useState({ teamName: '', teamTag: '', captainInGameName: '' });
  const [joinTeamModal, setJoinTeamModal] = useState({ isOpen: false, teamId: null, inGameName: '' });
  const [tournamentError, setTournamentError] = useState('');
  const [tournamentSuccess, setTournamentSuccess] = useState('');
  const [isTournamentLoading, setIsTournamentLoading] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  const fetchTournaments = async () => {
    try {
      const res = await getAllTournaments();
      if (res.success) {
        setTournaments(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách giải đấu:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'tournaments') {
      fetchTournaments();
      setTournamentViewMode('list');
      setTournamentError('');
      setTournamentSuccess('');
    }
  }, [activeTab]);

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.maxTeams) {
      setTournamentError('Vui lòng nhập đầy đủ thông tin giải đấu!');
      return;
    }
    if (!currentUser) {
      setTournamentError('Bạn cần đăng nhập để tạo giải đấu!');
      return;
    }
    setTournamentError('');
    setTournamentSuccess('');
    setIsTournamentLoading(true);
    try {
      const res = await createTournament(
        createForm.name,
        parseInt(createForm.maxTeams),
        createForm.rulesDescription,
        createForm.startDate,
        createForm.endDate,
        createForm.prizePool,
        createForm.location,
        createForm.structure,
        currentUser.id
      );
      if (res.success) {
        setTournamentSuccess('Tạo giải đấu thành công! Giải đấu của bạn đang chờ Admin phê duyệt trước khi được xuất bản công khai.');
        setCreateForm({ name: '', maxTeams: 16, rulesDescription: '', startDate: '', endDate: '', prizePool: '', location: '', structure: 'SINGLE_ELIMINATION' });
        await fetchTournaments();
        setTimeout(() => {
          setTournamentViewMode('list');
          setTournamentSuccess('');
        }, 2500);
      } else {
        setTournamentError(res.message || 'Tạo giải đấu thất bại!');
      }
    } catch (err) {
      setTournamentError(err.response?.data?.message || 'Lỗi hệ thống khi tạo giải đấu!');
    } finally {
      setIsTournamentLoading(false);
    }
  };

  const handleRegisterTournament = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setTournamentError('Bạn cần đăng nhập để đăng ký giải đấu!');
      return;
    }
    if (!selectedTournament) return;

    const userTeamInTournament = selectedTournament.registeredTeams?.find(team => {
      const isCaptain = (team.captainId && currentUser.id && team.captainId === currentUser.id) ||
                        (team.captainUsername && currentUser.username && team.captainUsername === currentUser.username);
      const isMember = team.members && team.members.some(m => 
        ((m.userId && currentUser.id && m.userId === currentUser.id) ||
         (m.username && currentUser.username && m.username === currentUser.username)) &&
        (m.status === 'APPROVED' || m.status === 'ACCEPTED' || m.status === 'PENDING' || m.status === 'INVITED')
      );
      return isCaptain || isMember;
    });

    if (userTeamInTournament) {
      setTournamentError(`Bạn đã tạo hoặc đang trong đội tuyển [${userTeamInTournament.name}] ở trong giải đấu này rồi!`);
      return;
    }

    setTournamentError('');
    setTournamentSuccess('');
    setIsTournamentLoading(true);
    try {
      const res = await registerForTournament(
        selectedTournament.id,
        registerFormTeam.teamName,
        registerFormTeam.teamTag,
        currentUser.id,
        registerFormTeam.captainInGameName,
        registerFormTeam.logoUrl,
        registerFormTeam.captainPhoneNumber
      );
      if (res.success) {
        setTournamentSuccess('Đăng ký tham gia giải đấu thành công!');
        setRegisterFormTeam({
          teamName: '',
          teamTag: '',
          captainInGameName: '',
          logoUrl: '',
          captainPhoneNumber: ''
        });
        // Refresh details
        const detailsRes = await getTournamentDetails(selectedTournament.id);
        if (detailsRes.success) {
          setSelectedTournament(detailsRes.data);
        }
        await fetchTournaments();
        setTimeout(() => {
          navigate(`/tournaments/${selectedTournament.id}`);
          setTournamentSuccess('');
        }, 1500);
      } else {
        setTournamentError(res.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setTournamentError(err.response?.data?.message || 'Lỗi hệ thống khi đăng ký tham gia giải đấu!');
    } finally {
      setIsTournamentLoading(false);
    }
  };

  const handleViewTournamentDetails = async (id) => {
    navigate(`/tournaments/${id}`);
  };

  const handleJoinTeamFromTournament = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setTournamentError('Bạn cần đăng nhập để xin gia nhập đội!');
      return;
    }
    if (!joinTeamModal.inGameName) {
      setTournamentError('Vui lòng nhập tên In-game!');
      return;
    }
    
    setTournamentError('');
    setTournamentSuccess('');
    setIsTournamentLoading(true);
    try {
      const { teamService } = await import('./services/teamService');
      const res = await teamService.joinTeam(joinTeamModal.teamId, currentUser.id, joinTeamModal.inGameName);
      if (res.success) {
        setTournamentSuccess('Đã gửi yêu cầu tham gia đội tuyển!');
        setJoinTeamModal({ isOpen: false, teamId: null, inGameName: '' });
        
        const detailsRes = await getTournamentDetails(selectedTournament.id);
        if (detailsRes.success) {
          setSelectedTournament(detailsRes.data);
        }
      } else {
        setTournamentError(res.message || 'Xin gia nhập thất bại!');
      }
    } catch (err) {
      setTournamentError(err.response?.data?.message || 'Lỗi hệ thống khi gửi yêu cầu tham gia!');
    } finally {
      setIsTournamentLoading(false);
    }
  };



  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.usernameOrEmail || !loginForm.password) {
      setAuthError('Vui lòng nhập đầy đủ thông tin đăng nhập!');
      return;
    }
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);
    try {
      const data = await login(loginForm.usernameOrEmail, loginForm.password);
      if (data.success) {
        setAuthSuccess(data.message || 'Đăng nhập thành công!');
        setCurrentUser(data.data);
        setLoginForm({ usernameOrEmail: '', password: '' });
        setTimeout(() => {
          setActiveTab('home');
          setAuthSuccess('');
        }, 1500);
      } else {
        setAuthError(data.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Có lỗi hệ thống xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setAuthError('Vui lòng điền đầy đủ các thông tin đăng ký!');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(registerForm.username)) {
      setAuthError('Tên đăng nhập phải từ 3-20 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setAuthError('Email không hợp lệ!');
      return;
    }

    if (registerForm.password.length < 6) {
      setAuthError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Mật khẩu nhập lại không khớp!');
      return;
    }
    if (!registerForm.tos) {
      setAuthError('Bạn phải chấp nhận Điều khoản sử dụng (TOS)!');
      return;
    }
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);
    try {
      const data = await register(registerForm.username, registerForm.email, registerForm.password);
      if (data.success) {
        setAuthSuccess(data.message || 'Đăng ký tài khoản thành công!');
        setCurrentUser(data.data);
        setRegisterForm({ username: '', email: '', password: '', confirmPassword: '', tos: false });
        setTimeout(() => {
          setActiveTab('home');
          setAuthSuccess('');
        }, 1500);
      } else {
        setAuthError(data.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleAuthNav = (tab) => {
    setActiveTab(tab);
    setAuthError('');
    setAuthSuccess('');
  };

  return (
    <div className="bg-background text-on-surface font-body antialiased overflow-x-hidden selection:bg-primary-red selection:text-off-white bg-pattern-scanline min-h-[100dvh] flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAuthNav={handleAuthNav}
      />

      <main className="flex-grow pt-20">
        {/* Main Content Router */}
        <Routes>
          <Route path="/tournaments/:id/*" element={<TournamentDetailsVLR currentUser={currentUser} />} />
          <Route path="/*" element={
            <>
              {activeTab === 'home' && (
                <Home setActiveTab={setActiveTab} />
              )}

              {/* Lobby / Draft Screen */}
              {activeTab === 'lobby' && (
                <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
                  <div className="bg-surface-charcoal border border-outline-variant p-8 clip-corner-top">
                    <h2 className="font-display text-3xl text-off-white uppercase mb-2">Match Lobby</h2>
                    <p className="font-mono text-sm text-tactical-gray uppercase mb-6">// Real-time Map & Agent drafting interface.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-background border-l-4 border-success-cyan p-6">
                        <h3 className="font-display text-lg text-off-white mb-4">TEAM BLUE</h3>
                        <div className="flex flex-wrap gap-3">
                          <span className="px-3 py-1.5 bg-surface-charcoal border border-success-cyan text-success-cyan font-mono text-xs">PICK: JETT</span>
                          <span className="px-3 py-1.5 bg-surface-charcoal border border-outline-variant text-off-white/60 font-mono text-xs">PICK: SOVA</span>
                          <span className="px-3 py-1.5 bg-surface-charcoal border border-primary-red text-primary-red font-mono text-xs">BAN: REYNA</span>
                        </div>
                      </div>
                      <div className="bg-background border-l-4 border-primary-red p-6">
                        <h3 className="font-display text-lg text-off-white mb-4">TEAM RED</h3>
                        <div className="flex flex-wrap gap-3">
                          <span className="px-3 py-1.5 bg-surface-charcoal border border-primary-red text-primary-red font-mono text-xs">PICK: OMEN</span>
                          <span className="px-3 py-1.5 bg-surface-charcoal border border-outline-variant text-off-white/60 font-mono text-xs">PICK: CYPHER</span>
                          <span className="px-3 py-1.5 bg-surface-charcoal border border-primary-red text-primary-red font-mono text-xs">BAN: RAZE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


        {/* Tab Tournaments */}
        {activeTab === 'tournaments' && (
          <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
            {tournamentViewMode === 'list' && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="font-display text-3xl text-off-white uppercase mb-2">Giải đấu</h2>
                    <p className="font-mono text-sm text-tactical-gray">// Các giải đấu Esports đỉnh cao</p>
                  </div>
                  {currentUser ? (
                    <TactileButton
                      onClick={() => {
                        setTournamentError('');
                        setTournamentSuccess('');
                        setTournamentViewMode('create');
                      }}
                      className="clip-corner bg-primary-red text-off-white font-display text-sm py-2.5 px-6 uppercase font-bold flex items-center gap-2 hover:brightness-110"
                    >
                      <Plus size={16} /> Tạo giải đấu mới
                    </TactileButton>
                  ) : (
                    <p className="font-mono text-xs text-warning-amber">// Đăng nhập để tạo giải đấu mới</p>
                  )}
                </div>

                {tournaments.length === 0 ? (
                  <EmptyState
                    icon={Trophy}
                    title="Chưa có giải đấu nào"
                    desc="Không tìm thấy thông tin giải đấu. Nếu bạn là nhà tổ chức, hãy tạo giải đấu đầu tiên ngay bây giờ!"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => handleViewTournamentDetails(t.id)}
                        className="bg-surface-charcoal border border-outline-variant p-6 flex flex-col justify-between clip-corner cursor-pointer hover:border-primary-red/60 transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="font-mono text-xs text-success-cyan font-bold tracking-wider">// ID: {t.id}</span>
                            <span className={`font-mono text-xs px-2 py-1 uppercase font-bold ${
                              t.registrationStatus === 'OPEN' ? 'bg-success-cyan/10 text-success-cyan border border-success-cyan/20' :
                              t.registrationStatus === 'PENDING' ? 'bg-warning-amber/10 text-warning-amber border border-warning-amber/20' :
                              'bg-tactical-gray/10 text-tactical-gray border border-tactical-gray/20'
                            }`}>
                              {t.registrationStatus === 'PENDING' ? 'Chờ duyệt' : t.registrationStatus}
                            </span>
                          </div>
                          <h3 className="font-display text-xl text-off-white uppercase mb-3 line-clamp-1">{t.name}</h3>
                          <div className="space-y-2 mb-6">
                            <div className="flex justify-between font-mono text-xs text-off-white/60">
                              <span>Thể thức:</span>
                              <span className="text-off-white font-bold">{t.format}</span>
                            </div>
                            <div className="flex justify-between font-mono text-xs text-off-white/60">
                              <span>Số đội:</span>
                              <span className="text-off-white font-bold">{t.registeredTeams ? t.registeredTeams.length : 0} / {t.maxTeams}</span>
                            </div>
                            <div className="flex justify-between font-mono text-xs text-off-white/60">
                              <span>Người tạo:</span>
                              <span className="text-off-white font-bold">@{t.creatorUsername}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                          <TactileButton
                            onClick={() => handleViewTournamentDetails(t.id)}
                            className="w-full bg-primary-red text-off-white font-display text-xs py-2.5 px-4 uppercase tracking-wider hover:brightness-110 text-center font-bold flex justify-center items-center gap-1.5"
                          >
                            THAM GIA GIẢI ĐẤU <ArrowRight size={14} />
                          </TactileButton>

                          {currentUser && (currentUser.username === t.creatorUsername || currentUser.globalRole === 'ADMIN') && (
                            <TactileButton
                              onClick={() => {
                                setSelectedTournament(t);
                                setTournamentViewMode('organizer');
                              }}
                              className="w-full bg-success-cyan text-background font-display text-xs py-2 px-3 uppercase tracking-wider hover:brightness-110 text-center font-bold"
                            >
                              Quản lý giải đấu
                            </TactileButton>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Create Tournament View */}
            {tournamentViewMode === 'create' && (
              <div className="max-w-2xl mx-auto bg-surface-charcoal border border-outline-variant p-8 clip-corner">
                <h3 className="font-display text-2xl text-off-white uppercase mb-2">Tạo giải đấu mới</h3>
                <p className="font-mono text-xs text-tactical-gray mb-6">// Thiết lập các thông số cơ bản cho giải đấu của bạn</p>

                {tournamentError && (
                  <div className="bg-primary-red/10 border border-primary-red text-primary-red p-3 mb-4 text-sm font-mono uppercase">
                    // Lỗi: {tournamentError}
                  </div>
                )}
                {tournamentSuccess && (
                  <div className="bg-success-cyan/10 border border-success-cyan text-success-cyan p-3 mb-4 text-sm font-mono uppercase">
                    // Thành công: {tournamentSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateTournament} className="space-y-6">
                  <div>
                    <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Tên giải đấu</label>
                    <input
                      type="text"
                      className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                      placeholder="VD: VALORANT VIETNAM CHALLENGERS"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Số lượng đội</label>
                      <select
                        className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                        value={createForm.maxTeams}
                        onChange={(e) => setCreateForm({ ...createForm, maxTeams: parseInt(e.target.value) })}
                      >
                        <option value="4">4 Đội</option>
                        <option value="8">8 Đội</option>
                        <option value="16">16 Đội</option>
                        <option value="32">32 Đội</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Thể thức thi đấu</label>
                      <select
                        className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                        value={createForm.structure}
                        onChange={(e) => setCreateForm({ ...createForm, structure: e.target.value })}
                      >
                        <option value="SINGLE_ELIMINATION">Loại Trực Tiếp (Single Elimination)</option>
                        <option value="GROUP_KNOCKOUT">Vòng Bảng + Nhánh Đấu (Group Stage & Knockout)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Mô tả & Luật thi đấu</label>
                    <textarea
                      className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red h-32"
                      placeholder="Nhập luật đấu, thể thức cụ thể, thời gian và giải thưởng..."
                      value={createForm.rulesDescription}
                      onChange={(e) => setCreateForm({ ...createForm, rulesDescription: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Ngày bắt đầu</label>
                      <input
                        type="date"
                        className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red [color-scheme:dark]"
                        value={createForm.startDate}
                        onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Ngày kết thúc</label>
                      <input
                        type="date"
                        className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red [color-scheme:dark]"
                        value={createForm.endDate}
                        onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Giải thưởng (Prize Pool)</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                        placeholder="VD: $250,000"
                        value={createForm.prizePool}
                        onChange={(e) => setCreateForm({ ...createForm, prizePool: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Địa điểm</label>
                      <input
                        type="text"
                        className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                        placeholder="VD: BR São Paulo"
                        value={createForm.location}
                        onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <TactileButton
                      type="button"
                      onClick={() => setTournamentViewMode('list')}
                      className="w-full bg-surface-bright text-off-white font-display text-sm py-3 px-6 uppercase tracking-wider hover:bg-surface-bright/80"
                    >
                      Hủy & Quay lại
                    </TactileButton>
                    <TactileButton
                      type="submit"
                      disabled={isTournamentLoading}
                      className="w-full bg-primary-red text-off-white font-display text-sm py-3 px-6 uppercase tracking-wider font-bold hover:brightness-110 disabled:opacity-50"
                    >
                      {isTournamentLoading ? 'Đang tạo...' : 'Xác nhận tạo'}
                    </TactileButton>
                  </div>
                </form>
              </div>
            )}

            {/* Tournament Details View */}
            {tournamentViewMode === 'details' && selectedTournament && (
              <TournamentDetailsVLR
                tournament={selectedTournament}
                currentUser={currentUser}
                onBack={() => setTournamentViewMode('list')}
                onRegister={() => {
                  if (!currentUser) {
                    setActiveTab('login');
                  } else {
                    setTournamentError('');
                    setTournamentSuccess('');
                    setTournamentViewMode('register');
                  }
                }}
                onManage={() => setTournamentViewMode('organizer')}
              />
            )}

            {/* Register Team View */}
            {tournamentViewMode === 'register' && selectedTournament && (
              <div className="max-w-md mx-auto bg-surface-charcoal border border-outline-variant p-8 clip-corner">
                <h3 className="font-display text-2xl text-off-white uppercase mb-2">Đăng ký tham gia</h3>
                <p className="font-mono text-xs text-success-cyan mb-6">// Giải đấu: {selectedTournament.name}</p>

                {tournamentError && (
                  <div className="bg-primary-red/10 border border-primary-red text-primary-red p-3 mb-4 text-sm font-mono uppercase">
                    // Lỗi: {tournamentError}
                  </div>
                )}
                {tournamentSuccess && (
                  <div className="bg-success-cyan/10 border border-success-cyan text-success-cyan p-3 mb-4 text-sm font-mono uppercase">
                    // Thành công: {tournamentSuccess}
                  </div>
                )}

                <p className="font-body text-xs text-tactical-gray mb-6 leading-relaxed">
                  Để đăng ký tham gia, vui lòng cung cấp thông tin đội tuyển của bạn. Bạn sẽ là đội trưởng (Captain) của đội tuyển này.
                </p>

                <form onSubmit={handleRegisterTournament} className="space-y-5">
                  <div>
                    <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Tên đội tuyển</label>
                    <input
                      type="text"
                      className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                      placeholder="VD: Saigon Phantom"
                      value={registerFormTeam.teamName}
                      onChange={(e) => setRegisterFormTeam({ ...registerFormTeam, teamName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Tag đội tuyển (3-4 ký tự)</label>
                    <input
                      type="text"
                      maxLength={4}
                      className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red uppercase"
                      placeholder="VD: SGP"
                      value={registerFormTeam.teamTag}
                      onChange={(e) => setRegisterFormTeam({ ...registerFormTeam, teamTag: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Tên In-game của Đội trưởng</label>
                    <input
                      type="text"
                      className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                      placeholder="VD: Faker#VN1"
                      value={registerFormTeam.captainInGameName}
                      onChange={(e) => setRegisterFormTeam({ ...registerFormTeam, captainInGameName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Số điện thoại liên hệ của Đội trưởng</label>
                    <input
                      type="tel"
                      className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                      placeholder="VD: 0912345678"
                      value={registerFormTeam.captainPhoneNumber || ''}
                      onChange={(e) => setRegisterFormTeam({ ...registerFormTeam, captainPhoneNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Logo Đội tuyển</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setRegisterFormTeam({ ...registerFormTeam, logoUrl: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-background border border-outline-variant p-2 text-off-white font-mono text-xs focus:outline-none focus:border-primary-red file:mr-3 file:py-1 file:px-3 file:bg-surface-bright file:text-off-white file:border-0 file:font-mono file:text-xs hover:file:bg-primary-red"
                      />
                      <input
                        type="url"
                        className="w-full bg-background border border-outline-variant p-2.5 text-off-white font-mono text-xs focus:outline-none focus:border-primary-red"
                        placeholder="Hoặc dán link ảnh trực tiếp (URL)..."
                        value={registerFormTeam.logoUrl || ''}
                        onChange={(e) => setRegisterFormTeam({ ...registerFormTeam, logoUrl: e.target.value })}
                      />
                    </div>

                    {registerFormTeam.logoUrl && (
                      <div className="mt-3 flex items-center gap-3 p-2 bg-background/50 border border-outline-variant">
                        <img
                          src={registerFormTeam.logoUrl}
                          alt="Logo Preview"
                          className="w-12 h-12 object-cover rounded border border-outline-variant"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="font-mono text-[10px] text-success-cyan">// Đã tải xem trước Logo thành công</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-3">
                    <TactileButton
                      type="button"
                      onClick={() => setTournamentViewMode('details')}
                      className="w-full bg-surface-bright text-off-white font-display text-sm py-3 px-4 uppercase tracking-wider hover:bg-surface-bright/80"
                    >
                      Hủy bỏ
                    </TactileButton>
                    <TactileButton
                      type="submit"
                      disabled={isTournamentLoading}
                      className="w-full bg-primary-red text-off-white font-display text-sm py-3 px-4 uppercase tracking-wider font-bold hover:brightness-110 disabled:opacity-50"
                    >
                      {isTournamentLoading ? 'Đang gửi...' : 'Gửi đăng ký'}
                    </TactileButton>
                  </div>
                </form>
              </div>
            )}
            
            {/* Organizer Dashboard View */}
            {tournamentViewMode === 'organizer' && selectedTournament && (
              <OrganizerDashboard 
                tournament={selectedTournament} 
                currentUser={currentUser} 
                onBack={() => setTournamentViewMode('list')} 
              />
            )}
          </div>
        )}

        {/* Tab Match Schedule */}
        {activeTab === 'matches' && (
          <MatchSchedule currentUser={currentUser} />
        )}

        {/* Tab Manage Team */}
        {activeTab === 'manage_team' && (
          <ManageTeam currentUser={currentUser} />
        )}

        {/* Tab Profile */}
        {activeTab === 'profile' && (
          <UserProfile
            currentUser={currentUser}
            onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
          />
        )}

        {/* Tab Admin Dashboard */}
        {activeTab === 'admin_dashboard' && (
          <AdminDashboard currentUser={currentUser} />
        )}

        {/* Tab News — Empty State */}
        {activeTab === 'news' && (
          <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
            <h2 className="font-display text-3xl text-off-white uppercase mb-2">Tin tức</h2>
            <p className="font-mono text-sm text-tactical-gray mb-8">// Cập nhật các thông tin giải đấu mới nhất</p>
            <EmptyState
              icon={Newspaper}
              title="Chưa có tin mới"
              desc="Tin tức và thông báo mới nhất từ các giải đấu sẽ xuất hiện tại đây."
            />
          </div>
        )}

        {/* Auth: Login */}
        {activeTab === 'login' && (
          <LoginForm
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            authError={authError}
            authSuccess={authSuccess}
            onSwitchToRegister={() => handleAuthNav('register')}
          />
        )}

              {/* Auth: Register */}
              {activeTab === 'register' && (
                <RegisterForm
                  registerForm={registerForm}
                  setRegisterForm={setRegisterForm}
                  onSubmit={handleRegisterSubmit}
                  isLoading={isLoading}
                  authError={authError}
                  authSuccess={authSuccess}
                  onSwitchToLogin={() => handleAuthNav('login')}
                />
              )}
            </>
          } />
        </Routes>
      </main>

      <JoinTeamModal 
        joinTeamModal={joinTeamModal}
        setJoinTeamModal={setJoinTeamModal}
        handleJoinTeamFromTournament={handleJoinTeamFromTournament}
        isTournamentLoading={isTournamentLoading}
      />
      <Footer />
    </div>
  );
}

export default App;

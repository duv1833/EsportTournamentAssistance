import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight, MonitorPlay, Bell, Trophy, Shield, Users, Zap, Crown, Medal, User, Sparkles } from 'lucide-react';
import TactileButton from '../components/common/TactileButton';
import { getAllTournaments } from '../services/tournamentService';
import { userService } from '../services/userService';
import { getAllUpcomingMatches, getExternalRunningMatches, getExternalUpcomingMatches } from '../services/matchService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// ─── Hero Slider ──────────────────────────────────────────
function HeroSlider({ slides, currentSlide, setCurrentSlide, isPlaying, setIsPlaying, onSlideClick }) {
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative h-[70vh] min-h-[550px] overflow-hidden">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 z-0">
            <img alt={slide.titleLine1} className="w-full h-full object-cover opacity-50" src={slide.image} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent"></div>
          </div>

          <div className="container mx-auto max-w-7xl relative z-10 h-full flex items-center px-6 md:px-12">
            <div className="max-w-2xl flex flex-col gap-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-1 bg-primary-red"></span>
                <span className={`font-mono text-xs uppercase tracking-widest flex items-center gap-2 ${slide.tagColor}`}>
                  {slide.tagPulse && <span className="w-2.5 h-2.5 rounded-full bg-success-cyan animate-pulse"></span>}
                  {slide.tag}
                </span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl uppercase leading-[0.95] text-off-white tracking-tight drop-shadow-lg">
                {slide.titleLine1}
                <br />
                <span className={slide.titleColor}>{slide.titleLine2}</span>
              </h1>
              <p className="font-body text-base md:text-lg text-off-white/80 max-w-xl border-l-2 border-tactical-gray pl-4">
                {slide.desc}
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <TactileButton
                  variant="primary"
                  onClick={() => onSlideClick(slide)}
                  className="px-8 py-3.5 text-lg flex items-center gap-2"
                >
                  {slide.btnText} <ArrowRight size={16} />
                </TactileButton>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slider Controls */}
      <button
        onClick={handlePrevSlide}
        aria-label="Previous slide"
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface-charcoal/80 border border-outline-variant hover:border-primary-red text-off-white flex justify-center items-center backdrop-blur-sm z-30 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={handleNextSlide}
        aria-label="Next slide"
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface-charcoal/80 border border-outline-variant hover:border-primary-red text-off-white flex justify-center items-center backdrop-blur-sm z-30 transition-colors"
      >
        <ChevronRight size={20} />
      </button>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        aria-label="Pause/Play slider"
        className="absolute bottom-8 right-12 w-10 h-10 bg-surface-charcoal/80 border border-outline-variant hover:border-primary-red text-off-white flex justify-center items-center backdrop-blur-sm z-30 transition-colors"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 transition-all cursor-pointer ${
              idx === currentSlide ? 'w-12 bg-primary-red' : 'w-4 bg-surface-bright hover:bg-outline-variant'
            }`}
          ></button>
        ))}
      </div>
    </section>
  );
}

// ─── Live Ticker Bar ──────────────────────────────────────
function LiveTickerBar({ match, onWatchLive }) {
  const liveMatch = match || {
    tournament: 'VCT PACIFIC 2026 - UPPER FINAL',
    team1: 'PAPER REX',
    team1Short: 'PRX',
    team2: 'GEN.G ESPORTS',
    team2Short: 'GEN',
    score1: 1,
    score2: 1
  };

  return (
    <section className="bg-surface-charcoal border-b border-outline-variant relative z-20">
      <div className="container mx-auto max-w-7xl px-6 md:px-12 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto min-w-0">
          <span className="bg-primary-red text-off-white font-display text-xs px-3 py-1 flex items-center gap-1.5 rounded-sm uppercase tracking-wider font-bold shrink-0">
            <span className="w-2 h-2 bg-off-white rounded-full animate-pulse"></span> LIVE NOW
          </span>
          <span className="font-mono text-xs text-tactical-gray uppercase tracking-wider hidden md:inline-block truncate">
            {liveMatch.tournament}
          </span>
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-body font-semibold text-off-white/60 uppercase hidden sm:inline-block text-xs">{liveMatch.team1}</span>
              <span className="font-display text-lg text-off-white">{liveMatch.team1Short}</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-1.5 rounded border border-outline-variant">
              <span className="font-display text-lg text-primary-red">{liveMatch.score1 ?? 0}</span>
              <span className="font-mono text-xs text-tactical-gray">-</span>
              <span className="font-display text-lg text-off-white">{liveMatch.score2 ?? 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg text-off-white">{liveMatch.team2Short}</span>
              <span className="font-body font-semibold text-off-white/60 uppercase hidden sm:inline-block text-xs">{liveMatch.team2}</span>
            </div>
          </div>
          <TactileButton variant="secondary" onClick={onWatchLive} className="text-xs flex items-center gap-2 shrink-0">
            <MonitorPlay size={14} /> XEM TRỰC TIẾP
          </TactileButton>
        </div>
      </div>
    </section>
  );
}

// ─── Match Card ───────────────────────────────────────────
function MatchCard({ tournament, status, statusColor, team1, team1Short, team1Logo, team2, team2Short, team2Logo, score1 = 0, score2 = 0, time, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-surface-charcoal border border-outline-variant p-6 hover:border-warning-amber transition-colors group relative overflow-hidden clip-corner-top cursor-pointer"
    >
      <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4 gap-2">
        <span className="font-mono text-xs text-tactical-gray uppercase tracking-wider truncate">{tournament}</span>
        <span className={`font-mono text-xs px-2.5 py-0.5 border uppercase tracking-wider shrink-0 ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 opacity-90">
        <div className="flex-1 text-center min-w-0">
          <div className="w-14 h-14 mx-auto bg-surface-bright flex items-center justify-center mb-2 border border-outline-variant rounded overflow-hidden p-1">
            {team1Logo ? (
              <img src={team1Logo} alt={team1} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <span className="font-display text-lg text-off-white">{team1Short}</span>
            )}
          </div>
          <h4 className="font-body font-semibold text-xs text-off-white uppercase truncate">{team1}</h4>
        </div>
        <div className="flex flex-col items-center justify-center px-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`font-display text-3xl ${score1 > score2 ? 'text-primary-red font-bold' : 'text-tactical-gray'}`}>{score1}</span>
            <span className="font-mono text-xs text-tactical-gray">-</span>
            <span className={`font-display text-3xl ${score2 > score1 ? 'text-primary-red font-bold' : 'text-tactical-gray'}`}>{score2}</span>
          </div>
          <span className="font-mono text-[11px] text-warning-amber mt-1 whitespace-nowrap">{time}</span>
        </div>
        <div className="flex-1 text-center min-w-0">
          <div className="w-14 h-14 mx-auto bg-surface-bright flex items-center justify-center mb-2 border border-outline-variant rounded overflow-hidden p-1">
            {team2Logo ? (
              <img src={team2Logo} alt={team2} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <span className="font-display text-lg text-off-white">{team2Short}</span>
            )}
          </div>
          <h4 className="font-body font-semibold text-xs text-off-white uppercase truncate">{team2}</h4>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <TactileButton variant="outline" className="text-xs flex items-center gap-2 py-1.5">
          <Bell size={13} /> XEM CHI TIẾT
        </TactileButton>
      </div>
    </div>
  );
}

// ─── Real Tournament Card ──────────────────────────────────
function RealTournamentCard({ tournament, onSelect }) {
  return (
    <div
      onClick={() => onSelect(tournament.id)}
      className="bg-surface-charcoal border border-outline-variant p-5 hover:border-primary-red transition-all group relative overflow-hidden clip-corner flex flex-col h-full cursor-pointer hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="bg-surface-bright text-off-white/80 font-mono text-[10px] px-2 py-0.5 uppercase rounded-sm border border-outline-variant/30">
          {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('vi-VN') : 'SẮP DIỄN RA'}
        </span>
        <span className="font-mono text-[10px] px-2 py-0.5 uppercase font-bold bg-success-cyan/10 text-success-cyan border border-success-cyan/20">
          {tournament.registrationStatus || 'OPEN'}
        </span>
      </div>

      <h3 className="font-display text-xl text-off-white uppercase mb-2 group-hover:text-primary-red transition-colors line-clamp-1">
        {tournament.name}
      </h3>

      <p className="font-body text-xs text-off-white/70 mb-4 flex-grow line-clamp-2 leading-relaxed">
        {tournament.rulesDescription || `Giải đấu ${tournament.name} do @${tournament.creatorUsername} tổ chức. Thể thức ${tournament.structure === 'GROUP_KNOCKOUT' ? 'Vòng Bảng + Knockout' : 'Loại Trực Tiếp'}.`}
      </p>

      <div className="flex justify-between items-center border-t border-outline-variant/30 pt-3 mt-auto">
        <div className="font-mono text-xs text-tactical-gray">
          <span>Đội: <strong className="text-off-white">{tournament.registeredTeams?.length || 0}/{tournament.maxTeams}</strong></span>
        </div>
        <TactileButton variant="ghost" className="text-xs uppercase text-primary-red flex items-center gap-1 p-0">
          THAM GIA <ArrowRight size={12} />
        </TactileButton>
      </div>
    </div>
  );
}

// ─── User Leaderboard Sidebar Widget ───────────────────────
function UserLeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await userService.getUserLeaderboard();
        if (res.success && res.data) {
          setLeaderboard(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải Bảng xếp hạng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top1 = leaderboard[0];
  const topList = leaderboard.slice(0, 8);

  return (
    <div className="bg-surface-charcoal border border-outline-variant p-6 clip-corner space-y-5 shadow-2xl sticky top-24">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-warning-amber" />
          <h3 className="font-display text-xl uppercase text-off-white tracking-wide">
            BẢNG XẾP HẠNG
          </h3>
        </div>
        <span className="font-mono text-[10px] bg-primary-red/10 text-primary-red border border-primary-red/30 px-2 py-0.5 uppercase clip-corner font-bold flex items-center gap-1">
          <Sparkles size={10} /> TOP TUYỂN THỦ
        </span>
      </div>

      {loading ? (
        <LoadingSkeleton count={5} />
      ) : topList.length === 0 ? (
        <p className="font-mono text-xs text-tactical-gray text-center py-6">Chưa có thông tin xếp hạng</p>
      ) : (
        <div className="space-y-4">
          {/* Top 1 Champion Box */}
          {top1 && (
            <div className="bg-gradient-to-r from-amber-950/70 via-surface-bright/50 to-surface-bright/20 border-2 border-amber-400/80 p-3.5 clip-corner flex items-center gap-3 relative overflow-hidden group hover:border-amber-300 transition-colors shadow-lg">
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-amber-400" />
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden bg-surface-bright flex items-center justify-center shadow-md">
                  {top1.avatarUrl ? (
                    <img src={top1.avatarUrl} alt={top1.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-amber-400" />
                  )}
                </div>
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded font-mono shadow">
                  👑 #1
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="font-display font-bold text-amber-300 text-sm truncate">
                  {top1.displayName || top1.username}
                </div>
                <div className="font-mono text-[11px] text-tactical-gray flex items-center gap-2">
                  <span className="text-success-cyan font-bold">{top1.winRate}% WR</span>
                  <span>•</span>
                  <span>{top1.matchesWon}W - {top1.matchesLost}L</span>
                </div>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="font-display text-amber-400 font-extrabold text-sm block">{top1.points}</span>
                <span className="text-[9px] text-tactical-gray uppercase">ELO</span>
              </div>
            </div>
          )}

          {/* Ranks #2 to #8 */}
          <div className="space-y-2 font-mono text-xs">
            {topList.slice(1).map((player, idx) => {
              const rank = idx + 2;
              return (
                <div
                  key={player.id || idx}
                  className="flex items-center justify-between p-2.5 bg-surface-bright/30 border border-outline-variant/30 hover:border-primary-red/50 hover:bg-surface-bright/60 transition-all clip-corner group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`font-display font-bold text-xs w-5 text-center shrink-0 ${
                      rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-tactical-gray'
                    }`}>
                      {rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>

                    <div className="w-8 h-8 rounded-full bg-surface-bright border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center">
                      {player.avatarUrl ? (
                        <img src={player.avatarUrl} alt={player.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={15} className="text-tactical-gray" />
                      )}
                    </div>

                    <div className="truncate min-w-0">
                      <p className="font-body font-semibold text-off-white text-xs truncate group-hover:text-primary-red transition-colors">
                        {player.displayName || player.username}
                      </p>
                      <p className="text-[10px] text-tactical-gray truncate">
                        @{player.username}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono pl-2">
                    <span className="font-display font-bold text-primary-red text-xs block">
                      {player.points} ELO
                    </span>
                    <span className="text-[10px] text-success-cyan">
                      {player.winRate}% WR
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Home Component ──────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Real tournaments & matches state
  const [realTournaments, setRealTournaments] = useState([]);
  const [featuredMatches, setFeaturedMatches] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);

  const MOCK_HOME_MATCHES = [
    {
      id: 9001,
      tournament: 'VCT PACIFIC 2026 - UPPER FINAL',
      status: 'ĐANG DIỄN RA',
      statusColor: 'text-primary-red border-primary-red',
      team1: 'PAPER REX',
      team1Short: 'PRX',
      team1Logo: 'https://cdn.pandascore.co/images/team/image/128489/600px_paper_rex_logo.png',
      team2: 'GEN.G ESPORTS',
      team2Short: 'GEN',
      team2Logo: 'https://cdn.pandascore.co/images/team/image/126746/600px_gen.g_all_mode.png',
      score1: 1,
      score2: 1,
      time: 'LIVE • MAP 3'
    },
    {
      id: 9002,
      tournament: 'VCT AMERICAS 2026 - GROUP STAGE',
      status: 'ĐANG DIỄN RA',
      statusColor: 'text-primary-red border-primary-red',
      team1: 'SENTINELS',
      team1Short: 'SEN',
      team1Logo: 'https://cdn.pandascore.co/images/team/image/127871/600px_sentinels_logo.png',
      team2: 'LOUD',
      team2Short: 'LOUD',
      team2Logo: 'https://cdn.pandascore.co/images/team/image/130541/600px_loud_logo.png',
      score1: 1,
      score2: 0,
      time: 'LIVE • MAP 2'
    },
    {
      id: 9010,
      tournament: 'VCT MASTERS 2026 - GRAND FINAL',
      status: 'SẮP DIỄN RA',
      statusColor: 'text-warning-amber border-warning-amber',
      team1: 'T1',
      team1Short: 'T1',
      team1Logo: 'https://cdn.pandascore.co/images/team/image/126749/600px_t1_all_mode.png',
      team2: 'DRX',
      team2Short: 'DRX',
      team2Logo: 'https://cdn.pandascore.co/images/team/image/130172/600px_drx_all_mode.png',
      score1: 0,
      score2: 0,
      time: '20:00 HÔM NAY'
    },
    {
      id: 9003,
      tournament: 'VCT EMEA 2026 - PLAYOFFS',
      status: 'ĐANG DIỄN RA',
      statusColor: 'text-primary-red border-primary-red',
      team1: 'FNATIC',
      team1Short: 'FNC',
      team1Logo: 'https://cdn.pandascore.co/images/team/image/394/600px_fnatic_2020_logo.png',
      team2: 'TEAM HERETICS',
      team2Short: 'TH',
      team2Logo: 'https://cdn.pandascore.co/images/team/image/127014/600px_team_heretics_all_mode.png',
      score1: 0,
      score2: 1,
      time: 'LIVE • MAP 2'
    }
  ];

  useEffect(() => {
    const fetchRealData = async () => {
      setLoadingTournaments(true);
      setLoadingMatches(true);
      try {
        const [tournRes, internalMatchesRes, externalRunningRes] = await Promise.allSettled([
          getAllTournaments(),
          getAllUpcomingMatches(),
          getExternalRunningMatches(1, 10)
        ]);

        if (tournRes.status === 'fulfilled' && tournRes.value?.success) {
          setRealTournaments(tournRes.value.data || []);
        }

        let combined = [];

        // 1. Dữ liệu trận đấu hệ thống (Database internal matches)
        if (internalMatchesRes.status === 'fulfilled' && internalMatchesRes.value?.data?.length > 0) {
          const internalMapped = internalMatchesRes.value.data.map(m => ({
            id: `int_${m.id}`,
            tournament: m.tournamentName?.toUpperCase() || 'GIẢI ĐẤU HỆ THỐNG',
            status: m.status === 'COMPLETED' ? 'ĐÃ KẾT THÚC' : m.status === 'IN_PROGRESS' ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA',
            statusColor: m.status === 'IN_PROGRESS' ? 'text-primary-red border-primary-red' : 'text-warning-amber border-warning-amber',
            team1: m.team1Name?.toUpperCase() || 'TEAM A',
            team1Short: m.team1Short || m.team1Name?.substring(0, 3).toUpperCase() || 'T1',
            team2: m.team2Name?.toUpperCase() || 'TEAM B',
            team2Short: m.team2Short || m.team2Name?.substring(0, 3).toUpperCase() || 'T2',
            score1: m.score1 ?? 0,
            score2: m.score2 ?? 0,
            time: m.scheduledAt ? new Date(m.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'LIVE'
          }));
          combined.push(...internalMapped);
        }

        // 2. Dữ liệu trận đấu VCT chuyên nghiệp từ PandaScore API
        if (externalRunningRes.status === 'fulfilled' && externalRunningRes.value?.data?.length > 0) {
          const extMapped = externalRunningRes.value.data.map(m => {
            const opps = m.opponents || [];
            const t1 = opps[0]?.opponent || {};
            const t2 = opps[1]?.opponent || {};
            const res = m.results || [];
            return {
              id: `ext_${m.id}`,
              tournament: `${m.league?.name || 'VCT'} - ${m.name || 'MATCH'}`.toUpperCase(),
              status: m.status === 'running' ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA',
              statusColor: m.status === 'running' ? 'text-primary-red border-primary-red' : 'text-warning-amber border-warning-amber',
              team1: t1.name?.toUpperCase() || 'TEAM A',
              team1Short: t1.acronym || t1.name?.substring(0, 3).toUpperCase() || 'T1',
              team1Logo: t1.image_url,
              team2: t2.name?.toUpperCase() || 'TEAM B',
              team2Short: t2.acronym || t2.name?.substring(0, 3).toUpperCase() || 'T2',
              team2Logo: t2.image_url,
              score1: res[0]?.score ?? 0,
              score2: res[1]?.score ?? 0,
              time: m.status === 'running' ? 'LIVE' : 'UPCOMING'
            };
          });
          combined.push(...extMapped);
        }

        if (combined.length === 0) {
          setFeaturedMatches(MOCK_HOME_MATCHES);
        } else {
          setFeaturedMatches(combined.slice(0, 4));
        }

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
        setFeaturedMatches(MOCK_HOME_MATCHES);
      } finally {
        setLoadingTournaments(false);
        setLoadingMatches(false);
      }
    };
    fetchRealData();
  }, []);

  const slides = [
    {
      id: 0,
      tag: "TRỰC TIẾP TỪ ĐẤU TRƯỜNG",
      tagColor: "text-success-cyan",
      tagPulse: true,
      titleLine1: "VCT CHALLENGERS",
      titleLine2: "VIETNAM 2026",
      titleColor: "text-primary-red",
      desc: "Giải đấu cấp độ cao nhất khu vực Việt Nam. Hành trình chinh phục ngôi vương và tấm vé vươn ra biển lớn.",
      btnText: "KHÁM PHÁ GIẢI ĐẤU",
      targetPath: "/tournaments",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfhiyFMYlGPJXvYAzH3w0mWbM7s-SJ6aBJMlG1thzv11Hu7d2DXC3biKKSTsRk6crhn7970IeG2oEyyIRhFPLRAAZ1Mb9gQDcnzkAS-2UEfCkx50Gq_OFKXuxF0c0vn07jf_XtRsd6cR5TvOHXgJgIKdJeQ_Kpy17BV0Y9-alEBxZVjCAtPtC9GQTrng4d5s1ysgGYf4FHPwBCmwoMp0NZJuEGJZqRM0SWUwT6TYQNrDIw2mqIv7jD"
    },
    {
      id: 1,
      tag: "SẮP DIỄN RA",
      tagColor: "text-warning-amber",
      tagPulse: false,
      titleLine1: "VALORANT",
      titleLine2: "CAMPUS CUP",
      titleColor: "text-warning-amber",
      desc: "Giải đấu cộng đồng lớn nhất dành cho sinh viên. Nơi tài năng trẻ được tỏa sáng.",
      btnText: "XEM LỊCH THI ĐẤU",
      targetPath: "/matches",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_wpD57ytk-6gs-XPJbV7cwaGhIGM7xh2S1qb0CFy6VTBQ2OqLbpqoqnWkvq5i3VpjpPKXcy9KLt498Bbax9UsqTOElprCICQI5dcNQqb6p-Wyeiwy9-xp9RHjGrpqB4Y96atlgM4d2pY5C3NWR7oq_pQL6_-R53kn-C-CE2xkqF2sGs4myz0_bac4inRzDAmjXe47IVJBouJAVHyzob_hrCZ6JLRPBeHWbnz_SxBTpeAgnOk0kUBf"
    },
    {
      id: 2,
      tag: "// KHỞI ĐỘNG HỆ THỐNG",
      tagColor: "text-tactical-gray",
      tagPulse: false,
      titleLine1: "DOMINATE",
      titleLine2: "THE DRAFT",
      titleColor: "text-primary-red",
      desc: "Hệ thống điều hành giải đấu tối thượng dành cho các nhà tổ chức và đội tuyển Valorant chuyên nghiệp. Đồng bộ hóa thời gian thực, quản lý cấm/chọn tự động.",
      btnText: "TẠO GIẢI ĐẤU NGAY",
      targetPath: "/tournaments",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAER0m_QbffpvEOhDh4xOrOzH912B3vSl1X4czCOe4AgIHH9GCCtepY1tmINqSrLkvK6qxL33RP1hhve9i55pSJj1Sd_3KISThEU2iPxLROXkt7vXdNguQjs7j7NU_dLDcHBdJTrvQlCz7zxXzTWpaaD4GQR61wnExShZSKIQWOnCZv1WiJGt8A0dyIBR8JTuiM_qnzTJrCDSUeHIaZf-BXZGwMcS-hGXdkj2h1S-dEqp1tEkgS0lc24vY1wskD9ccCfw"
    }
  ];

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="animate-fade-in space-y-0">
      <HeroSlider
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onSlideClick={(slide) => navigate(slide.targetPath)}
      />

      <LiveTickerBar match={featuredMatches[0]} onWatchLive={() => navigate('/matches')} />

      {/* Quick Stats Section */}
      <section className="py-8 bg-surface-charcoal border-b border-outline-variant">
        <div className="container mx-auto max-w-7xl px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r border-outline-variant/30 last:border-r-0">
            <Trophy className="w-8 h-8 mx-auto text-warning-amber mb-2" />
            <span className="font-display text-3xl text-off-white">{realTournaments.length}</span>
            <p className="font-mono text-xs text-tactical-gray uppercase mt-1">Giải Đấu Đang Chạy</p>
          </div>
          <div className="p-4 border-r border-outline-variant/30 last:border-r-0">
            <Users className="w-8 h-8 mx-auto text-success-cyan mb-2" />
            <span className="font-display text-3xl text-off-white">
              {realTournaments.reduce((acc, t) => acc + (t.registeredTeams?.length || 0), 0)}
            </span>
            <p className="font-mono text-xs text-tactical-gray uppercase mt-1">Đội Tuyển Tham Gia</p>
          </div>
          <div className="p-4 border-r border-outline-variant/30 last:border-r-0">
            <Zap className="w-8 h-8 mx-auto text-primary-red mb-2" />
            <span className="font-display text-3xl text-off-white">100%</span>
            <p className="font-mono text-xs text-tactical-gray uppercase mt-1">Real-time Ban/Pick</p>
          </div>
          <div className="p-4">
            <Shield className="w-8 h-8 mx-auto text-off-white mb-2" />
            <span className="font-display text-3xl text-off-white">BO1 - BO5</span>
            <p className="font-mono text-xs text-tactical-gray uppercase mt-1">Chuẩn Thể Thức VCT</p>
          </div>
        </div>
      </section>

      {/* Main Content Area (Layout Grid with Sidebar on Right) */}
      <section className="py-12 bg-background">
        <div className="container mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Featured Matches & Real Tournaments (8 cols) */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Featured Matches Section */}
              <div id="featured">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl uppercase text-off-white">NỔI BẬT LÚC NÀY</h2>
                    <p className="font-mono text-xs text-tactical-gray mt-1 uppercase">// CÁC TRẬN ĐẤU ĐÁNG CHÚ Ý</p>
                  </div>
                  <TactileButton onClick={() => navigate('/matches')} variant="outline" size="sm" className="flex items-center gap-1">
                    XEM TẤT CẢ <ArrowRight size={12} />
                  </TactileButton>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loadingMatches ? (
                    <LoadingSkeleton type="card" count={2} />
                  ) : (
                    featuredMatches.map((m) => (
                      <MatchCard
                        key={m.id}
                        tournament={m.tournament}
                        status={m.status}
                        statusColor={m.statusColor}
                        team1={m.team1}
                        team1Short={m.team1Short}
                        team1Logo={m.team1Logo}
                        team2={m.team2}
                        team2Short={m.team2Short}
                        team2Logo={m.team2Logo}
                        score1={m.score1}
                        score2={m.score2}
                        time={m.time}
                        onClick={() => navigate('/matches')}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Real Tournaments Section */}
              <div id="upcoming">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl uppercase text-off-white">GIẢI ĐẤU TRÊN HỆ THỐNG</h2>
                    <p className="font-mono text-xs text-tactical-gray mt-1 uppercase">// ĐĂNG KÝ THAM GIA HOẶC THEO DÕI REALTIME</p>
                  </div>
                  <TactileButton onClick={() => navigate('/tournaments')} variant="outline" size="sm" className="flex items-center gap-1">
                    XEM TẤT CẢ GIẢI ĐẤU <ArrowRight size={12} />
                  </TactileButton>
                </div>

                {loadingTournaments ? (
                  <LoadingSkeleton type="card" count={2} />
                ) : realTournaments.length === 0 ? (
                  <div className="text-center py-12 border border-outline-variant/30 bg-surface-charcoal">
                    <Trophy size={40} className="mx-auto text-tactical-gray mb-3" />
                    <p className="font-display text-xl text-off-white uppercase">Chưa có giải đấu nào</p>
                    <p className="font-mono text-xs text-tactical-gray mt-1">Hãy đăng nhập và tạo giải đấu đầu tiên!</p>
                    <TactileButton variant="primary" onClick={() => navigate('/tournaments')} className="mt-4">
                      TẠO GIẢI ĐẤU NGAY
                    </TactileButton>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {realTournaments.slice(0, 6).map((t) => (
                      <RealTournamentCard
                        key={t.id}
                        tournament={t}
                        onSelect={(id) => navigate(`/tournaments/${id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: User Leaderboard Sidebar Widget (4 cols) */}
            <div className="lg:col-span-4">
              <UserLeaderboardWidget />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

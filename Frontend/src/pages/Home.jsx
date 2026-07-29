import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight, MonitorPlay, Bell, Trophy, Shield, Users, Zap } from 'lucide-react';
import TactileButton from '../components/common/TactileButton';
import { getAllTournaments } from '../services/tournamentService';
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
function LiveTickerBar({ onWatchLive }) {
  return (
    <section className="bg-surface-charcoal border-b border-outline-variant relative z-20">
      <div className="container mx-auto max-w-7xl px-6 md:px-12 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="bg-primary-red text-off-white font-display text-xs px-3 py-1 flex items-center gap-1.5 rounded-sm uppercase tracking-wider font-bold">
            <span className="w-2 h-2 bg-off-white rounded-full animate-pulse"></span> LIVE NOW
          </span>
          <span className="font-mono text-xs text-tactical-gray uppercase tracking-wider hidden md:inline-block">
            VCT CHALLENGERS VN - BÁN KẾT NHÁNH THẮNG
          </span>
        </div>
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-body font-semibold text-off-white/60 uppercase hidden sm:inline-block text-xs">TEAM SECRET</span>
              <span className="font-display text-lg text-off-white">TS</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-1.5 rounded border border-outline-variant">
              <span className="font-display text-lg text-primary-red">1</span>
              <span className="font-mono text-xs text-tactical-gray">-</span>
              <span className="font-display text-lg text-off-white">0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg text-off-white">PRX</span>
              <span className="font-body font-semibold text-off-white/60 uppercase hidden sm:inline-block text-xs">PAPER REX</span>
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
function MatchCard({ tournament, status, statusColor, team1, team1Short, team2, team2Short, time, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-surface-charcoal border border-outline-variant p-6 hover:border-warning-amber transition-colors group relative overflow-hidden clip-corner-top cursor-pointer"
    >
      <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
        <span className="font-mono text-xs text-tactical-gray uppercase tracking-wider">{tournament}</span>
        <span className={`font-mono text-xs px-2.5 py-0.5 border uppercase tracking-wider ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 opacity-90">
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto bg-surface-bright flex items-center justify-center mb-2 border border-outline-variant">
            <span className="font-display text-xl text-off-white">{team1Short}</span>
          </div>
          <h4 className="font-body font-semibold text-sm text-off-white uppercase truncate">{team1}</h4>
        </div>
        <div className="flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-4">
            <span className="font-display text-4xl text-tactical-gray">0</span>
            <span className="font-mono text-sm text-tactical-gray">-</span>
            <span className="font-display text-4xl text-tactical-gray">0</span>
          </div>
          <span className="font-body text-xs text-off-white/70 mt-2 whitespace-nowrap">{time}</span>
        </div>
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto bg-surface-bright flex items-center justify-center mb-2 border border-outline-variant">
            <span className="font-display text-xl text-off-white">{team2Short}</span>
          </div>
          <h4 className="font-body font-semibold text-sm text-off-white uppercase truncate">{team2}</h4>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <TactileButton variant="outline" className="text-xs flex items-center gap-2">
          <Bell size={14} /> XEM CHI TIẾT
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
      className="bg-surface-charcoal border border-outline-variant p-6 hover:border-primary-red transition-all group relative overflow-hidden clip-corner flex flex-col h-full cursor-pointer hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="bg-surface-bright text-off-white/80 font-mono text-[10px] px-2.5 py-1 uppercase rounded-sm border border-outline-variant/30">
          {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('vi-VN') : 'SẮP DIỄN RA'}
        </span>
        <span className="font-mono text-[10px] px-2 py-0.5 uppercase font-bold bg-success-cyan/10 text-success-cyan border border-success-cyan/20">
          {tournament.registrationStatus || 'OPEN'}
        </span>
      </div>

      <h3 className="font-display text-2xl text-off-white uppercase mb-2 group-hover:text-primary-red transition-colors line-clamp-1">
        {tournament.name}
      </h3>

      <p className="font-body text-sm text-off-white/70 mb-6 flex-grow line-clamp-2 leading-relaxed">
        {tournament.rulesDescription || `Giải đấu ${tournament.name} do @${tournament.creatorUsername} tổ chức. Thể thức ${tournament.structure === 'GROUP_KNOCKOUT' ? 'Vòng Bảng + Knockout' : 'Loại Trực Tiếp'}.`}
      </p>

      <div className="flex justify-between items-center border-t border-outline-variant/30 pt-4 mt-auto">
        <div className="font-mono text-xs text-tactical-gray">
          <span>Đội: <strong className="text-off-white">{tournament.registeredTeams?.length || 0}/{tournament.maxTeams}</strong></span>
        </div>
        <TactileButton variant="ghost" className="text-xs uppercase text-primary-red flex items-center gap-1">
          THAM GIA <ArrowRight size={12} />
        </TactileButton>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Real tournaments state
  const [realTournaments, setRealTournaments] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      setLoadingTournaments(true);
      try {
        const res = await getAllTournaments();
        if (res.success) {
          setRealTournaments(res.data || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải giải đấu thực:", err);
      } finally {
        setLoadingTournaments(false);
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
    <div className="animate-fade-in">
      <HeroSlider
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        onSlideClick={(slide) => navigate(slide.targetPath)}
      />

      <LiveTickerBar onWatchLive={() => navigate('/matches')} />

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

      {/* Featured Matches Section */}
      <section className="py-16 bg-surface-container-low border-b border-outline-variant" id="featured">
        <div className="container mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-display text-3xl uppercase text-off-white">NỔI BẬT LÚC NÀY</h2>
              <p className="font-mono text-xs text-tactical-gray mt-1 uppercase">// CÁC TRẬN ĐẤU ĐÁNG CHÚ Ý</p>
            </div>
            <TactileButton onClick={() => navigate('/matches')} variant="outline" size="sm" className="flex items-center gap-1">
              XEM TẤT CẢ <ArrowRight size={12} />
            </TactileButton>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MatchCard
              tournament="GIẢI ĐẤU CỘNG ĐỒNG - CHUNG KẾT"
              status="SẮP DIỄN RA"
              statusColor="text-warning-amber border-warning-amber"
              team1="VIKING ESPORTS"
              team1Short="VK"
              team2="FANCY UNITED"
              team2Short="FC"
              time="19:00 HÔM NAY"
              onClick={() => navigate('/matches')}
            />
            <MatchCard
              tournament="VCT CHALLENGERS VN - VÒNG BẢNG"
              status="ĐANG DIỄN RA"
              statusColor="text-primary-red border-primary-red"
              team1="TEAM FLASH"
              team1Short="FL"
              team2="CERBERUS"
              team2Short="CB"
              time="LIVE"
              onClick={() => navigate('/matches')}
            />
          </div>
        </div>
      </section>

      {/* Real Tournaments Section (Fetched from Backend) */}
      <section className="py-16 bg-background" id="upcoming">
        <div className="container mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-display text-3xl uppercase text-off-white">GIẢI ĐẤU TRÊN HỆ THỐNG</h2>
              <p className="font-mono text-xs text-tactical-gray mt-1 uppercase">// ĐĂNG KÝ THAM GIA HOẶC THEO DÕI REALTIME</p>
            </div>
            <TactileButton onClick={() => navigate('/tournaments')} variant="outline" size="sm" className="flex items-center gap-1">
              XEM TẤT CẢ GIẢI ĐẤU <ArrowRight size={12} />
            </TactileButton>
          </div>

          {loadingTournaments ? (
            <LoadingSkeleton type="card" count={3} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </section>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  Swords, Trophy, Clock, RefreshCw, ChevronRight, Zap, CheckCircle2,
  Timer, Filter, ChevronDown, GitBranch, List, AlertCircle, Loader2,
  Shield
} from 'lucide-react';
import {
  getAllUpcomingMatches,
  getMatchesByTournament,
  generateBracket,
  updateMatchResult
} from '../services/matchService';
import { getAllTournaments } from '../services/tournamentService';

function TactileButton({ children, className = '', ...props }) {
  return (
    <button
      className={`transition-all active:scale-[0.97] active:-translate-y-[0.5px] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Status Badge ─────────────────────────
function StatusBadge({ status }) {
  const config = {
    running: { label: 'ĐANG THI ĐẤU', color: 'bg-primary-red/20 text-primary-red border-primary-red/40', icon: Zap },
    not_started: { label: 'SẮP DIỄN RA', color: 'bg-warning-amber/20 text-warning-amber border-warning-amber/40', icon: Timer },
    finished: { label: 'ĐÃ KẾT THÚC', color: 'bg-success-cyan/20 text-success-cyan border-success-cyan/40', icon: CheckCircle2 },
    canceled: { label: 'ĐÃ HỦY', color: 'bg-tactical-gray/20 text-tactical-gray border-tactical-gray/40', icon: AlertCircle },
    postponed: { label: 'HOÃN', color: 'bg-tactical-gray/20 text-tactical-gray border-tactical-gray/40', icon: Clock },
    // Internal statuses
    PENDING: { label: 'SẮP DIỄN RA', color: 'bg-warning-amber/20 text-warning-amber border-warning-amber/40', icon: Timer },
    LIVE: { label: 'ĐANG THI ĐẤU', color: 'bg-primary-red/20 text-primary-red border-primary-red/40', icon: Zap },
    COMPLETED: { label: 'ĐÃ KẾT THÚC', color: 'bg-success-cyan/20 text-success-cyan border-success-cyan/40', icon: CheckCircle2 },
    CANCELLED: { label: 'ĐÃ HỦY', color: 'bg-tactical-gray/20 text-tactical-gray border-tactical-gray/40', icon: AlertCircle },
  };
  const s = config[status] || config['not_started'];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase border ${s.color} tracking-wider`}>
      <Icon size={10} /> {s.label}
    </span>
  );
}

// ─── Internal System Match Card ──────────
function InternalSystemMatchCard({ match }) {
  const team1Name = match.team1Name || 'TBD';
  const team2Name = match.team2Name || 'TBD';
  const score1 = match.scoreTeam1 ?? '-';
  const score2 = match.scoreTeam2 ?? '-';
  const scheduledAt = match.scheduledTime;
  const tournamentName = match.tournamentName || 'Giải Đấu Nội Bộ';
  const matchName = match.stage === 'GROUP' ? `Vòng Bảng - Bảng ${match.groupName} - Trận ${match.positionInRound}` : `Vòng ${match.roundNumber} - Trận ${match.positionInRound}`;
  const status = match.status || 'PENDING';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const isLive = status === 'LIVE';

  return (
    <div className={`bg-surface-charcoal border ${isLive ? 'border-primary-red/60 shadow-lg shadow-primary-red/10' : 'border-outline-variant'} p-4 clip-corner hover:border-primary-red/40 transition-all group`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Trophy size={12} className="text-warning-amber shrink-0" />
          <span className="font-mono text-[10px] text-tactical-gray truncate">{tournamentName}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Match Name */}
      <p className="font-mono text-[10px] text-tactical-gray/60 mb-2 truncate">{matchName}</p>

      {/* Teams */}
      <div className="flex items-center gap-3">
        {/* Team 1 */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 bg-background border border-outline-variant rounded overflow-hidden flex items-center justify-center">
            {match.team1LogoUrl ? (
              <img src={match.team1LogoUrl} alt={team1Name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : <Shield size={14} className="text-tactical-gray/40" />}
          </div>
          <span className={`font-display text-sm uppercase truncate ${score1 > score2 ? 'text-off-white font-bold' : 'text-tactical-gray'}`}>
            {team1Name}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-1 shrink-0">
          <span className={`font-display text-xl w-8 text-center ${score1 > score2 ? 'text-primary-red' : 'text-tactical-gray'}`}>
            {score1}
          </span>
          <span className="text-tactical-gray/40 font-mono text-xs">:</span>
          <span className={`font-display text-xl w-8 text-center ${score2 > score1 ? 'text-primary-red' : 'text-tactical-gray'}`}>
            {score2}
          </span>
        </div>

        {/* Team 2 */}
        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          <span className={`font-display text-sm uppercase truncate text-right ${score2 > score1 ? 'text-off-white font-bold' : 'text-tactical-gray'}`}>
            {team2Name}
          </span>
          <div className="w-8 h-8 shrink-0 bg-background border border-outline-variant rounded overflow-hidden flex items-center justify-center">
            {match.team2LogoUrl ? (
              <img src={match.team2LogoUrl} alt={team2Name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : <Shield size={14} className="text-tactical-gray/40" />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-outline-variant/40 flex items-center justify-between">
        <span className="font-mono text-[10px] text-tactical-gray flex items-center gap-1">
          <Clock size={10} /> {formatDate(scheduledAt)}
        </span>
        {match.format && (
          <span className="font-mono text-[10px] text-warning-amber">
            {match.format}
          </span>
        )}
      </div>

      {/* Live indicator */}
      {isLive && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-primary-red rounded-full animate-pulse"></span>
          <span className="font-mono text-[10px] text-primary-red uppercase tracking-widest">Live</span>
        </div>
      )}
    </div>
  );
}

// ─── Internal Bracket Node ───────────────
function BracketMatchNode({ match, isOrganizer, currentUser, onUpdateScore }) {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';
  const team1Wins = match.winnerId && match.winnerId === match.team1Id;
  const team2Wins = match.winnerId && match.winnerId === match.team2Id;

  return (
    <div className={`w-56 bg-surface-charcoal border ${isLive ? 'border-primary-red/60' : isCompleted ? 'border-success-cyan/40' : 'border-outline-variant'} text-xs`}>
      {/* Team 1 */}
      <div className={`flex items-center justify-between px-2.5 py-1.5 border-b border-outline-variant/30 ${team1Wins ? 'bg-success-cyan/10' : ''}`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {match.team1LogoUrl && (
            <img src={match.team1LogoUrl} alt="" className="w-4 h-4 object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <span className={`font-display uppercase truncate ${team1Wins ? 'text-success-cyan font-bold' : match.team1Name ? 'text-off-white' : 'text-tactical-gray/40'}`}>
            {match.team1Name || 'TBD'}
          </span>
        </div>
        <span className={`font-display text-sm w-6 text-center ${team1Wins ? 'text-success-cyan font-bold' : 'text-tactical-gray'}`}>
          {match.team1Name ? match.scoreTeam1 : '-'}
        </span>
      </div>

      {/* Team 2 */}
      <div className={`flex items-center justify-between px-2.5 py-1.5 ${team2Wins ? 'bg-success-cyan/10' : ''}`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {match.team2LogoUrl && (
            <img src={match.team2LogoUrl} alt="" className="w-4 h-4 object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <span className={`font-display uppercase truncate ${team2Wins ? 'text-success-cyan font-bold' : match.team2Name ? 'text-off-white' : 'text-tactical-gray/40'}`}>
            {match.team2Name || 'TBD'}
          </span>
        </div>
        <span className={`font-display text-sm w-6 text-center ${team2Wins ? 'text-success-cyan font-bold' : 'text-tactical-gray'}`}>
          {match.team2Name ? match.scoreTeam2 : '-'}
        </span>
      </div>

      {/* Organizer actions */}
      {isOrganizer && match.team1Name && match.team2Name && !isCompleted && (
        <div className="border-t border-outline-variant/30 px-2 py-1">
          <button
            onClick={() => onUpdateScore(match)}
            className="w-full text-center font-mono text-[9px] text-warning-amber hover:text-off-white transition-colors uppercase tracking-wider"
          >
            Nhập Kết Quả
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Score Modal ──────────────────────────
function ScoreModal({ match, onClose, onSubmit, loading }) {
  const [scoreTeam1, setScoreTeam1] = useState(match.scoreTeam1 || 0);
  const [scoreTeam2, setScoreTeam2] = useState(match.scoreTeam2 || 0);
  const [winnerId, setWinnerId] = useState(null);

  const handleSubmit = () => {
    if (!winnerId) {
      alert('Vui lòng chọn đội chiến thắng!');
      return;
    }
    onSubmit({
      scoreTeam1,
      scoreTeam2,
      winnerId,
      status: 'COMPLETED'
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-surface-charcoal border border-outline-variant w-full max-w-md p-6 clip-corner">
        <h3 className="font-display text-lg text-off-white uppercase mb-1">Nhập Kết Quả Trận Đấu</h3>
        <p className="font-mono text-[10px] text-tactical-gray mb-6">// Vòng {match.roundNumber} — Trận {match.positionInRound}</p>

        <div className="space-y-4">
          {/* Team 1 Score */}
          <div className="flex items-center gap-3">
            <div className={`flex-1 p-3 border cursor-pointer transition-all ${winnerId === match.team1Id ? 'border-success-cyan bg-success-cyan/10' : 'border-outline-variant hover:border-primary-red/40'}`}
              onClick={() => setWinnerId(match.team1Id)}>
              <span className="font-display text-sm uppercase text-off-white">{match.team1Name}</span>
            </div>
            <input
              type="number"
              min="0"
              value={scoreTeam1}
              onChange={(e) => setScoreTeam1(parseInt(e.target.value) || 0)}
              className="w-16 bg-background border border-outline-variant p-2 text-center text-off-white font-display text-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div className="text-center font-mono text-xs text-tactical-gray">VS</div>

          {/* Team 2 Score */}
          <div className="flex items-center gap-3">
            <div className={`flex-1 p-3 border cursor-pointer transition-all ${winnerId === match.team2Id ? 'border-success-cyan bg-success-cyan/10' : 'border-outline-variant hover:border-primary-red/40'}`}
              onClick={() => setWinnerId(match.team2Id)}>
              <span className="font-display text-sm uppercase text-off-white">{match.team2Name}</span>
            </div>
            <input
              type="number"
              min="0"
              value={scoreTeam2}
              onChange={(e) => setScoreTeam2(parseInt(e.target.value) || 0)}
              className="w-16 bg-background border border-outline-variant p-2 text-center text-off-white font-display text-lg focus:outline-none focus:border-primary-red"
            />
          </div>
        </div>

        {winnerId && (
          <p className="mt-3 font-mono text-xs text-success-cyan">
            ✓ Đội thắng: {winnerId === match.team1Id ? match.team1Name : match.team2Name}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <TactileButton onClick={onClose} className="flex-1 border border-outline-variant text-tactical-gray font-display text-xs py-2.5 uppercase hover:bg-surface-bright/20">
            HỦY
          </TactileButton>
          <TactileButton
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-primary-red text-off-white font-display text-xs py-2.5 uppercase font-bold hover:bg-primary-red/90 disabled:opacity-50"
          >
            {loading ? 'ĐANG LƯU...' : 'XÁC NHẬN KẾT QUẢ'}
          </TactileButton>
        </div>
      </div>
    </div>
  );
}

function GenerateBracketModal({ onClose, onSubmit, loading }) {
  const [earlyRoundsFormat, setEarlyRoundsFormat] = useState('BO1');
  const [semiFinalsFormat, setSemiFinalsFormat] = useState('BO3');
  const [finalsFormat, setFinalsFormat] = useState('BO5');

  const renderFormatSelector = (label, currentValue, setValue) => (
    <div className="mb-4">
      <label className="block font-mono text-[11px] uppercase text-tactical-gray mb-1.5">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {['BO1', 'BO3', 'BO5'].map((fmt) => (
          <div
            key={fmt}
            onClick={() => setValue(fmt)}
            className={`p-2 text-center border cursor-pointer font-display text-xs uppercase transition-all ${
              currentValue === fmt
                ? 'border-warning-amber bg-warning-amber/15 text-warning-amber font-bold'
                : 'border-outline-variant text-off-white hover:border-tactical-gray'
            }`}
          >
            {fmt}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-surface-charcoal border border-outline-variant w-full max-w-md p-6 clip-corner">
        <h3 className="font-display text-lg text-off-white uppercase mb-1">Tạo Sơ Đồ Thi Đấu</h3>
        <p className="font-mono text-[10px] text-tactical-gray mb-6">// Chọn thể thức thi đấu cho từng giai đoạn</p>

        <div className="space-y-2">
          {renderFormatSelector('Vòng ngoài (Loại trực tiếp)', earlyRoundsFormat, setEarlyRoundsFormat)}
          {renderFormatSelector('Bán Kết', semiFinalsFormat, setSemiFinalsFormat)}
          {renderFormatSelector('Chung Kết', finalsFormat, setFinalsFormat)}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <TactileButton onClick={onClose} disabled={loading} className="px-4 py-2 border border-outline-variant text-tactical-gray font-mono text-xs hover:text-off-white">
            Hủy
          </TactileButton>
          <TactileButton 
            onClick={() => onSubmit({ earlyRoundsFormat, semiFinalsFormat, finalsFormat })} 
            disabled={loading} 
            className="px-4 py-2 bg-warning-amber text-background font-display text-xs uppercase font-bold hover:bg-warning-amber/90"
          >
            {loading ? 'Đang tạo...' : 'Xác Nhận Tạo Bracket'}
          </TactileButton>
        </div>
      </div>
    </div>
  );
}

const MOCK_EXTERNAL_MATCHES = {
  running: [
    {
      id: 9001,
      name: 'Upper Bracket Final',
      status: 'running',
      scheduled_at: new Date().toISOString(),
      number_of_games: 3,
      league: { name: 'VCT International 2026' },
      serie: { full_name: 'Masters Kickoff' },
      tournament: { name: 'Champions Tour Playoffs' },
      opponents: [
        { opponent: { name: 'Sentinels', image_url: null } },
        { opponent: { name: 'Paper Rex', image_url: null } }
      ],
      results: [{ score: 1 }, { score: 1 }]
    }
  ],
  upcoming: [
    {
      id: 9002,
      name: 'Lower Semifinal',
      status: 'not_started',
      scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      number_of_games: 3,
      league: { name: 'VCT Champions 2026' },
      serie: { full_name: 'Pacific Stage 1' },
      tournament: { name: 'Group Alpha' },
      opponents: [
        { opponent: { name: 'Gen.G Esports', image_url: null } },
        { opponent: { name: 'Fnatic', image_url: null } }
      ],
      results: [{ score: 0 }, { score: 0 }]
    },
    {
      id: 9003,
      name: 'Group B Decider Match',
      status: 'not_started',
      scheduled_at: new Date(Date.now() + 172800000).toISOString(),
      number_of_games: 3,
      league: { name: 'VCT EMEA 2026' },
      serie: { full_name: 'Stage 1 Regular Season' },
      tournament: { name: 'Week 3' },
      opponents: [
        { opponent: { name: 'Team Liquid', image_url: null } },
        { opponent: { name: 'EDward Gaming', image_url: null } }
      ],
      results: [{ score: 0 }, { score: 0 }]
    }
  ],
  past: [
    {
      id: 9004,
      name: 'Grand Final',
      status: 'finished',
      scheduled_at: new Date(Date.now() - 86400000).toISOString(),
      number_of_games: 5,
      league: { name: 'VCT Masters Madrid' },
      serie: { full_name: 'Grand Final BO5' },
      tournament: { name: 'Playoffs' },
      opponents: [
        { opponent: { name: 'Sentinels', image_url: null } },
        { opponent: { name: 'Gen.G Esports', image_url: null } }
      ],
      results: [{ score: 3 }, { score: 2 }]
    }
  ]
};

// ─── Main Component ──────────────────────
export default function MatchSchedule({ currentUser }) {
  const [viewMode, setViewMode] = useState('external'); // 'external' | 'bracket'
  const [externalFilter, setExternalFilter] = useState('upcoming'); // 'upcoming' | 'running' | 'past'
  const [externalMatches, setExternalMatches] = useState([]);
  const [internalMatches, setInternalMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scoreModal, setScoreModal] = useState({ open: false, match: null });
  const [scoreLoading, setScoreLoading] = useState(false);
  const [generateModal, setGenerateModal] = useState({ open: false });

  // Fetch internal matches
  const fetchExternalMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllUpcomingMatches();
      if (res.success && res.data) {
        let filtered = [];
        if (externalFilter === 'running') {
           filtered = res.data.filter(m => m.status === 'LIVE');
        } else if (externalFilter === 'upcoming') {
           filtered = res.data.filter(m => m.status === 'PENDING');
        } else {
           filtered = res.data.filter(m => m.status === 'COMPLETED' || m.status === 'CANCELLED');
        }
        setExternalMatches(filtered);
      } else {
        setExternalMatches([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch thi đấu hệ thống:', err);
      setExternalMatches([]);
    } finally {
      setLoading(false);
    }
  }, [externalFilter]);

  // Fetch tournaments for bracket view
  const fetchTournaments = useCallback(async () => {
    try {
      const res = await getAllTournaments();
      if (res.success) {
        setTournaments(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách giải:', err);
    }
  }, []);

  // Fetch internal bracket
  const fetchBracket = useCallback(async (tournamentId) => {
    if (!tournamentId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getMatchesByTournament(tournamentId);
      if (res.success) {
        setInternalMatches(res.data || []);
      }
    } catch (err) {
      setInternalMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'external') {
      fetchExternalMatches();
    } else {
      fetchTournaments();
    }
  }, [viewMode, fetchExternalMatches, fetchTournaments]);

  useEffect(() => {
    if (viewMode === 'bracket' && selectedTournamentId) {
      fetchBracket(selectedTournamentId);
    }
  }, [viewMode, selectedTournamentId, fetchBracket]);

  // Auto-refresh external matches every 30s
  useEffect(() => {
    if (viewMode !== 'external') return;
    const interval = setInterval(fetchExternalMatches, 30000);
    return () => clearInterval(interval);
  }, [viewMode, fetchExternalMatches]);

  const handleGenerateBracket = async (payload) => {
    if (!selectedTournamentId || !currentUser) return;
    setLoading(true);
    setError('');
    try {
      const res = await generateBracket(selectedTournamentId, currentUser.id, payload);
      if (res.success) {
        setGenerateModal({ open: false });
        await fetchBracket(selectedTournamentId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo sơ đồ thi đấu!');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (data) => {
    if (!scoreModal.match || !currentUser) return;
    setScoreLoading(true);
    try {
      const res = await updateMatchResult(scoreModal.match.id, data, currentUser.id);
      if (res.success) {
        setScoreModal({ open: false, match: null });
        await fetchBracket(selectedTournamentId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật kết quả!');
    } finally {
      setScoreLoading(false);
    }
  };

  // Organize matches by round for bracket view
  const matchesByRound = internalMatches.reduce((acc, m) => {
    const round = m.roundNumber;
    if (!acc[round]) acc[round] = [];
    acc[round].push(m);
    return acc;
  }, {});
  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
  const totalRounds = rounds.length;

  const getRoundLabel = (roundNum) => {
    if (roundNum === totalRounds) return 'CHUNG KẾT';
    if (roundNum === totalRounds - 1) return 'BÁN KẾT';
    if (roundNum === totalRounds - 2) return 'TỨ KẾT';
    return `VÒNG ${roundNum}`;
  };

  const isOrganizer = currentUser && (
    currentUser.globalRole === 'ADMIN' ||
    tournaments.find(t => t.id === selectedTournamentId)?.creatorId === currentUser.id ||
    tournaments.find(t => t.id === selectedTournamentId)?.organizerIds?.includes(currentUser.id)
  );

  return (
    <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
      {/* Header */}
      <div className="mb-8 border-b border-outline-variant pb-6">
        <h2 className="font-display text-4xl text-off-white uppercase tracking-wider flex items-center gap-3">
          <Swords className="text-primary-red" size={32} /> LỊCH THI ĐẤU
        </h2>
        <p className="font-mono text-xs text-tactical-gray mt-2">// Theo dõi lịch thi đấu của các giải đấu trong hệ thống</p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <TactileButton
          onClick={() => setViewMode('external')}
          className={`flex items-center gap-2 px-4 py-2.5 font-display text-xs uppercase tracking-wider border ${
            viewMode === 'external' ? 'bg-primary-red border-primary-red text-off-white' : 'border-outline-variant text-tactical-gray hover:text-off-white hover:border-primary-red/40'
          }`}
        >
          <Zap size={14} /> Lịch Đấu Hệ Thống
        </TactileButton>
        <TactileButton
          onClick={() => setViewMode('bracket')}
          className={`flex items-center gap-2 px-4 py-2.5 font-display text-xs uppercase tracking-wider border ${
            viewMode === 'bracket' ? 'bg-primary-red border-primary-red text-off-white' : 'border-outline-variant text-tactical-gray hover:text-off-white hover:border-primary-red/40'
          }`}
        >
          <GitBranch size={14} /> Bracket Giải Đấu
        </TactileButton>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-primary-red/10 border border-primary-red text-primary-red font-mono text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ═══ EXTERNAL MATCHES VIEW ═══ */}
      {viewMode === 'external' && (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex gap-2">
              {[
                { key: 'running', label: 'Đang Diễn Ra', icon: Zap },
                { key: 'upcoming', label: 'Sắp Diễn Ra', icon: Timer },
                { key: 'past', label: 'Đã Kết Thúc', icon: CheckCircle2 },
              ].map(({ key, label, icon: Icon }) => (
                <TactileButton
                  key={key}
                  onClick={() => setExternalFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 font-display text-[11px] uppercase tracking-wider border ${
                    externalFilter === key ? 'bg-surface-bright/40 border-primary-red/60 text-off-white' : 'border-outline-variant/40 text-tactical-gray hover:text-off-white'
                  }`}
                >
                  <Icon size={12} /> {label}
                </TactileButton>
              ))}
            </div>
            <TactileButton
              onClick={fetchExternalMatches}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] text-tactical-gray hover:text-off-white border border-outline-variant/40"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
            </TactileButton>
          </div>

          {/* Match Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary-red" size={32} />
              <span className="ml-3 font-mono text-sm text-tactical-gray">Đang tải dữ liệu trận đấu...</span>
            </div>
          ) : externalMatches.length === 0 ? (
            <div className="text-center py-16 border border-outline-variant/30 bg-surface-charcoal/50">
              <Swords size={48} className="mx-auto text-tactical-gray/30 mb-4" />
              <p className="font-display text-lg text-tactical-gray uppercase">Không có trận đấu nào</p>
              <p className="font-mono text-xs text-tactical-gray/60 mt-2">
                {externalFilter === 'running' ? 'Hiện không có trận đấu nào đang diễn ra.' :
                  externalFilter === 'upcoming' ? 'Chưa có lịch thi đấu mới.' : 'Không tìm thấy kết quả.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {externalMatches.map((match) => (
                <InternalSystemMatchCard key={match.id} match={match} />
              ))}
            </div>
          )}

          {/* Auto-refresh indicator */}
          <div className="mt-6 text-center">
            <span className="font-mono text-[10px] text-tactical-gray/40">
              // Tự động cập nhật mỗi 30 giây • Dữ liệu trực tiếp từ hệ thống
            </span>
          </div>
        </>
      )}

      {/* ═══ BRACKET VIEW ═══ */}
      {viewMode === 'bracket' && (
        <>
          {/* Tournament Selector */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-tactical-gray" />
              <span className="font-mono text-xs text-tactical-gray uppercase">Chọn giải đấu:</span>
            </div>
            <select
              value={selectedTournamentId || ''}
              onChange={(e) => setSelectedTournamentId(e.target.value ? Number(e.target.value) : null)}
              className="bg-background border border-outline-variant px-4 py-2 text-off-white font-body text-sm focus:outline-none focus:border-primary-red min-w-[250px]"
            >
              <option value="">-- Chọn giải đấu --</option>
              {tournaments.filter(t => t.approvalStatus === 'APPROVED' || t.registrationStatus === 'IN_PROGRESS').map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.registrationStatus})</option>
              ))}
            </select>

            {/* Generate Bracket Button (Organizer only) */}
            {isOrganizer && selectedTournamentId && internalMatches.length === 0 && (
              <TactileButton
                onClick={() => setGenerateModal({ open: true })}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-warning-amber text-background font-display text-xs uppercase font-bold hover:bg-warning-amber/90 disabled:opacity-50"
              >
                <GitBranch size={14} /> Tạo Bracket Tự Động
              </TactileButton>
            )}
          </div>

          {!selectedTournamentId ? (
            <div className="text-center py-16 border border-outline-variant/30 bg-surface-charcoal/50">
              <GitBranch size={48} className="mx-auto text-tactical-gray/30 mb-4" />
              <p className="font-display text-lg text-tactical-gray uppercase">Chọn giải đấu</p>
              <p className="font-mono text-xs text-tactical-gray/60 mt-2">Vui lòng chọn một giải đấu để xem sơ đồ thi đấu.</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary-red" size={32} />
            </div>
          ) : internalMatches.length === 0 ? (
            <div className="text-center py-16 border border-outline-variant/30 bg-surface-charcoal/50">
              <GitBranch size={48} className="mx-auto text-tactical-gray/30 mb-4" />
              <p className="font-display text-lg text-tactical-gray uppercase">Chưa có sơ đồ thi đấu</p>
              <p className="font-mono text-xs text-tactical-gray/60 mt-2">
                {isOrganizer ? 'Bấm nút "Tạo Bracket Tự Động" để khởi tạo sơ đồ thi đấu.' : 'BTC giải đấu chưa tạo sơ đồ thi đấu cho giải này.'}
              </p>
            </div>
          ) : (
            /* Bracket Tree */
            <div className="overflow-x-auto pb-6">
              <div className="flex gap-8 min-w-max px-4">
                {rounds.map((roundNum, roundIndex) => (
                  <div key={roundNum} className="flex flex-col">
                    {/* Round Header */}
                    <div className="text-center mb-4 pb-2 border-b border-outline-variant/30">
                      <span className="font-display text-xs uppercase tracking-widest text-warning-amber">
                        {getRoundLabel(roundNum)}
                      </span>
                    </div>

                    {/* Matches in round */}
                    <div
                      className="flex flex-col justify-around flex-1"
                      style={{ gap: `${Math.pow(2, roundIndex) * 16}px` }}
                    >
                      {(matchesByRound[roundNum] || [])
                        .sort((a, b) => a.positionInRound - b.positionInRound)
                        .map((match) => (
                          <div key={match.id} className="flex items-center">
                            <BracketMatchNode
                              match={match}
                              isOrganizer={isOrganizer}
                              currentUser={currentUser}
                              onUpdateScore={(m) => setScoreModal({ open: true, match: m })}
                            />
                            {roundIndex < rounds.length - 1 && (
                              <div className="w-8 border-t border-outline-variant/40 ml-0"></div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Score Modal */}
      {scoreModal.open && scoreModal.match && (
        <ScoreModal
          match={scoreModal.match}
          onClose={() => setScoreModal({ open: false, match: null })}
          onSubmit={handleScoreSubmit}
          loading={scoreLoading}
        />
      )}

      {/* Generate Bracket Modal */}
      {generateModal.open && (
        <GenerateBracketModal
          onClose={() => setGenerateModal({ open: false })}
          onSubmit={(payload) => handleGenerateBracket(payload)}
          loading={loading}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Swords, Trophy, Clock, RefreshCw, ChevronRight, Zap, CheckCircle2,
  Timer, Filter, ChevronDown, GitBranch, List, AlertCircle, Loader2,
  Shield, User, Eye, ArrowRight, Settings, PlayCircle
} from 'lucide-react';
import {
  getAllUpcomingMatches,
  getExternalUpcomingMatches,
  getExternalRunningMatches,
  getExternalPastMatches,
  getMatchesByTournament,
  generateBracket,
  updateMatchResult
} from '../services/matchService';
import { getAllTournaments } from '../services/tournamentService';
import { teamService } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import TactileButton from '../components/common/TactileButton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// ─── Status Badge ─────────────────────────
function StatusBadge({ status }) {
  const config = {
    running: { label: 'ĐANG THI ĐẤU', color: 'bg-primary-red/20 text-primary-red border-primary-red/40 animate-pulse', icon: Zap },
    not_started: { label: 'SẮP DIỄN RA', color: 'bg-warning-amber/20 text-warning-amber border-warning-amber/40', icon: Timer },
    finished: { label: 'ĐÃ KẾT THÚC', color: 'bg-success-cyan/20 text-success-cyan border-success-cyan/40', icon: CheckCircle2 },
    canceled: { label: 'ĐÃ HỦY', color: 'bg-tactical-gray/20 text-tactical-gray border-tactical-gray/40', icon: AlertCircle },
    postponed: { label: 'HOÃN', color: 'bg-tactical-gray/20 text-tactical-gray border-tactical-gray/40', icon: Clock },
    // Internal statuses
    PENDING: { label: 'SẮP DIỄN RA', color: 'bg-warning-amber/20 text-warning-amber border-warning-amber/40', icon: Timer },
    LIVE: { label: 'ĐANG BAN/PICK', color: 'bg-primary-red/20 text-primary-red border-primary-red/40 animate-pulse', icon: Zap },
    COMPLETED: { label: 'ĐÃ KẾT THÚC', color: 'bg-success-cyan/20 text-success-cyan border-success-cyan/40', icon: CheckCircle2 },
    CANCELLED: { label: 'ĐÃ HỦY', color: 'bg-tactical-gray/20 text-tactical-gray border-tactical-gray/40', icon: AlertCircle },
  };
  const s = config[status] || config['PENDING'];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase border ${s.color} tracking-wider`}>
      <Icon size={11} /> {s.label}
    </span>
  );
}

// ─── Internal Match Card (With Ban/Pick Button) ───────────
function InternalMatchCard({ match, currentUser, userTeamIds, onUpdateScore }) {
  const navigate = useNavigate();

  // Determine user role in this specific match
  const isTeam1 = userTeamIds.includes(match.team1Id);
  const isTeam2 = userTeamIds.includes(match.team2Id);
  const isPlayer = isTeam1 || isTeam2;
  const isRefOrAdmin = currentUser && (
    currentUser.globalRole === 'ADMIN' ||
    currentUser.globalRole === 'ORGANIZER' ||
    currentUser.globalRole === 'REFEREE'
  );

  let roleBadge = { label: 'KHÁN GIẢ', color: 'text-tactical-gray border-outline-variant bg-surface-charcoal', icon: Eye };
  if (isPlayer) {
    roleBadge = { label: 'VẬN ĐỘNG VIÊN', color: 'text-warning-amber border-warning-amber/40 bg-warning-amber/10', icon: User };
  } else if (isRefOrAdmin) {
    roleBadge = { label: 'TRỌNG TÀI / BTC', color: 'text-success-cyan border-success-cyan/40 bg-success-cyan/10', icon: Shield };
  }

  const RoleIcon = roleBadge.icon;
  const isLive = match.status === 'LIVE' || match.status === 'running';
  const isCompleted = match.status === 'COMPLETED' || match.status === 'FINISHED' || match.status === 'finished';

  const score1 = match.scoreTeam1 ?? 0;
  const score2 = match.scoreTeam2 ?? 0;

  return (
    <div className={`bg-surface-charcoal border ${isLive ? 'border-primary-red/80 shadow-lg shadow-primary-red/15' : isCompleted ? 'border-success-cyan/30' : isPlayer ? 'border-warning-amber/50' : 'border-outline-variant'} p-5 clip-corner hover:border-primary-red/50 transition-all flex flex-col justify-between`}>
      <div>
        {/* Top bar: Tournament name & Match status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Trophy size={14} className="text-warning-amber shrink-0" />
            <span className="font-mono text-xs font-bold text-off-white truncate uppercase">
              {match.tournamentName || 'Giải Đấu Nội Bộ'}
            </span>
          </div>
          <StatusBadge status={match.status} />
        </div>

        {/* Round & Format Info */}
        <div className="flex items-center justify-between font-mono text-[10px] text-tactical-gray mb-4 border-b border-outline-variant/30 pb-2">
          <span>// VÒNG {match.roundNumber || 1} — TRẬN {match.positionInRound || 1}</span>
          <span className="text-warning-amber font-bold">{match.format || 'BO3'}</span>
        </div>

        {/* Teams & Score Display */}
        <div className="bg-background/60 border border-outline-variant/40 p-3 mb-4 space-y-3">
          {/* Team 1 */}
          <div className={`flex items-center justify-between p-2 ${isTeam1 ? 'bg-warning-amber/10 border-l-2 border-warning-amber' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 shrink-0 bg-surface-charcoal border border-outline-variant rounded flex items-center justify-center overflow-hidden">
                {match.team1LogoUrl ? (
                  <img src={match.team1LogoUrl} alt="" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <Shield size={14} className="text-tactical-gray/40" />
                )}
              </div>
              <span className={`font-display text-sm uppercase truncate ${match.winnerId === match.team1Id ? 'text-success-cyan font-bold' : match.team1Name ? 'text-off-white' : 'text-tactical-gray/50'}`}>
                {match.team1Name || 'TBD (Chưa xác định)'}
              </span>
            </div>
            <span className={`font-display text-lg w-8 text-center ${match.winnerId === match.team1Id ? 'text-success-cyan font-bold' : 'text-off-white'}`}>
              {match.team1Name ? score1 : '-'}
            </span>
          </div>

          <div className="border-t border-outline-variant/20"></div>

          {/* Team 2 */}
          <div className={`flex items-center justify-between p-2 ${isTeam2 ? 'bg-warning-amber/10 border-l-2 border-warning-amber' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 shrink-0 bg-surface-charcoal border border-outline-variant rounded flex items-center justify-center overflow-hidden">
                {match.team2LogoUrl ? (
                  <img src={match.team2LogoUrl} alt="" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <Shield size={14} className="text-tactical-gray/40" />
                )}
              </div>
              <span className={`font-display text-sm uppercase truncate ${match.winnerId === match.team2Id ? 'text-success-cyan font-bold' : match.team2Name ? 'text-off-white' : 'text-tactical-gray/50'}`}>
                {match.team2Name || 'TBD (Chưa xác định)'}
              </span>
            </div>
            <span className={`font-display text-lg w-8 text-center ${match.winnerId === match.team2Id ? 'text-success-cyan font-bold' : 'text-off-white'}`}>
              {match.team2Name ? score2 : '-'}
            </span>
          </div>
        </div>

        {/* User Role Tag */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase border ${roleBadge.color} tracking-wider`}>
            <RoleIcon size={10} /> VAI TRÒ: {roleBadge.label}
          </span>
          {match.scheduledTime && (
            <span className="font-mono text-[10px] text-tactical-gray flex items-center gap-1">
              <Clock size={10} /> {new Date(match.scheduledTime).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-outline-variant/30">
        {/* Main Ban/Pick Button */}
        <TactileButton
          type="button"
          variant={isCompleted ? "secondary" : isLive ? "cyan" : isPlayer ? "primary" : "secondary"}
          onClick={() => navigate(`/lobby/${match.id}`)}
          className="w-full justify-center flex items-center gap-2 py-2.5 font-display text-xs uppercase tracking-wider"
        >
          {isCompleted ? (
            <>
              <Eye size={15} />
              XEM LẠI BAN/PICK & KẾT QUẢ
              <ArrowRight size={14} />
            </>
          ) : (
            <>
              <Swords size={15} />
              {isPlayer ? 'VÀO BAN/PICK THI ĐẤU' : isRefOrAdmin ? 'VÀO BAN/PICK GIÁM SÁT' : 'XEM TRỰC TIẾP BAN/PICK'}
              <ArrowRight size={14} />
            </>
          )}
        </TactileButton>

        {/* Organizer Score Update Button */}
        {isRefOrAdmin && match.team1Name && match.team2Name && !isCompleted && (
          <button
            onClick={() => onUpdateScore(match)}
            className="w-full text-center font-mono text-[10px] text-warning-amber hover:text-off-white py-1 transition-colors uppercase tracking-wider flex items-center justify-center gap-1"
          >
            <Settings size={12} /> Cập Nhật Kết Quả Trận Đấu
          </button>
        )}
      </div>
    </div>
  );
}

// ─── External Match Card ─────────────────
function ExternalMatchCard({ match }) {
  const opponents = match.opponents || [];
  const team1 = opponents[0]?.opponent || {};
  const team2 = opponents[1]?.opponent || {};
  const results = match.results || [];
  const score1 = results[0]?.score ?? '-';
  const score2 = results[1]?.score ?? '-';
  const scheduledAt = match.scheduled_at || match.begin_at;
  const leagueName = match.league?.name || 'VCT League';
  const serieName = match.serie?.full_name || '';
  const tournamentName = match.tournament?.name || '';
  const matchName = match.name || `Match #${match.id}`;
  const status = match.status || 'not_started';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const isLive = status === 'running';

  return (
    <div className={`bg-surface-charcoal border ${isLive ? 'border-primary-red/60 shadow-lg shadow-primary-red/10' : 'border-outline-variant'} p-4 clip-corner hover:border-primary-red/40 transition-all group`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Trophy size={12} className="text-warning-amber shrink-0" />
          <span className="font-mono text-[10px] text-tactical-gray truncate">{leagueName} {serieName ? `• ${serieName}` : ''}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="font-mono text-[10px] text-tactical-gray/60 mb-2 truncate">{tournamentName} — {matchName}</p>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 bg-background border border-outline-variant rounded overflow-hidden flex items-center justify-center">
            {team1.image_url ? (
              <img src={team1.image_url} alt={team1.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : <Shield size={14} className="text-tactical-gray/40" />}
          </div>
          <span className={`font-display text-sm uppercase truncate ${score1 > score2 ? 'text-off-white font-bold' : 'text-tactical-gray'}`}>
            {team1.name || 'TBD'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className={`font-display text-xl w-8 text-center ${score1 > score2 ? 'text-primary-red' : 'text-tactical-gray'}`}>
            {score1}
          </span>
          <span className="text-tactical-gray/40 font-mono text-xs">:</span>
          <span className={`font-display text-xl w-8 text-center ${score2 > score1 ? 'text-primary-red' : 'text-tactical-gray'}`}>
            {score2}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          <span className={`font-display text-sm uppercase truncate text-right ${score2 > score1 ? 'text-off-white font-bold' : 'text-tactical-gray'}`}>
            {team2.name || 'TBD'}
          </span>
          <div className="w-8 h-8 shrink-0 bg-background border border-outline-variant rounded overflow-hidden flex items-center justify-center">
            {team2.image_url ? (
              <img src={team2.image_url} alt={team2.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : <Shield size={14} className="text-tactical-gray/40" />}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-outline-variant/40 flex items-center justify-between">
        <span className="font-mono text-[10px] text-tactical-gray flex items-center gap-1">
          <Clock size={10} /> {formatDate(scheduledAt)}
        </span>
        {match.number_of_games && (
          <span className="font-mono text-[10px] text-warning-amber font-bold">
            BO{match.number_of_games}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Internal Bracket Node ───────────────
function BracketMatchNode({ match, isOrganizer, currentUser, onUpdateScore }) {
  const navigate = useNavigate();
  const isCompleted = match.status === 'COMPLETED' || match.status === 'FINISHED' || match.status === 'finished';
  const isLive = match.status === 'LIVE' || match.status === 'running';
  const team1Wins = match.winnerId && match.winnerId === match.team1Id;
  const team2Wins = match.winnerId && match.winnerId === match.team2Id;

  return (
    <div className={`w-60 bg-surface-charcoal border ${isLive ? 'border-primary-red/80' : isCompleted ? 'border-success-cyan/40' : 'border-outline-variant'} text-xs p-1 clip-corner`}>
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

      {/* Lobby Navigation Button */}
      <div className="border-t border-outline-variant/30 pt-1 mt-1 flex gap-1">
        <button
          onClick={() => navigate(`/lobby/${match.id}`)}
          className="flex-1 bg-surface-bright/40 hover:bg-primary-red hover:text-off-white text-tactical-gray font-mono text-[9px] py-1 text-center uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
        >
          {isCompleted ? <Eye size={10} /> : <Swords size={10} />}
          {isCompleted ? 'Xem Lại Ban/Pick' : 'Vào Ban/Pick'}
        </button>

        {/* Organizer actions */}
        {isOrganizer && match.team1Name && match.team2Name && !isCompleted && (
          <button
            onClick={() => onUpdateScore(match)}
            className="px-2 bg-warning-amber/10 border border-warning-amber/40 text-warning-amber font-mono text-[9px] py-1 text-center hover:bg-warning-amber hover:text-background transition-colors"
          >
            Sửa
          </button>
        )}
      </div>
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface-charcoal border border-outline-variant w-full max-w-md p-6 clip-corner">
        <h3 className="font-display text-lg text-off-white uppercase mb-1">Nhập Kết Quả Trận Đấu</h3>
        <p className="font-mono text-[10px] text-tactical-gray mb-6">// Vòng {match.roundNumber} — Trận {match.positionInRound}</p>

        <div className="space-y-4">
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
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
export default function MatchSchedule({ currentUser: propUser }) {
  const navigate = useNavigate();
  const { currentUser: authUser } = useAuth();
  const currentUser = propUser || authUser;

  // View modes: 'my-matches' | 'all-internal' | 'bracket' | 'external'
  const [viewMode, setViewMode] = useState('my-matches');
  const [externalFilter, setExternalFilter] = useState('upcoming');
  const [externalMatches, setExternalMatches] = useState([]);
  const [internalMatches, setInternalMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [userTeamIds, setUserTeamIds] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scoreModal, setScoreModal] = useState({ open: false, match: null });
  const [scoreLoading, setScoreLoading] = useState(false);
  const [generateModal, setGenerateModal] = useState({ open: false });

  // Fetch internal system matches & user's teams
  const fetchInternalMatchesAndTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch internal matches
      const resMatches = await getAllUpcomingMatches();
      if (resMatches?.success) {
        setInternalMatches(resMatches.data || []);
      } else if (Array.isArray(resMatches)) {
        setInternalMatches(resMatches);
      } else if (resMatches?.message) {
        setError(resMatches.message);
      }

      // 2. Fetch user's team IDs to filter "My Matches"
      if (currentUser?.id) {
        try {
          const resTeams = await teamService.getAllTeams();
          if (resTeams?.success && resTeams?.data) {
            const myTeams = resTeams.data.filter(team => {
              const isCaptain = team.captainId === currentUser.id;
              const isMember = team.members?.some(m => m.userId === currentUser.id && m.status === 'ACCEPTED');
              return isCaptain || isMember;
            });
            setUserTeamIds(myTeams.map(t => t.id));
          }
        } catch (teamErr) {
          console.warn('Không thể tải thông tin đội tuyển người dùng:', teamErr);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách trận đấu nội bộ:', err);
      setError('Không thể kết nối đến máy chủ backend (Port 8081). Vui lòng kiểm tra lại dịch vụ Backend.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Fetch external VCT matches
  const fetchExternalMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (externalFilter === 'running') res = await getExternalRunningMatches(1, 20);
      else if (externalFilter === 'upcoming') res = await getExternalUpcomingMatches(1, 20);
      else res = await getExternalPastMatches(1, 20);

      if (res.success && res.data && res.data.length > 0) {
        setExternalMatches(res.data);
      } else {
        setExternalMatches(MOCK_EXTERNAL_MATCHES[externalFilter] || []);
      }
    } catch (err) {
      setExternalMatches(MOCK_EXTERNAL_MATCHES[externalFilter] || []);
    } finally {
      setLoading(false);
    }
  }, [externalFilter]);

  // Fetch tournaments list
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

  // Fetch bracket matches for specific tournament
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

  // Effect depending on active tab
  useEffect(() => {
    if (viewMode === 'my-matches' || viewMode === 'all-internal') {
      fetchInternalMatchesAndTeams();
    } else if (viewMode === 'external') {
      fetchExternalMatches();
    } else if (viewMode === 'bracket') {
      fetchTournaments();
    }
  }, [viewMode, fetchInternalMatchesAndTeams, fetchExternalMatches, fetchTournaments]);

  useEffect(() => {
    if (viewMode === 'bracket' && selectedTournamentId) {
      fetchBracket(selectedTournamentId);
    }
  }, [viewMode, selectedTournamentId, fetchBracket]);

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
        if (viewMode === 'bracket' && selectedTournamentId) {
          await fetchBracket(selectedTournamentId);
        } else {
          await fetchInternalMatchesAndTeams();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật kết quả!');
    } finally {
      setScoreLoading(false);
    }
  };

  // Filter "My Matches"
  const myMatchesList = useMemo(() => {
    if (!currentUser) return [];
    const isRefOrAdmin = ['ADMIN', 'ORGANIZER', 'REFEREE'].includes(currentUser.globalRole);
    return internalMatches.filter(match => {
      const inTeam = userTeamIds.includes(match.team1Id) || userTeamIds.includes(match.team2Id);
      return inTeam || isRefOrAdmin;
    });
  }, [internalMatches, userTeamIds, currentUser]);

  // Bracket matches grouping
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
      {/* Page Title */}
      <div className="mb-8 border-b border-outline-variant pb-6">
        <h2 className="font-display text-4xl text-off-white uppercase tracking-wider flex items-center gap-3">
          <Swords className="text-primary-red" size={32} /> TRUNG TÂM THI ĐẤU & BAN/PICK
        </h2>
        <p className="font-mono text-xs text-tactical-gray mt-2">
          // Theo dõi lịch thi đấu, chọn phòng Ban/Pick Agent & Map real-time theo từng trận đấu
        </p>
      </div>

      {/* Main Tab Bar Navigation */}
      <div className="flex items-center gap-2 mb-8 flex-wrap border-b border-outline-variant/40 pb-4">
        <TactileButton
          onClick={() => setViewMode('my-matches')}
          className={`flex items-center gap-2 px-4 py-2.5 font-display text-xs uppercase tracking-wider border ${
            viewMode === 'my-matches' ? 'bg-primary-red border-primary-red text-off-white' : 'border-outline-variant text-tactical-gray hover:text-off-white'
          }`}
        >
          <User size={15} /> Trận Đấu Của Tôi {currentUser && `(${myMatchesList.length})`}
        </TactileButton>

        <TactileButton
          onClick={() => setViewMode('all-internal')}
          className={`flex items-center gap-2 px-4 py-2.5 font-display text-xs uppercase tracking-wider border ${
            viewMode === 'all-internal' ? 'bg-primary-red border-primary-red text-off-white' : 'border-outline-variant text-tactical-gray hover:text-off-white'
          }`}
        >
          <Swords size={15} /> Tất Cả Trận Đấu Hệ Thống ({internalMatches.length})
        </TactileButton>

        <TactileButton
          onClick={() => setViewMode('bracket')}
          className={`flex items-center gap-2 px-4 py-2.5 font-display text-xs uppercase tracking-wider border ${
            viewMode === 'bracket' ? 'bg-primary-red border-primary-red text-off-white' : 'border-outline-variant text-tactical-gray hover:text-off-white'
          }`}
        >
          <GitBranch size={15} /> Bracket Sơ Đồ Cây
        </TactileButton>

        <TactileButton
          onClick={() => setViewMode('external')}
          className={`flex items-center gap-2 px-4 py-2.5 font-display text-xs uppercase tracking-wider border ${
            viewMode === 'external' ? 'bg-primary-red border-primary-red text-off-white' : 'border-outline-variant text-tactical-gray hover:text-off-white'
          }`}
        >
          <Zap size={15} /> Giải Đấu VCT Quốc Tế
        </TactileButton>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-primary-red/10 border border-primary-red text-primary-red font-mono text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ═══ TAB 1: MY PARTICIPATING MATCHES ═══ */}
      {viewMode === 'my-matches' && (
        <div>
          <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-display text-xl text-off-white uppercase flex items-center gap-2">
                <User className="text-warning-amber" size={20} /> Trận Đấu Bạn Tham Gia / Giám Sát
              </h3>
              <p className="font-mono text-xs text-tactical-gray mt-1">
                // Trực tiếp vào phòng Ban/Pick để thực hiện lượt chọn Agent/Map hoặc điều hành trận đấu
              </p>
            </div>
            <TactileButton
              onClick={fetchInternalMatchesAndTeams}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs text-tactical-gray border border-outline-variant/40"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Làm Mới
            </TactileButton>
          </div>

          {!currentUser ? (
            <div className="text-center py-16 border border-outline-variant/40 bg-surface-charcoal/50 p-8 clip-corner">
              <User size={48} className="mx-auto text-tactical-gray/30 mb-4" />
              <p className="font-display text-lg text-off-white uppercase">Vui Lòng Đăng Nhập</p>
              <p className="font-mono text-xs text-tactical-gray mt-2 mb-6">
                Đăng nhập tài khoản vận động viên hoặc trọng tài để xem danh sách trận đấu cá nhân và vào phòng Ban/Pick.
              </p>
              <TactileButton variant="primary" onClick={() => navigate('/login')} className="px-6 py-2.5">
                ĐĂNG NHẬP NGAY <ArrowRight size={14} />
              </TactileButton>
            </div>
          ) : loading ? (
            <LoadingSkeleton type="card" count={4} />
          ) : myMatchesList.length === 0 ? (
            <div className="text-center py-16 border border-outline-variant/40 bg-surface-charcoal/50 p-8 clip-corner">
              <Swords size={48} className="mx-auto text-tactical-gray/30 mb-4" />
              <p className="font-display text-lg text-tactical-gray uppercase">Chưa Có Trận Đấu Nào</p>
              <p className="font-mono text-xs text-tactical-gray/70 mt-2">
                Bạn chưa tham gia đội tuyển nào có lịch thi đấu hoặc chưa có giải đấu nào gán cho bạn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myMatchesList.map(match => (
                <InternalMatchCard
                  key={match.id}
                  match={match}
                  currentUser={currentUser}
                  userTeamIds={userTeamIds}
                  onUpdateScore={(m) => setScoreModal({ open: true, match: m })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 2: ALL SYSTEM INTERNAL MATCHES ═══ */}
      {viewMode === 'all-internal' && (
        <div>
          <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-display text-xl text-off-white uppercase flex items-center gap-2">
                <Swords className="text-primary-red" size={20} /> Tất Cả Trận Đấu Trong Hệ Thống
              </h3>
              <p className="font-mono text-xs text-tactical-gray mt-1">
                // Khán giả và thành viên có thể chọn bất kỳ trận đấu nào để vào xem phòng Ban/Pick trực tiếp
              </p>
            </div>
            <TactileButton
              onClick={fetchInternalMatchesAndTeams}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs text-tactical-gray border border-outline-variant/40"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Làm Mới
            </TactileButton>
          </div>

          {loading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : internalMatches.length === 0 ? (
            <div className="text-center py-16 border border-outline-variant/40 bg-surface-charcoal/50 p-8 clip-corner">
              <Swords size={48} className="mx-auto text-tactical-gray/30 mb-4" />
              <p className="font-display text-lg text-tactical-gray uppercase">Hệ Thống Chưa Có Trận Đấu Nào</p>
              <p className="font-mono text-xs text-tactical-gray/70 mt-2">
                Ban tổ chức chưa tạo sơ đồ thi đấu cho các giải đấu hiện tại.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internalMatches.map(match => (
                <InternalMatchCard
                  key={match.id}
                  match={match}
                  currentUser={currentUser}
                  userTeamIds={userTeamIds}
                  onUpdateScore={(m) => setScoreModal({ open: true, match: m })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 3: BRACKET VIEW ═══ */}
      {viewMode === 'bracket' && (
        <>
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
            <div className="py-8"><LoadingSkeleton type="card" count={3} /></div>
          ) : internalMatches.length === 0 ? (
            <div className="text-center py-16 border border-outline-variant/30 bg-surface-charcoal/50">
              <GitBranch size={48} className="mx-auto text-tactical-gray/30 mb-4" />
              <p className="font-display text-lg text-tactical-gray uppercase">Chưa có sơ đồ thi đấu</p>
              <p className="font-mono text-xs text-tactical-gray/60 mt-2">
                {isOrganizer ? 'Bấm nút "Tạo Bracket Tự Động" để khởi tạo sơ đồ thi đấu.' : 'BTC giải đấu chưa tạo sơ đồ thi đấu cho giải này.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-6">
              <div className="flex gap-8 min-w-max px-4">
                {rounds.map((roundNum, roundIndex) => (
                  <div key={roundNum} className="flex flex-col">
                    <div className="text-center mb-4 pb-2 border-b border-outline-variant/30">
                      <span className="font-display text-xs uppercase tracking-widest text-warning-amber">
                        {getRoundLabel(roundNum)}
                      </span>
                    </div>

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

      {/* ═══ TAB 4: EXTERNAL VCT MATCHES ═══ */}
      {viewMode === 'external' && (
        <>
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

          {loading ? (
            <div className="py-8"><LoadingSkeleton type="card" count={6} /></div>
          ) : externalMatches.length === 0 ? (
            <div className="text-center py-16 border border-outline-variant/30 bg-surface-charcoal/50">
              <Swords size={48} className="mx-auto text-tactical-gray/30 mb-4" />
              <p className="font-display text-lg text-tactical-gray uppercase">Không có trận đấu nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {externalMatches.map((match) => (
                <ExternalMatchCard key={match.id} match={match} />
              ))}
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

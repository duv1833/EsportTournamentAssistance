import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { Trophy, Medal, Crown, Search, Flame, Shield, Swords, User, TrendingUp, Sparkles, Filter } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('points'); // 'points', 'winRate', 'wins', 'tournaments'

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getUserLeaderboard();
      if (res.success && res.data) {
        setLeaderboard(res.data);
      } else {
        setError(res.message || 'Không thể tải bảng xếp hạng');
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng xếp hạng:', err);
      // Fallback mock data if server isn't running or endpoint empty
      setLeaderboard([
        { id: 1, rank: 1, displayName: 'TenZ#NA1', username: 'tenz', email: 'tenz@sentinels.gg', nickname: 'TenZ#NA1', globalRole: 'USER', points: 1450, winRate: 78.5, matchesWon: 36, matchesLost: 10, matchesPlayed: 46, tournamentsCount: 5, avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150' },
        { id: 2, rank: 2, displayName: 'Faker#KR1', username: 'faker', email: 'faker@t1.gg', nickname: 'Faker#KR1', globalRole: 'ORGANIZER', points: 1320, winRate: 74.2, matchesWon: 28, matchesLost: 10, matchesPlayed: 38, tournamentsCount: 4, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
        { id: 3, rank: 3, displayName: 'Derke#EU1', username: 'derke', email: 'derke@fnatic.gg', nickname: 'Derke#EU1', globalRole: 'USER', points: 1180, winRate: 69.0, matchesWon: 22, matchesLost: 10, matchesPlayed: 32, tournamentsCount: 3, avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
        { id: 4, rank: 4, displayName: 'Aspas#BR1', username: 'aspas', email: 'aspas@leviatan.gg', nickname: 'Aspas#BR1', globalRole: 'USER', points: 980, winRate: 65.4, matchesWon: 17, matchesLost: 9, matchesPlayed: 26, tournamentsCount: 3, avatarUrl: '' },
        { id: 5, rank: 5, displayName: 'Chronicle#EU1', username: 'chronicle', email: 'chronicle@fnatic.gg', nickname: 'Chronicle#EU1', globalRole: 'REFEREE', points: 890, winRate: 62.5, matchesWon: 15, matchesLost: 9, matchesPlayed: 24, tournamentsCount: 2, avatarUrl: '' },
        { id: 6, rank: 6, displayName: 'ScreaM#EDG', username: 'scream', email: 'scream@edg.gg', nickname: 'ScreaM#EDG', globalRole: 'USER', points: 760, winRate: 58.3, matchesWon: 12, matchesLost: 9, matchesPlayed: 21, tournamentsCount: 2, avatarUrl: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort logic
  const filteredLeaderboard = leaderboard.filter(player => {
    const term = searchTerm.toLowerCase();
    return (
      (player.displayName && player.displayName.toLowerCase().includes(term)) ||
      (player.username && player.username.toLowerCase().includes(term)) ||
      (player.nickname && player.nickname.toLowerCase().includes(term)) ||
      (player.email && player.email.toLowerCase().includes(term))
    );
  });

  const sortedLeaderboard = [...filteredLeaderboard].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'winRate') return b.winRate - a.winRate;
    if (sortBy === 'wins') return b.matchesWon - a.matchesWon;
    if (sortBy === 'tournaments') return b.tournamentsCount - a.tournamentsCount;
    return 0;
  });

  const top1 = sortedLeaderboard[0];
  const top2 = sortedLeaderboard[1];
  const top3 = sortedLeaderboard[2];
  const restPlayers = sortedLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background text-off-white pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-surface-charcoal border-2 border-outline-variant p-8 md:p-12 clip-corner shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-red/10 border border-primary-red/30 text-primary-red font-mono text-xs uppercase tracking-widest clip-corner">
              <Sparkles size={14} className="animate-pulse" /> // ESPORTS GLOBAL RANKING
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              Bảng Xếp Hạng <span className="text-primary-red">Người Dùng</span>
            </h1>
            <p className="font-body text-sm sm:text-base text-tactical-gray max-w-2xl">
              Vinh danh các tuyển thủ xuất sắc nhất hệ thống ETA dựa trên tổng số điểm ELO, số trận chiến thắng và phong độ thi đấu qua các giải đấu.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 shrink-0 font-mono">
            <div className="bg-surface-bright/40 border border-outline-variant p-4 clip-corner text-center">
              <div className="text-2xl font-bold text-primary-red">{leaderboard.length}</div>
              <div className="text-[11px] text-tactical-gray uppercase tracking-wider">Tuyển Thủ</div>
            </div>
            <div className="bg-surface-bright/40 border border-outline-variant p-4 clip-corner text-center">
              <div className="text-2xl font-bold text-success-cyan">
                {leaderboard.length > 0 ? Math.round(leaderboard.reduce((acc, curr) => acc + curr.winRate, 0) / leaderboard.length) : 0}%
              </div>
              <div className="text-[11px] text-tactical-gray uppercase tracking-wider">Win Rate TB</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={5} />
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {sortedLeaderboard.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              
              {/* RANK #2 - Silver Podium */}
              {top2 && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-slate-800/80 to-surface-charcoal border-2 border-slate-400/50 p-6 clip-corner relative group hover:border-slate-300 transition-all shadow-xl">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-950 font-display font-black text-sm px-4 py-1 clip-corner flex items-center gap-1.5 shadow-lg">
                    <Medal size={16} /> #2 SILVER
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-2 border-slate-300 overflow-hidden bg-surface-bright flex items-center justify-center shadow-md">
                        {top2.avatarUrl ? (
                          <img src={top2.avatarUrl} alt={top2.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={36} className="text-slate-400" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-slate-300 text-slate-950 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center font-mono">2</span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-lg text-white truncate max-w-[200px]">
                        {top2.displayName || top2.username}
                      </h3>
                      <p className="font-mono text-xs text-slate-400">@{top2.username}</p>
                    </div>

                    <div className="w-full pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 font-mono text-xs">
                      <div className="bg-surface-bright/50 p-2 rounded">
                        <span className="text-tactical-gray block text-[10px]">ĐIỂM ELO</span>
                        <span className="font-bold text-slate-200 text-sm">{top2.points}</span>
                      </div>
                      <div className="bg-surface-bright/50 p-2 rounded">
                        <span className="text-tactical-gray block text-[10px]">WIN RATE</span>
                        <span className="font-bold text-success-cyan text-sm">{top2.winRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RANK #1 - Gold Champion Podium */}
              {top1 && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/70 via-surface-charcoal to-surface-charcoal border-2 border-amber-400 p-8 clip-corner relative group hover:border-amber-300 transition-all shadow-2xl md:-translate-y-4">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-display font-black text-base px-6 py-1.5 clip-corner flex items-center gap-2 shadow-xl animate-pulse">
                    <Crown size={18} className="text-amber-950" /> #1 CHAMPION
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-amber-400 overflow-hidden bg-surface-bright flex items-center justify-center shadow-amber-500/20 shadow-2xl">
                        {top1.avatarUrl ? (
                          <img src={top1.avatarUrl} alt={top1.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={44} className="text-amber-400" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full font-mono shadow">
                        👑 KING
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-black text-xl text-amber-300 truncate max-w-[220px]">
                        {top1.displayName || top1.username}
                      </h3>
                      <p className="font-mono text-xs text-amber-400/80">@{top1.username}</p>
                    </div>

                    <div className="w-full pt-4 border-t border-amber-500/30 grid grid-cols-3 gap-2 font-mono text-xs">
                      <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded text-center">
                        <span className="text-amber-200/70 block text-[10px]">ĐIỂM ELO</span>
                        <span className="font-bold text-amber-400 text-base">{top1.points}</span>
                      </div>
                      <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded text-center">
                        <span className="text-amber-200/70 block text-[10px]">THẮNG</span>
                        <span className="font-bold text-white text-base">{top1.matchesWon}</span>
                      </div>
                      <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded text-center">
                        <span className="text-amber-200/70 block text-[10px]">WIN RATE</span>
                        <span className="font-bold text-success-cyan text-base">{top1.winRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RANK #3 - Bronze Podium */}
              {top3 && (
                <div className="order-3 bg-gradient-to-b from-amber-900/40 to-surface-charcoal border-2 border-amber-700/60 p-6 clip-corner relative group hover:border-amber-600 transition-all shadow-xl">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 font-display font-black text-sm px-4 py-1 clip-corner flex items-center gap-1.5 shadow-lg">
                    <Medal size={16} /> #3 BRONZE
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 pt-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-2 border-amber-700 overflow-hidden bg-surface-bright flex items-center justify-center shadow-md">
                        {top3.avatarUrl ? (
                          <img src={top3.avatarUrl} alt={top3.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={36} className="text-amber-600" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center font-mono">3</span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-lg text-white truncate max-w-[200px]">
                        {top3.displayName || top3.username}
                      </h3>
                      <p className="font-mono text-xs text-amber-500/80">@{top3.username}</p>
                    </div>

                    <div className="w-full pt-3 border-t border-amber-800/40 grid grid-cols-2 gap-2 font-mono text-xs">
                      <div className="bg-surface-bright/50 p-2 rounded">
                        <span className="text-tactical-gray block text-[10px]">ĐIỂM ELO</span>
                        <span className="font-bold text-amber-500 text-sm">{top3.points}</span>
                      </div>
                      <div className="bg-surface-bright/50 p-2 rounded">
                        <span className="text-tactical-gray block text-[10px]">WIN RATE</span>
                        <span className="font-bold text-success-cyan text-sm">{top3.winRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Search & Sorting Controls */}
          <div className="bg-surface-charcoal border border-outline-variant p-4 clip-corner flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tactical-gray" />
              <input
                type="text"
                placeholder="Tìm tên game thủ, nickname, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-bright/40 border border-outline-variant/80 text-sm text-off-white placeholder:text-tactical-gray focus:outline-none focus:border-primary-red transition-colors font-mono"
              />
            </div>

            {/* Sort Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <span className="text-xs font-mono text-tactical-gray uppercase shrink-0 flex items-center gap-1 mr-1">
                <Filter size={14} /> Sắp xếp:
              </span>
              {[
                { key: 'points', label: 'Điểm ELO' },
                { key: 'winRate', label: 'Win Rate' },
                { key: 'wins', label: 'Trận Thắng' },
                { key: 'tournaments', label: 'Giải Đấu' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-3 py-1.5 font-display text-xs uppercase tracking-wider transition-colors shrink-0 ${
                    sortBy === key
                      ? 'bg-primary-red text-white font-bold'
                      : 'bg-surface-bright/40 hover:bg-surface-bright/80 text-off-white/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Rankings Table */}
          <div className="bg-surface-charcoal border border-outline-variant clip-corner overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-bright/30 font-display text-xs uppercase text-tactical-gray tracking-wider">
                    <th className="py-4 px-6 text-center w-16">Thứ Hạng</th>
                    <th className="py-4 px-6">Tuyển Thủ</th>
                    <th className="py-4 px-6 text-center">Vai Trò</th>
                    <th className="py-4 px-6 text-center">Giải Đấu</th>
                    <th className="py-4 px-6 text-center">Trận (Thắng/Thua)</th>
                    <th className="py-4 px-6 text-center">Tỷ Lệ Thắng</th>
                    <th className="py-4 px-6 text-right">Điểm ELO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 font-mono text-sm">
                  {sortedLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-tactical-gray font-mono">
                        Không tìm thấy người dùng nào phù hợp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    sortedLeaderboard.map((player, index) => {
                      const rank = index + 1;
                      const isTop3 = rank <= 3;
                      return (
                        <tr
                          key={player.id || index}
                          className={`hover:bg-surface-bright/30 transition-colors ${
                            rank === 1
                              ? 'bg-amber-950/20'
                              : rank === 2
                              ? 'bg-slate-900/30'
                              : rank === 3
                              ? 'bg-amber-950/10'
                              : ''
                          }`}
                        >
                          {/* Rank Badge */}
                          <td className="py-4 px-6 text-center font-bold font-display">
                            {rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black shadow-md">
                                🥇
                              </span>
                            ) : rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black shadow-md">
                                🥈
                              </span>
                            ) : rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white font-black shadow-md">
                                🥉
                              </span>
                            ) : (
                              <span className="text-tactical-gray text-base">#{rank}</span>
                            )}
                          </td>

                          {/* Player Identity */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-surface-bright border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center">
                                {player.avatarUrl ? (
                                  <img src={player.avatarUrl} alt={player.displayName} className="w-full h-full object-cover" />
                                ) : (
                                  <User size={20} className="text-tactical-gray" />
                                )}
                              </div>
                              <div>
                                <div className="font-display font-bold text-white text-base hover:text-primary-red transition-colors cursor-pointer">
                                  {player.displayName || player.username}
                                </div>
                                <div className="text-xs text-tactical-gray">
                                  @{player.username} {player.email && <span className="text-off-white/40">({player.email})</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Tag */}
                          <td className="py-4 px-6 text-center">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              player.globalRole === 'ADMIN'
                                ? 'bg-red-950 border border-red-500 text-red-400'
                                : player.globalRole === 'ORGANIZER'
                                ? 'bg-purple-950 border border-purple-500 text-purple-400'
                                : player.globalRole === 'REFEREE'
                                ? 'bg-blue-950 border border-blue-500 text-blue-400'
                                : 'bg-surface-bright text-tactical-gray'
                            }`}>
                              {player.globalRole || 'USER'}
                            </span>
                          </td>

                          {/* Tournaments Count */}
                          <td className="py-4 px-6 text-center text-off-white">
                            <div className="inline-flex items-center gap-1 font-bold">
                              <Trophy size={14} className="text-amber-400" />
                              <span>{player.tournamentsCount}</span>
                            </div>
                          </td>

                          {/* Matches W/L */}
                          <td className="py-4 px-6 text-center">
                            <span className="text-success-cyan font-bold">{player.matchesWon}W</span>
                            <span className="text-tactical-gray mx-1">/</span>
                            <span className="text-primary-red font-bold">{player.matchesLost}L</span>
                          </td>

                          {/* Win Rate % Progress Bar */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-bold text-success-cyan">{player.winRate}%</span>
                              <div className="w-24 h-1.5 bg-surface-bright rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-success-cyan"
                                  style={{ width: `${Math.min(100, player.winRate)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Points ELO */}
                          <td className="py-4 px-6 text-right">
                            <span className={`font-display font-extrabold text-base ${
                              rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-200' : rank === 3 ? 'text-amber-600' : 'text-primary-red'
                            }`}>
                              {player.points} ELO
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

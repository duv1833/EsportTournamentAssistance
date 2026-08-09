import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getTournamentAgentStats } from '../../services/tournamentService';
import { useParams } from 'react-router-dom';

export default function TournamentAgents() {
  const { id } = useParams();
  const [agentStats, setAgentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'pickRate', direction: 'desc' });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTournamentAgentStats(id);
        if (response.success) {
          setAgentStats(response.data || []);
        } else {
          setError(response.message || 'Lỗi khi tải dữ liệu thống kê');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi hệ thống khi tải thống kê tướng');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStats();
  }, [id]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStats = [...agentStats].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <Minus size={12} className="text-[#555]" />;
    return sortConfig.direction === 'desc' ? <TrendingDown size={14} className="text-primary-red" /> : <TrendingUp size={14} className="text-success-cyan" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 size={32} className="text-primary-red animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/40 border border-red-500/50 p-6 text-center text-red-200">
        <p className="font-mono text-sm">{error}</p>
      </div>
    );
  }

  if (agentStats.length === 0) {
    return (
      <div className="bg-[#222] border border-[#333] p-12 text-center text-[#888]">
        <p className="font-mono text-sm uppercase">Chưa có dữ liệu thống kê tướng cho giải đấu này.</p>
        <p className="text-xs mt-2">Dữ liệu sẽ hiển thị sau khi các trận đấu hoàn tất quá trình cấm/chọn (Draft).</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold uppercase text-white">Thống Kê Tướng (Agents)</h2>
          <p className="text-[#888] text-sm mt-1">Tỉ lệ cấm và chọn tướng trong giải đấu</p>
        </div>
      </div>

      <div className="bg-[#222] border border-[#333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-[#333] text-xs uppercase font-bold text-[#a0a0a0]">
                <th className="p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors w-1/3" onClick={() => handleSort('agentName')}>
                  <div className="flex items-center gap-2">Tướng {getSortIcon('agentName')}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={() => handleSort('pickRate')}>
                  <div className="flex items-center gap-2">Tỉ Lệ Chọn {getSortIcon('pickRate')}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={() => handleSort('pickCount')}>
                  <div className="flex items-center gap-2">Lượt Chọn {getSortIcon('pickCount')}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={() => handleSort('banRate')}>
                  <div className="flex items-center gap-2">Tỉ Lệ Cấm {getSortIcon('banRate')}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={() => handleSort('banCount')}>
                  <div className="flex items-center gap-2">Lượt Cấm {getSortIcon('banCount')}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={() => handleSort('winRate')}>
                  <div className="flex items-center gap-2">Tỉ Lệ Thắng {getSortIcon('winRate')}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors" onClick={() => handleSort('winCount')}>
                  <div className="flex items-center gap-2">Lượt Thắng {getSortIcon('winCount')}</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedStats.map((stat, index) => (
                <tr 
                  key={stat.agentId} 
                  className={`
                    border-b border-[#333] hover:bg-[#2a2a2a] transition-colors
                    ${index % 2 === 0 ? 'bg-[#222]' : 'bg-[#1f1f1f]'}
                  `}
                >
                  <td className="p-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      {stat.imageUrl ? (
                        <div className="w-10 h-10 overflow-hidden bg-[#111] border border-[#444] rounded">
                          <img 
                            src={stat.imageUrl} 
                            alt={stat.agentName} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `/assets/agents/${stat.agentName.toLowerCase()}.png`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-[#111] border border-[#444] rounded flex items-center justify-center overflow-hidden">
                          <img 
                            src={`/assets/agents/${stat.agentName.toLowerCase()}.png`}
                            alt={stat.agentName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div>
                        <div className="uppercase tracking-wider">{stat.agentName}</div>
                        <div className="text-[10px] text-[#888]">{stat.roleType || 'Unknown Role'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-white text-base">
                      {stat.pickRate.toFixed(1)}<span className="text-xs text-[#888]">%</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-24 h-1 bg-[#111] mt-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success-cyan" 
                        style={{ width: `${Math.min(100, stat.pickRate)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[#a0a0a0]">{stat.pickCount}</td>
                  <td className="p-4">
                    <div className="font-mono text-white text-base">
                      {stat.banRate.toFixed(1)}<span className="text-xs text-[#888]">%</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-24 h-1 bg-[#111] mt-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-red" 
                        style={{ width: `${Math.min(100, stat.banRate)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[#a0a0a0]">{stat.banCount}</td>
                  <td className="p-4">
                    <div className="font-mono text-white text-base">
                      {stat.winRate.toFixed(1)}<span className="text-xs text-[#888]">%</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-24 h-1 bg-[#111] mt-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${Math.min(100, stat.winRate)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[#a0a0a0]">{stat.winCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getTournamentAgentStats } from '../../services/tournamentService';
import { useParams } from 'react-router-dom';

const AGENT_IMAGES = {
  'Jett': 'https://media.valorant-api.com/agents/ad703507-4156-8137-8821-96f626382968/displayicon.png',
  'Phoenix': 'https://media.valorant-api.com/agents/eb93336a-449e-44c3-5468-056f111034ba/displayicon.png',
  'Reyna': 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png',
  'Raze': 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-b79d137bd8b8/displayicon.png',
  'Yoru': 'https://media.valorant-api.com/agents/7f9490d4-42f8-d0ce-bc80-37b45066138c/displayicon.png',
  'Neon': 'https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png',
  'Iso': 'https://media.valorant-api.com/agents/0e38b542-4789-06b4-0125-989c16526d82/displayicon.png',
  'Sage': 'https://media.valorant-api.com/agents/56444735-4ed6-3b56-70ad-6f74c4105447/displayicon.png',
  'Cypher': 'https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png',
  'Killjoy': 'https://media.valorant-api.com/agents/1e588b59-4ee9-f2e7-d402-d28d5114c849/displayicon.png',
  'Chamber': 'https://media.valorant-api.com/agents/22a37521-47bf-8b2b-99c4-b98a9667795b/displayicon.png',
  'Deadlock': 'https://media.valorant-api.com/agents/cc8b0cf8-4b74-428c-7772-f19f5d3702a7/displayicon.png',
  'Vyse': 'https://media.valorant-api.com/agents/96b920f5-465e-25ef-f5e6-49a888c32ec8/displayicon.png',
  'Sova': 'https://media.valorant-api.com/agents/320b2a1b-42d4-06d6-1600-3696bc7602aa/displayicon.png',
  'Breach': 'https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png',
  'Skye': 'https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b0908d7cfc4c/displayicon.png',
  'KAY/O': 'https://media.valorant-api.com/agents/601d3b66-4b64-23f5-5a58-86a5658aaeab/displayicon.png',
  'Fade': 'https://media.valorant-api.com/agents/ded3520f-4264-5edd-aa39-8ab49f4eb770/displayicon.png',
  'Gekko': 'https://media.valorant-api.com/agents/e2866995-465b-8706-088f-9a973d4d46bf/displayicon.png',
  'Brimstone': 'https://media.valorant-api.com/agents/9f0677a8-4298-8353-070b-01a9ed1b1165/displayicon.png',
  'Viper': 'https://media.valorant-api.com/agents/70773516-4088-294c-b78b-5927b859858d/displayicon.png',
  'Omen': 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png',
  'Astra': 'https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png',
  'Harbor': 'https://media.valorant-api.com/agents/2b2c807d-4a9c-8211-3472-568750a11b0b/displayicon.png',
  'Clove': 'https://media.valorant-api.com/agents/096b4286-48c9-bc4d-1763-718e2689ef2e/displayicon.png'
};

function AgentAvatar({ agentName, imageUrl, roleType }) {
  const [imgError, setImgError] = useState(false);
  const src = imageUrl || AGENT_IMAGES[agentName];

  const roleColors = {
    Duelist: 'border-red-500/40 text-red-400 bg-red-950/30',
    Sentinel: 'border-amber-500/40 text-amber-400 bg-amber-950/30',
    Controller: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
    Initiator: 'border-purple-500/40 text-purple-400 bg-purple-950/30',
  };

  const badgeColor = roleColors[roleType] || 'border-[#555] text-white bg-[#111]';

  if (!src || imgError) {
    return (
      <div className={`w-10 h-10 border rounded flex items-center justify-center font-display font-bold text-xs uppercase ${badgeColor}`}>
        {agentName ? agentName.substring(0, 2) : 'AG'}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 overflow-hidden bg-[#111] border border-[#444] rounded shrink-0">
      <img
        src={src}
        alt={agentName}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

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
                      <AgentAvatar
                        agentName={stat.agentName}
                        imageUrl={stat.imageUrl}
                        roleType={stat.roleType}
                      />
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

import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const AGENT_POOL = [
  { name: 'JETT', role: 'Duelist' }, { name: 'RAZE', role: 'Duelist' }, { name: 'REYNA', role: 'Duelist' }, 
  { name: 'YORU', role: 'Duelist' }, { name: 'NEON', role: 'Duelist' }, { name: 'PHOENIX', role: 'Duelist' },
  { name: 'ISO', role: 'Duelist' },
  { name: 'OMEN', role: 'Controller' }, { name: 'VIPER', role: 'Controller' }, { name: 'BRIMSTONE', role: 'Controller' }, 
  { name: 'ASTRA', role: 'Controller' }, { name: 'HARBOR', role: 'Controller' }, { name: 'CLOVE', role: 'Controller' },
  { name: 'SOVA', role: 'Initiator' }, { name: 'FADE', role: 'Initiator' }, { name: 'SKYE', role: 'Initiator' }, 
  { name: 'BREACH', role: 'Initiator' }, { name: 'KAYO', role: 'Initiator' }, { name: 'GEKKO', role: 'Initiator' },
  { name: 'KILLJOY', role: 'Sentinel' }, { name: 'CYPHER', role: 'Sentinel' }, { name: 'SAGE', role: 'Sentinel' }, 
  { name: 'CHAMBER', role: 'Sentinel' }, { name: 'DEADLOCK', role: 'Sentinel' }, { name: 'VYSE', role: 'Sentinel' }
];

const INITIAL_SERIES = {
  id: 1, format: 'BO3',
  teamA: { id: 1, name: 'SGP', short: 'SGP', score: 0, captainId: 1 }, 
  teamB: { id: 2, name: 'PAPER REX', short: 'PRX', score: 0, captainId: 2 },
  bannedMaps: ['Split', 'Ascent', 'Lotus', 'Haven'],
  games: [
    { id: 101, gameNumber: 1, map: 'Breeze', status: 'WAITING', scoreA: 0, scoreB: 0, teamAPicks: [], teamABans: [], teamBPicks: [], teamBBans: [], currentTurnTeamId: 1 },
    { id: 102, gameNumber: 2, map: 'Fracture', status: 'LOCKED', scoreA: 0, scoreB: 0, teamAPicks: [], teamABans: [], teamBPicks: [], teamBBans: [], currentTurnTeamId: 1 },
    { id: 103, gameNumber: 3, map: 'Pearl', status: 'LOCKED', scoreA: 0, scoreB: 0, teamAPicks: [], teamABans: [], teamBPicks: [], teamBBans: [], currentTurnTeamId: 1 },
  ]
};

const Lobby = () => {
  const [isJoinedRoom, setIsJoinedRoom] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  
  const [seriesData, setSeriesData] = useState(INITIAL_SERIES);
  const [activeGame, setActiveGame] = useState(null);
  const [selectedAgentHover, setSelectedAgentHover] = useState(null); 
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [exitCountdown, setExitCountdown] = useState(null); 
  const [tempScores, setTempScores] = useState({});

  const [stompClient, setStompClient] = useState(null);
  const [demoRole, setDemoRole] = useState('ADMIN'); 

  const currentUserRole = demoRole === 'ADMIN' ? 'ADMIN' : 'PLAYER';
  const currentUserId = demoRole === 'TEAM_A' ? 1 : demoRole === 'TEAM_B' ? 2 : 0;

  useEffect(() => {
    if (!activeGame || exitCountdown !== null) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [activeGame, exitCountdown]);

  useEffect(() => {
    if (exitCountdown === null) return;
    if (exitCountdown > 0) {
      const timer = setTimeout(() => setExitCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setSeriesData(prev => {
        const newGames = prev.games.map(g => g.id === activeGame.id ? { ...g, status: 'PLAYING' } : g);
        return { ...prev, games: newGames };
      });
      setActiveGame(null);
      setExitCountdown(null);
    }
  }, [exitCountdown, activeGame]);

  useEffect(() => {
    if (!activeGame) return;
    const socket = new SockJS('http://localhost:8081/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/match/${activeGame.id}`, (message) => {
          console.log(`Nhận data: `, message.body);
        });
      }
    });
    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, [activeGame]);

  const handleJoinRoom = (e) => { e.preventDefault(); if (roomInput) setIsJoinedRoom(true); };

  const handleAdminStartDraft = (gameId) => {
    setSeriesData(prev => {
      const newGames = prev.games.map(g => g.id === gameId ? { ...g, status: 'DRAFTING' } : g);
      return { ...prev, games: newGames };
    });
    const gameToStart = seriesData.games.find(g => g.id === gameId);
    setActiveGame({ ...gameToStart, status: 'DRAFTING' });
  };

  const handleAdminConfirmDraftComplete = () => {
    setSeriesData(prev => {
      const newGames = prev.games.map(g => {
        if (g.id === activeGame.id) {
          return {
            ...g,
            teamAPicks: ['JETT', 'SOVA', 'KAYO', 'KILLJOY', 'OMEN'], teamABans: ['VIPER', 'CYPHER', 'RAZE', 'SKYE', 'FADE'],
            teamBPicks: ['RAZE', 'SKYE', 'FADE', 'CYPHER', 'ASTRA'], teamBBans: ['BREACH', 'NEON', 'YORU', 'SAGE', 'REYNA']
          };
        }
        return g;
      });
      return { ...prev, games: newGames };
    });
    setExitCountdown(5);
  };

  const handleAdminSaveScore = (gameId) => {
    const scoreA = parseInt(tempScores[`${gameId}_A`] || 0);
    const scoreB = parseInt(tempScores[`${gameId}_B`] || 0);
    
    if (scoreA === scoreB) { alert("⚠️ Tỷ số không hợp lệ! Vui lòng nhập lại."); return; }
    
    setSeriesData(prev => {
      let currentSeriesScoreA = prev.teamA.score;
      let currentSeriesScoreB = prev.teamB.score;
      
      if (scoreA > scoreB) currentSeriesScoreA += 1;
      else if (scoreB > scoreA) currentSeriesScoreB += 1;

      const winThreshold = prev.format === 'BO3' ? 2 : prev.format === 'BO5' ? 3 : 1;
      const isSeriesOver = currentSeriesScoreA >= winThreshold || currentSeriesScoreB >= winThreshold;
      let nextGameUnlocked = false;

      const newGames = prev.games.map((g) => {
        if (g.id === gameId) { return { ...g, status: 'COMPLETED', scoreA, scoreB }; }
        if (isSeriesOver && (g.status === 'LOCKED' || g.status === 'WAITING')) { return { ...g, status: 'CANCELED' }; }
        if (!isSeriesOver && g.status === 'LOCKED' && !nextGameUnlocked && g.id > gameId) {
          nextGameUnlocked = true;
          return { ...g, status: 'WAITING' };
        }
        return g;
      });

      return {
        ...prev, teamA: { ...prev.teamA, score: currentSeriesScoreA }, teamB: { ...prev.teamB, score: currentSeriesScoreB }, games: newGames
      };
    });
  };
  // HÀM GỌI API XUỐNG SPRING BOOT KHI BẤM NÚT KHÓA
  const handleLockAgent = () => {
    if (!stompClient || !stompClient.connected) {
      alert("⚠️ Chưa kết nối tới Máy chủ Backend! (Mở Spring Boot lên nhé)");
      return;
    }
    
    if (!selectedAgentHover) return;

    // Đóng gói dữ liệu chuẩn bị gửi xuống Java
    const payload = {
      matchId: activeGame.id,
      teamId: currentUserId,
      userId: 1, // Tạm hardcode tài khoản người dùng đang thao tác
      agentName: selectedAgentHover,
      actionType: "PICK", // Tạm thời để cứng là PICK để test luồng
      phase: "AGENT"
    };

    // Bắn thẳng qua WebSocket vào endpoint của Controller
    stompClient.publish({
      destination: "/app/draft/action",
      body: JSON.stringify(payload)
    });

    console.log("🚀 Đã bắn tín hiệu xuống Backend:", payload);
  };

  const AgentImage = ({ agentName, className }) => {
    const [imgError, setImgError] = useState(false);
    if (!agentName) return null;
    
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-[#1a242d] ${className}`}>
        {!imgError ? (
          <img src={`/assets/agents/${agentName}.png`} alt={agentName} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <span className="text-[9px] font-bold text-gray-300 tracking-wider truncate px-1">{agentName}</span>
        )}
      </div>
    );
  };

  const renderAgentSlots = (agents, type = 'pick', count = 5, size = 'sm') => {
    const slots = [];
    const isSmall = size === 'sm';
    
    // ĐÃ CHỈNH NHỎ LẠI: Đảm bảo vừa vặn trên mọi màn hình
    const pickClass = isSmall ? 'w-8 h-8 xl:w-9 xl:h-9' : 'w-20 h-20';
    const banClass = isSmall ? 'w-5 h-5 xl:w-6 xl:h-6' : 'w-12 h-12';

    for (let i = 0; i < count; i++) {
      const agentName = agents[i];

      if (type === 'pick') {
        slots.push(
          <div key={i} className={`${pickClass} border flex items-center justify-center flex-shrink-0 bg-[#0f1923] ${agentName ? 'border-gray-500' : 'border-gray-700 border-dashed'}`}>
            {agentName && <AgentImage agentName={agentName} />}
          </div>
        );
      } else {
        slots.push(
          <div key={i} className={`${banClass} bg-red-950/40 border border-red-900/50 flex items-center justify-center flex-shrink-0 relative overflow-hidden opacity-80`}>
            {agentName ? (
              <>
                <AgentImage agentName={agentName} className="opacity-40 grayscale" />
                <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500 rotate-45 absolute"></div></div>
              </>
            ) : (
              <span className={`text-red-500/30 font-bold ${isSmall ? 'text-[6px]' : 'text-[10px]'}`}>BAN</span>
            )}
          </div>
        );
      }
    }
    return slots;
  };

  if (!isJoinedRoom) {
    return (
      <div className="min-h-screen bg-[#0f1923] text-white flex flex-col items-center justify-center relative">
        <button onClick={() => window.location.href = "/"} className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest">
           <span>←</span> Về Trang Chủ
        </button>
        <div className="absolute top-8 right-8 text-right">
          <p className="text-xs text-yellow-400 mb-1 font-bold">GÓC NHÌN TEST:</p>
          <select value={demoRole} onChange={(e) => setDemoRole(e.target.value)} className="bg-black text-white border border-gray-600 p-2 text-sm rounded outline-none">
            <option value="ADMIN">Trọng Tài (Admin)</option><option value="TEAM_A">SGP Leader</option><option value="TEAM_B">PRX Leader</option>
          </select>
        </div>
        <div className="w-full max-w-md bg-[#1f2933] p-8 border border-gray-700 rounded-lg shadow-2xl text-center">
          <div className="w-16 h-16 bg-[#ff4655]/20 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-2xl">🔒</span></div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-widest mb-2">Vào phòng chờ</h2>
          <p className="text-gray-400 text-sm mb-8">Nhập mã phòng do Ban tổ chức cung cấp để tham gia Cấm/Chọn.</p>
          <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
            <input type="text" placeholder="VD: VCT-VN-2026..." value={roomInput} onChange={(e) => setRoomInput(e.target.value)} className="w-full bg-[#0f1923] border border-gray-600 text-white px-4 py-3 rounded text-center text-lg tracking-widest outline-none focus:border-[#ff4655] transition-colors" required />
            <button type="submit" className="w-full bg-[#ff4655] text-white font-bold tracking-widest hover:bg-red-500 py-3 rounded uppercase transition-colors">XÁC NHẬN</button>
          </form>
        </div>
      </div>
    );
  }

  if (!activeGame) {
    return (
      <div className="min-h-screen bg-[#0f1923] text-white p-8 font-sans pb-32 relative">
        <button onClick={() => setIsJoinedRoom(false)} className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest z-10">
           <span>←</span> Rời Phòng
        </button>

        <div className="max-w-7xl mx-auto mb-10 text-center relative mt-4">
          {currentUserRole === 'ADMIN' && <div className="absolute top-0 right-0 bg-success-cyan text-background text-xs font-bold px-3 py-1 rounded shadow-[0_0_10px_rgba(0,255,209,0.5)]">GÓC NHÌN TRỌNG TÀI</div>}
          <h1 className="text-gray-400 text-sm tracking-widest mb-2 uppercase">CHUNG KẾT NHÁNH THẮNG - {seriesData.format}</h1>
          <div className="flex justify-center items-center gap-8 text-4xl font-bold">
            <span className="text-blue-400 w-48 text-right">{seriesData.teamA.name}</span>
            <div className="bg-[#1f2933] px-6 py-2 rounded border border-gray-700 shadow-inner">
              <span className="text-white">{seriesData.teamA.score}</span><span className="text-[#ff4655] mx-4">-</span><span className="text-white">{seriesData.teamB.score}</span>
            </div>
            <span className="text-[#ff4655] w-48 text-left">{seriesData.teamB.name}</span>
          </div>
          <div className="mt-6 flex justify-center items-center gap-4 text-sm text-gray-400 bg-[#121a23] inline-block px-6 py-2 rounded border border-gray-800">
             <span className="text-yellow-400 font-bold tracking-widest uppercase">MAP VETO ĐÃ HOÀN TẤT:</span> {seriesData.bannedMaps.join(', ')} bị cấm.
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {seriesData.games.map((game) => {
            const displayStatus = game.status;
            return (
              /* DÙNG FLEXBOX CO GIÃN TỐT HƠN CSS GRID CỨNG */
              <div key={game.id} className={`flex flex-col xl:flex-row items-center justify-between p-4 xl:p-5 gap-4 border rounded-sm transition-all duration-300
                ${displayStatus === 'WAITING' ? 'border-gray-500 bg-[#1f2933]' : ''}
                ${displayStatus === 'DRAFTING' ? 'border-[#ff4655] bg-[#1f2933] shadow-[0_0_15px_rgba(255,70,85,0.2)]' : ''} 
                ${displayStatus === 'PLAYING' ? 'border-blue-500 bg-[#1f2933]' : ''} 
                ${displayStatus === 'COMPLETED' ? 'border-gray-600 bg-[#121a23]' : ''}
                ${(displayStatus === 'LOCKED' || displayStatus === 'CANCELED') ? 'border-gray-800 bg-[#0a1118] opacity-40' : ''}
              `}>
                
                {/* CỘT 1: TÊN BẢN ĐỒ */}
                <div className="flex flex-col text-center xl:text-left w-full xl:w-32 shrink-0">
                  <span className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Ván {game.gameNumber}</span>
                  <span className="text-3xl font-display uppercase font-bold tracking-wide">{game.map}</span>
                  <span className={`text-[10px] mt-1 uppercase tracking-wider font-bold ${displayStatus === 'PLAYING' ? 'text-blue-400' : 'text-gray-500'}`}>
                    {displayStatus === 'CANCELED' ? 'Đã hủy' : displayStatus === 'LOCKED' ? 'Bị khóa' : displayStatus === 'WAITING' ? 'Chuẩn bị' : displayStatus === 'DRAFTING' ? 'Đang Ban/Pick' : displayStatus === 'PLAYING' ? 'ĐANG THI ĐẤU' : 'Đã kết thúc'}
                  </span>
                </div>

                {/* CỘT 2: BAN PICK VÀ ĐIỂM SỐ */}
                {(displayStatus !== 'CANCELED' && displayStatus !== 'LOCKED') ? (
                  <div className="flex flex-1 flex-col xl:flex-row items-center justify-center gap-4 w-full">
                    
                    <div className="flex items-center gap-2 justify-end shrink-0">
                      <div className="flex gap-1 hidden md:flex">{renderAgentSlots(game.teamABans, 'ban', 5, 'sm')}</div>
                      <div className="flex gap-1">{renderAgentSlots(game.teamAPicks, 'pick', 5, 'sm')}</div>
                      
                      {currentUserRole === 'ADMIN' && displayStatus === 'PLAYING' ? (
                        <input type="number" defaultValue={game.scoreA} onChange={(e) => setTempScores({...tempScores, [`${game.id}_A`]: e.target.value})} className="w-12 h-10 bg-black border border-gray-600 text-center font-display text-2xl text-blue-400 focus:border-blue-500 outline-none ml-2 rounded" />
                      ) : (
                        <span className="text-2xl font-display font-bold w-10 text-center text-blue-400 ml-2">{(displayStatus === 'WAITING' || displayStatus === 'DRAFTING') ? '-' : game.scoreA}</span>
                      )}
                    </div>

                    <span className="text-gray-600 font-bold hidden xl:block text-xl shrink-0">VS</span>

                    <div className="flex items-center gap-2 justify-start flex-row-reverse xl:flex-row shrink-0">
                      {currentUserRole === 'ADMIN' && displayStatus === 'PLAYING' ? (
                        <input type="number" defaultValue={game.scoreB} onChange={(e) => setTempScores({...tempScores, [`${game.id}_B`]: e.target.value})} className="w-12 h-10 bg-black border border-gray-600 text-center font-display text-2xl text-[#ff4655] focus:border-[#ff4655] outline-none mr-2 rounded" />
                      ) : (
                        <span className="text-2xl font-display font-bold w-10 text-center text-[#ff4655] mr-2">{(displayStatus === 'WAITING' || displayStatus === 'DRAFTING') ? '-' : game.scoreB}</span>
                      )}
                      
                      <div className="flex gap-1">{renderAgentSlots(game.teamBPicks, 'pick', 5, 'sm')}</div>
                      <div className="flex gap-1 hidden md:flex">{renderAgentSlots(game.teamBBans, 'ban', 5, 'sm')}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1"></div> 
                )}

                {/* CỘT 3: NÚT THAO TÁC */}
                <div className="w-full xl:w-40 flex shrink-0 justify-center xl:justify-end">
                  {displayStatus === 'WAITING' && currentUserRole === 'ADMIN' && <button onClick={() => handleAdminStartDraft(game.id)} className="bg-[#ff4655] text-white text-[11px] px-6 py-3 font-bold uppercase rounded hover:bg-red-500 shadow-[0_0_10px_rgba(255,70,85,0.4)] animate-pulse tracking-widest whitespace-nowrap">Bắt đầu Ván {game.gameNumber}</button>}
                  {displayStatus === 'WAITING' && currentUserRole !== 'ADMIN' && <span className="text-[11px] text-yellow-400 font-bold uppercase flex items-center gap-2 whitespace-nowrap">⏳ Chờ trọng tài</span>}
                  
                  {displayStatus === 'DRAFTING' && <button onClick={() => setActiveGame(game)} className="bg-transparent border border-[#ff4655] text-[#ff4655] text-[11px] px-6 py-3 rounded uppercase font-bold tracking-wider hover:bg-[#ff4655] hover:text-white transition-colors whitespace-nowrap">Vào Phòng</button>}
                  
                  {displayStatus === 'PLAYING' && currentUserRole === 'ADMIN' && <button onClick={() => handleAdminSaveScore(game.id)} className="bg-success-cyan text-background text-[11px] px-6 py-3 font-bold uppercase rounded hover:brightness-110 tracking-widest shadow-[0_0_10px_rgba(0,255,209,0.3)] whitespace-nowrap">Lưu kết quả</button>}
                  {displayStatus === 'PLAYING' && currentUserRole !== 'ADMIN' && <span className="text-[11px] text-blue-400 font-bold uppercase animate-pulse whitespace-nowrap">ĐANG THI ĐẤU</span>}
                  
                  {displayStatus === 'COMPLETED' && <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2 whitespace-nowrap">ĐÃ LƯU KẾT QUẢ</span>}
                  {(displayStatus === 'CANCELED' || displayStatus === 'LOCKED') && <span className="text-2xl text-gray-700">🔒</span>}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="fixed bottom-4 right-4 bg-gray-900 p-4 border border-gray-500 rounded z-50 shadow-2xl">
          <p className="text-xs text-yellow-400 mb-2 font-bold">GÓC NHÌN HIỆN TẠI:</p>
          <select value={demoRole} onChange={(e) => setDemoRole(e.target.value)} className="bg-black text-white border border-gray-600 p-2 text-sm outline-none">
            <option value="ADMIN">Trọng Tài (Admin)</option><option value="TEAM_A">SGP Leader</option><option value="TEAM_B">PRX Leader</option>
          </select>
        </div>
      </div>
    );
  }

  // =========================================================
  // GIAO DIỆN 2: PHÒNG DRAFT CHI TIẾT
  // =========================================================
  const isMyTurn = currentUserRole === 'ADMIN' || activeGame.currentTurnTeamId === currentUserId;

  return (
    <div className="min-h-screen bg-[#0f1923] text-white p-4 flex flex-col relative pb-32">
      <button onClick={() => { setActiveGame(null); setTimeLeft(30); }} className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors uppercase text-sm font-bold tracking-widest z-10">← Quay lại Dashboard</button>

      <div className="flex-1 flex flex-col items-center mt-10">
        <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-gray-300">VÁN {activeGame.gameNumber} - BẢN ĐỒ: <span className="text-white text-4xl">{activeGame.map}</span></h2>
        
        <div className="w-full max-w-[1400px] grid grid-cols-[1fr_auto_1fr] gap-8 items-center mb-12">
          <div className={`flex flex-col border-2 p-8 rounded-lg bg-[#121a23] transition-all duration-300 ${activeGame.currentTurnTeamId === 1 ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-[#1f2933]'}`}>
            <h3 className="text-3xl font-display font-bold text-blue-400 mb-6 text-left">{seriesData.teamA.name}</h3>
            <div className="mb-8"><div className="grid grid-cols-5 gap-3">{renderAgentSlots(activeGame.teamAPicks, 'pick', 5, 'lg')}</div></div>
            <div className="flex justify-end gap-2">{renderAgentSlots(activeGame.teamABans, 'ban', 5, 'lg')}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center w-40">
             <span className="text-xs text-gray-400 tracking-widest mb-2 font-bold uppercase">Thời Gian</span>
             <span className={`font-display text-7xl font-bold transition-all duration-300 ${timeLeft <= 10 ? 'text-[#ff4655] scale-110 animate-pulse drop-shadow-[0_0_15px_rgba(255,70,85,0.6)]' : 'text-white'}`}>{timeLeft}</span>
             <span className="text-xs mt-4 uppercase font-bold text-blue-400 animate-pulse bg-blue-900/30 px-4 py-1 rounded-full border border-blue-500/50">Lượt của {seriesData.teamA.short}</span>
          </div>
          
          <div className={`flex flex-col border-2 p-8 rounded-lg bg-[#121a23] transition-all duration-300 text-right ${activeGame.currentTurnTeamId === 2 ? 'border-[#ff4655] shadow-[0_0_30px_rgba(255,70,85,0.2)]' : 'border-[#1f2933]'}`}>
             <h3 className="text-3xl font-display font-bold text-[#ff4655] mb-6 text-right">{seriesData.teamB.name}</h3>
            <div className="mb-8"><div className="grid grid-cols-5 gap-3 flex-row-reverse">{renderAgentSlots(activeGame.teamBPicks, 'pick', 5, 'lg')}</div></div>
            <div className="flex justify-start gap-2">{renderAgentSlots(activeGame.teamBBans, 'ban', 5, 'lg')}</div>
          </div>
        </div>

        <div className={`w-full max-w-[1000px] bg-[#1f2933] p-8 rounded border border-gray-700 text-center transition-all duration-300 shadow-2xl ${(!isMyTurn || exitCountdown !== null) ? 'opacity-50 pointer-events-none grayscale-[30%]' : ''}`}>
          <h4 className="text-gray-400 text-sm mb-6 uppercase tracking-widest flex items-center justify-center gap-2 font-bold">
            {!isMyTurn && <span className="text-[#ff4655] border border-[#ff4655] px-2 py-0.5 rounded">🔒 CHƯA TỚI LƯỢT</span>} 
            DANH SÁCH ĐẶC VỤ
          </h4>
          
          <div className="flex flex-wrap justify-center gap-3">
            {AGENT_POOL.map((agent) => {
               const isSelected = selectedAgentHover === agent.name;
               return (
                  <button 
                    key={agent.name} 
                    onClick={() => setSelectedAgentHover(agent.name)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 bg-[#0a1118] border-2 flex items-center justify-center rounded overflow-hidden group transition-all duration-200
                      ${isSelected ? 'border-[#ff4655] scale-110 z-10 shadow-[0_0_15px_rgba(255,70,85,0.5)]' : 'border-transparent hover:border-gray-400'}
                    `}
                  >
                    <AgentImage agentName={agent.name} className="group-hover:scale-110 transition-transform duration-300" />
                    
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1 pt-4 text-center">
                       <span className={`text-[10px] font-bold tracking-wider ${agent.role === 'Duelist' ? 'text-red-300' : agent.role === 'Controller' ? 'text-purple-300' : agent.role === 'Initiator' ? 'text-green-300' : 'text-yellow-300'}`}>{agent.name}</span>
                    </div>
                  </button>
               )
            })}
          </div>

          <button onClick={handleLockAgent} className={`mt-10 px-16 py-4 font-bold tracking-widest rounded uppercase transition-all duration-300 shadow-lg
            ${selectedAgentHover ? 'bg-[#ff4655] text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(255,70,85,0.6)] cursor-pointer' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
          `}>
            {selectedAgentHover ? `KHÓA: ${selectedAgentHover}` : 'VUI LÒNG CHỌN TƯỚNG'}
          </button>
        </div>

        {currentUserRole === 'ADMIN' && exitCountdown === null && (
          <button onClick={handleAdminConfirmDraftComplete} className="mt-8 px-10 py-3 border border-success-cyan text-success-cyan hover:bg-success-cyan hover:text-background font-bold tracking-widest rounded uppercase transition-colors">
             [Bảng điều khiển Trọng Tài] Ép kết thúc Ban/Pick
          </button>
        )}
      </div>

      {exitCountdown !== null && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] backdrop-blur-lg">
           <div className="w-32 h-32 bg-success-cyan/20 rounded-full flex items-center justify-center mb-8 animate-pulse border border-success-cyan/50 shadow-[0_0_50px_rgba(0,255,209,0.3)]">
              <span className="text-6xl text-success-cyan">✓</span>
           </div>
           <h2 className="text-5xl font-bold font-display text-white mb-4 uppercase tracking-widest">Ban/Pick Hoàn Tất</h2>
           <p className="text-gray-400 text-xl mb-12 uppercase tracking-widest">Tuyển thủ tháo tai nghe. Chuẩn bị vào game sau:</p>
           <span className="text-8xl font-display font-bold text-[#ff4655] animate-bounce">{exitCountdown}</span>
        </div>
      )}

      <div className="fixed bottom-4 right-4 bg-gray-900 p-4 border border-gray-500 rounded z-50">
          <p className="text-xs text-yellow-400 mb-2 font-bold">GÓC NHÌN HIỆN TẠI:</p>
          <select value={demoRole} onChange={(e) => setDemoRole(e.target.value)} className="bg-black text-white border border-gray-600 p-2 text-sm outline-none">
            <option value="ADMIN">Trọng Tài (Admin)</option><option value="TEAM_A">SGP Leader</option><option value="TEAM_B">PRX Leader</option>
          </select>
      </div>
    </div>
  );
};

export default Lobby;
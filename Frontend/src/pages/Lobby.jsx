import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// --- BIẾN GIẢ LẬP QUYỀN (Thay đổi để test các góc nhìn khác nhau) ---
// Thử đổi thành 'PLAYER_SGP' hoặc 'PLAYER_PRX' để xem giao diện dưới góc nhìn tuyển thủ
const currentUserRole = 'ADMIN'; 
const currentUserId = 1; // ID của SGP Captain

const MOCK_SERIES = {
  id: 1,
  format: 'BO3',
  teamA: { id: 1, name: 'SGP', short: 'SGP', score: 1, captainId: 1 }, 
  teamB: { id: 2, name: 'PAPER REX', short: 'PRX', score: 0, captainId: 2 },
  bannedMaps: ['Split', 'Ascent', 'Lotus', 'Haven'],
  games: [
    { 
      id: 101, gameNumber: 1, map: 'Breeze', status: 'COMPLETED', scoreA: 13, scoreB: 11,
      teamAPicks: ['JETT', 'SOVA', 'KAYO', 'KILLJOY', 'OMEN'], teamABans: ['VIPER', 'CYPHER', 'RAZE', 'SKYE', 'FADE'],
      teamBPicks: ['RAZE', 'SKYE', 'FADE', 'CYPHER', 'ASTRA'], teamBBans: ['BREACH', 'NEON', 'YORU', 'SAGE', 'REYNA']
    },
    { 
      id: 102, gameNumber: 2, map: 'Fracture', status: 'DRAFTING', scoreA: 0, scoreB: 0,
      teamAPicks: ['JETT', 'SOVA'], teamABans: ['VIPER', 'CYPHER', 'RAZE'],
      teamBPicks: ['OMEN', 'BREACH'], teamBBans: ['KILLJOY', 'KAYO'],
      currentTurnTeamId: 1, // Đang là lượt của SGP (Team A)
      isDraftFinished: false // Giả lập trạng thái đã Ban/pick xong chưa
    },
    { 
      id: 103, gameNumber: 3, map: 'Pearl', status: 'WAITING', scoreA: 0, scoreB: 0,
      teamAPicks: [], teamABans: [], teamBPicks: [], teamBBans: []
    },
  ]
};

// Danh sách 29 Agent thật của Valorant (Phân loại theo Role)
const AGENT_POOL = [
  { name: 'JETT', role: 'Duelist' }, { name: 'RAZE', role: 'Duelist' }, { name: 'REYNA', role: 'Duelist' }, 
  { name: 'YORU', role: 'Duelist' }, { name: 'NEON', role: 'Duelist' }, { name: 'PHOENIX', role: 'Duelist' },
  { name: 'OMEN', role: 'Controller' }, { name: 'VIPER', role: 'Controller' }, { name: 'BRIMSTONE', role: 'Controller' }, 
  { name: 'ASTRA', role: 'Controller' }, { name: 'HARBOR', role: 'Controller' }, { name: 'CLOVE', role: 'Controller' },
  { name: 'SOVA', role: 'Initiator' }, { name: 'FADE', role: 'Initiator' }, { name: 'SKYE', role: 'Initiator' }, 
  { name: 'BREACH', role: 'Initiator' }, { name: 'KAYO', role: 'Initiator' }, { name: 'GEKKO', role: 'Initiator' },
  { name: 'KILLJOY', role: 'Sentinel' }, { name: 'CYPHER', role: 'Sentinel' }, { name: 'SAGE', role: 'Sentinel' }, 
  { name: 'CHAMBER', role: 'Sentinel' }, { name: 'DEADLOCK', role: 'Sentinel' }, { name: 'VYSE', role: 'Sentinel' }
];

const Lobby = () => {
  const [activeGame, setActiveGame] = useState(null);
  
  // State giả lập cho Đồng hồ đếm ngược và WebSocket
  const [timeLeft, setTimeLeft] = useState(30);
  const [stompClient, setStompClient] = useState(null);

  // Hiệu ứng đếm ngược thời gian
  useEffect(() => {
    if (!activeGame || activeGame.isDraftFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame]);

  // Khởi tạo kết nối WebSocket khi vào phòng Draft
  useEffect(() => {
    if (!activeGame) return;

    const socket = new SockJS('http://localhost:8081/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('🟢 Đã kết nối WebSocket thành công!');
        
        // Đăng ký nghe kênh của ván đấu hiện tại
        client.subscribe(`/topic/match/${activeGame.id}`, (message) => {
          console.log('📩 Nhận được data từ Server:', message.body);
          alert("Server phản hồi: " + message.body); 
        });
      },
      onStompError: (frame) => {
        console.error('❌ Lỗi WebSocket: ' + frame.headers['message']);
      }
    });

    client.activate();
    setStompClient(client);

    // Ngắt kết nối khi thoát phòng
    return () => {
      client.deactivate();
    };
  }, [activeGame]);

  // Hàm gửi dữ liệu khi bấm nút KHÓA LỰA CHỌN
  const handleLockSelection = () => {
    if (stompClient && stompClient.connected) {
      const payload = {
        matchId: activeGame.id,
        teamId: activeGame.currentTurnTeamId,
        userId: currentUserId,
        phase: "AGENT",
        actionType: "PICK",
        agentName: "JETT" // Giả lập chọn Jett
      };

      console.log("🚀 Đang gửi dữ liệu lên Server...", payload);
      
      stompClient.publish({
        destination: '/app/draft/action',
        body: JSON.stringify(payload)
      });
    } else {
      alert("⚠️ Đang mất kết nối tới máy chủ, vui lòng đợi...");
    }
  };

  // LOGIC TỰ ĐỘNG KHÓA VÁN ĐẤU TRONG SERIES
  const winThreshold = MOCK_SERIES.format === 'BO3' ? 2 : MOCK_SERIES.format === 'BO5' ? 3 : 1;
  const isSeriesOver = MOCK_SERIES.teamA.score >= winThreshold || MOCK_SERIES.teamB.score >= winThreshold;

  const renderAgentSlots = (agents, type = 'pick', count = 5) => {
    const slots = [];
    for (let i = 0; i < count; i++) {
      const agentName = agents[i];
      if (type === 'pick') {
        slots.push(
          <div key={i} className={`w-10 h-10 border flex items-center justify-center flex-shrink-0 bg-gray-800 ${agentName ? 'border-gray-400' : 'border-gray-600 border-dashed'}`}>
            {agentName && <span className="text-[9px] font-bold text-white">{agentName}</span>}
          </div>
        );
      } else {
        slots.push(
          <div key={i} className="w-6 h-6 bg-red-950/40 border border-red-900 flex items-center justify-center opacity-60 flex-shrink-0">
            {agentName ? (
              <span className="text-[7px] text-red-400 line-through">{agentName}</span>
            ) : (
              <span className="text-[7px] text-red-500/30">?</span>
            )}
          </div>
        );
      }
    }
    return slots;
  };

  // --- GIAO DIỆN 1: TỔNG QUAN (MATCH DASHBOARD) ---
  if (!activeGame) {
    return (
      <div className="min-h-screen bg-[#0f1923] text-white p-8 font-sans">
        <div className="max-w-6xl mx-auto mb-10 text-center relative">
          {currentUserRole === 'ADMIN' && (
            <div className="absolute top-0 right-0 bg-success-cyan text-background text-xs font-bold px-3 py-1 rounded">
              GÓC NHÌN TRỌNG TÀI
            </div>
          )}
          <h1 className="text-gray-400 text-sm tracking-widest mb-2 uppercase">CHUNG KẾT NHÁNH THẮNG - {MOCK_SERIES.format}</h1>
          <div className="flex justify-center items-center gap-8 text-4xl font-bold">
            <span className="text-blue-400 w-48 text-right">{MOCK_SERIES.teamA.name}</span>
            <div className="bg-[#1f2933] px-6 py-2 rounded border border-gray-700">
              <span className="text-white">{MOCK_SERIES.teamA.score}</span>
              <span className="text-[#ff4655] mx-4">-</span>
              <span className="text-white">{MOCK_SERIES.teamB.score}</span>
            </div>
            <span className="text-[#ff4655] w-48 text-left">{MOCK_SERIES.teamB.name}</span>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <span className="text-[#ff4655] font-semibold">MAP ĐÃ CẤM: </span> 
            {MOCK_SERIES.bannedMaps.join(', ')}
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          {MOCK_SERIES.games.map((game) => {
            const isLocked = isSeriesOver && game.status === 'WAITING';
            const displayStatus = isLocked ? 'CANCELED' : game.status;
            
            return (
              <div 
                key={game.id}
                onClick={() => displayStatus === 'DRAFTING' ? setActiveGame(game) : null}
                className={`relative border flex flex-col xl:flex-row items-center justify-between p-4 transition-all ${
                  displayStatus === 'DRAFTING' 
                    ? 'border-[#ff4655] bg-[#1f2933] cursor-pointer hover:bg-[#2a3642] shadow-[0_0_15px_rgba(255,70,85,0.2)]' 
                    : displayStatus === 'COMPLETED'
                      ? 'border-gray-600 bg-[#121a23]'
                      : 'border-gray-800 bg-[#0a1118] opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col text-center xl:text-left w-full xl:w-48 mb-4 xl:mb-0">
                  <span className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Ván {game.gameNumber}</span>
                  <span className="text-2xl font-display uppercase font-bold">{game.map}</span>
                  <span className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">
                    {displayStatus === 'CANCELED' ? 'Đã hủy' : displayStatus === 'WAITING' ? 'Chưa diễn ra' : 'Đã kết thúc'}
                  </span>
                </div>

                {displayStatus !== 'CANCELED' && (
                  <div className="flex flex-1 flex-col xl:flex-row items-center justify-center gap-6 xl:gap-8 w-full">
                    {/* Team A Info */}
                    <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                      <div className="flex gap-1">{renderAgentSlots(game.teamABans, 'ban')}</div>
                      <div className="flex gap-1.5 ml-2">{renderAgentSlots(game.teamAPicks, 'pick')}</div>
                      
                      {/* ADMIN SCORE INPUT (Bên Trái) */}
                      {currentUserRole === 'ADMIN' && (displayStatus === 'COMPLETED' || displayStatus === 'DRAFTING') ? (
                        <input type="number" defaultValue={game.scoreA} className="w-12 h-10 bg-black border border-gray-600 text-center font-display text-2xl text-blue-400 focus:border-blue-500 outline-none" />
                      ) : (
                        <span className="text-3xl font-display font-bold w-12 text-right text-blue-400">{displayStatus === 'WAITING' ? '-' : game.scoreA}</span>
                      )}
                    </div>

                    <span className="text-gray-600 font-bold hidden xl:block">VS</span>

                    {/* Team B Info */}
                    <div className="flex items-center gap-3 w-full xl:w-auto justify-start flex-row-reverse xl:flex-row">
                      {/* ADMIN SCORE INPUT (Bên Phải) */}
                      {currentUserRole === 'ADMIN' && (displayStatus === 'COMPLETED' || displayStatus === 'DRAFTING') ? (
                         <input type="number" defaultValue={game.scoreB} className="w-12 h-10 bg-black border border-gray-600 text-center font-display text-2xl text-[#ff4655] focus:border-[#ff4655] outline-none" />
                      ) : (
                         <span className="text-3xl font-display font-bold w-12 text-left text-[#ff4655]">{displayStatus === 'WAITING' ? '-' : game.scoreB}</span>
                      )}
                      
                      <div className="flex gap-1.5 mr-2">{renderAgentSlots(game.teamBPicks, 'pick')}</div>
                      <div className="flex gap-1">{renderAgentSlots(game.teamBBans, 'ban')}</div>
                    </div>
                  </div>
                )}

                <div className="w-full xl:w-48 flex justify-center xl:justify-end mt-4 xl:mt-0 gap-2">
                  {currentUserRole === 'ADMIN' && displayStatus === 'COMPLETED' && (
                     <button className="bg-success-cyan text-background text-xs px-4 py-2 font-bold uppercase rounded hover:brightness-110">Lưu tỷ số</button>
                  )}
                  {displayStatus === 'DRAFTING' && (
                     <button className="animate-pulse bg-[#ff4655] text-white text-xs px-6 py-2 rounded uppercase font-bold tracking-wider hover:bg-red-500">
                       Vào Ban/Pick
                     </button>
                  )}
                  {displayStatus === 'CANCELED' && <span className="text-xl">🔒</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN 2: PHÒNG DRAFT CHI TIẾT ---
  
  // Validate lượt chơi
  const isMyTurn = currentUserRole === 'ADMIN' || activeGame.currentTurnTeamId === currentUserId;

  return (
    <div className="min-h-screen bg-[#0f1923] text-white p-4 flex flex-col relative">
      <button 
        onClick={() => { setActiveGame(null); setTimeLeft(30); }}
        className="text-gray-400 hover:text-white self-start mb-4 flex items-center gap-2"
      >
        ← Quay lại tổng quan
      </button>

      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-gray-300">VÁN {activeGame.gameNumber} - BẢN ĐỒ: <span className="text-white">{activeGame.map}</span></h2>

        <div className="w-full max-w-6xl grid grid-cols-[1fr_auto_1fr] gap-8 items-center mb-12">
          {/* ĐỘI A (BLUE) */}
          <div className={`flex flex-col border p-6 rounded-lg bg-[#121a23] ${activeGame.currentTurnTeamId === 1 ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-blue-900/50'}`}>
            <h3 className="text-xl font-bold text-blue-400 mb-4 text-left">{MOCK_SERIES.teamA.name}</h3>
            <div className="mb-6">
              <div className="grid grid-cols-5 gap-2">{renderAgentSlots(activeGame.teamAPicks, 'pick', 5)}</div>
            </div>
            <div className="flex justify-end gap-2">{renderAgentSlots(activeGame.teamABans, 'ban', 5)}</div>
          </div>

          {/* ĐỒNG HỒ ĐẾM NGƯỢC (Ở GIỮA) */}
          <div className="flex flex-col items-center justify-center w-32">
             <span className="text-[10px] text-gray-400 tracking-widest mb-1">THỜI GIAN</span>
             <span className={`font-display text-5xl font-bold transition-all duration-300 ${timeLeft <= 10 ? 'text-red-500 scale-125 animate-pulse' : 'text-white'}`}>
                {timeLeft}
             </span>
             <span className="text-[10px] mt-3 uppercase font-bold text-blue-400 animate-pulse">Lượt của {MOCK_SERIES.teamA.short}</span>
          </div>

          {/* ĐỘI B (RED) */}
          <div className={`flex flex-col border p-6 rounded-lg bg-[#121a23] text-right ${activeGame.currentTurnTeamId === 2 ? 'border-[#ff4655] shadow-[0_0_15px_rgba(255,70,85,0.3)]' : 'border-red-900/50'}`}>
             <h3 className="text-xl font-bold text-[#ff4655] mb-4 text-right">{MOCK_SERIES.teamB.name}</h3>
            <div className="mb-6">
              <div className="grid grid-cols-5 gap-2 flex-row-reverse">{renderAgentSlots(activeGame.teamBPicks, 'pick', 5)}</div>
            </div>
            <div className="flex justify-start gap-2">{renderAgentSlots(activeGame.teamBBans, 'ban', 5)}</div>
          </div>
        </div>

        {/* DANH SÁCH AGENT & VALIDATE CHẶN THAO TÁC */}
        <div className={`w-full max-w-4xl bg-[#1f2933] p-6 rounded border border-gray-700 text-center transition-opacity duration-300 ${!isMyTurn ? 'opacity-40 pointer-events-none' : ''}`}>
          <h4 className="text-gray-400 text-sm mb-6 uppercase tracking-wider flex items-center justify-center gap-2">
            {!isMyTurn && <span className="text-red-400 font-bold">🔒 CHƯA TỚI LƯỢT</span>}
            DANH SÁCH ĐẶC VỤ
          </h4>
          
          <div className="flex flex-wrap justify-center gap-3">
            {AGENT_POOL.map((agent) => (
              <button 
                key={agent.name} 
                className={`w-20 h-20 bg-gray-800 hover:bg-gray-700 border flex items-center justify-center rounded text-[10px] font-bold transition-all
                  ${agent.role === 'Duelist' ? 'border-red-900 text-red-200' : 
                    agent.role === 'Controller' ? 'border-purple-900 text-purple-200' : 
                    agent.role === 'Initiator' ? 'border-green-900 text-green-200' : 
                    'border-yellow-900 text-yellow-200'}
                `}
              >
                {agent.name}
              </button>
            ))}
          </div>
          
          {/* NÚT KHÓA LỰA CHỌN */}
          <button 
            onClick={handleLockSelection} 
            className="mt-8 px-16 py-4 bg-[#ff4655] text-white font-bold tracking-widest hover:bg-red-500 rounded uppercase"
          >
            KHÓA LỰA CHỌN
          </button>
        </div>
      </div>

      {/* POP-UP DÀNH RIÊNG CHO TRỌNG TÀI KHI HOÀN TẤT */}
      {currentUserRole === 'ADMIN' && activeGame?.isDraftFinished && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
           <div className="bg-[#1f2933] p-8 border-2 border-success-cyan rounded max-w-md text-center shadow-[0_0_30px_rgba(0,255,209,0.2)]">
               <div className="w-16 h-16 bg-success-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
               </div>
               <h2 className="text-2xl font-bold text-white mb-2 uppercase">Hoàn tất Ban/Pick</h2>
               <p className="text-gray-400 mb-8 text-sm">Hai đội đã hoàn tất quá trình cấm/chọn. Vui lòng kiểm tra lại đội hình và xác nhận để mở khóa ván đấu tiếp theo.</p>
               <div className="flex gap-4 justify-center">
                   <button className="bg-transparent border border-gray-500 text-gray-300 px-6 py-2 rounded hover:bg-gray-800 text-sm font-bold uppercase">Hủy / Sửa lỗi</button>
                   <button className="bg-success-cyan text-background px-6 py-2 rounded font-bold uppercase hover:brightness-110 text-sm">Lưu & Bắt đầu</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
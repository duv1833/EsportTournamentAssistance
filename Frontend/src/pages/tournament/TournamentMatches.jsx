import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateMatchResult } from '../../services/matchService';
import { Pencil, Check, X } from 'lucide-react';

const getRoundLabel = (roundNum, totalRounds) => {
  if (roundNum === totalRounds) return "Chung Kết";
  if (roundNum === totalRounds - 1) return "Bán Kết";
  if (roundNum === totalRounds - 2) return "Tứ Kết";
  return `Vòng ${roundNum}`;
};

export default function TournamentMatches({ internalMatches = [], currentUser, tournament, onMatchUpdate }) {
  const navigate = useNavigate();
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const rounds = [...new Set(internalMatches.map(m => m.roundNumber))].sort((a, b) => a - b);
  const totalRounds = rounds.length > 0 ? Math.max(...rounds) : 0;

  const isOrganizer = currentUser && tournament && (
    currentUser.id === tournament.creatorId || 
    (tournament.organizerIds && tournament.organizerIds.includes(currentUser.id)) || 
    currentUser.globalRole === 'ADMIN'
  );

  if (internalMatches.length === 0) {
    return (
      <div className="bg-[#222] border border-[#333] p-8 text-center text-sm text-[#a0a0a0]">
        Chưa có trận đấu nào được tạo cho giải đấu này.
      </div>
    );
  }

  const handleSaveEdit = async (matchId) => {
    if (!editDate) return;
    setIsUpdating(true);
    try {
      const formattedDate = editDate.length === 16 ? editDate + ':00' : editDate;
      const res = await updateMatchResult(matchId, { scheduledTime: formattedDate }, currentUser.id);
      if (res.success && onMatchUpdate) {
        onMatchUpdate();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật thời gian", err);
      alert("Cập nhật thời gian thất bại!");
    } finally {
      setIsUpdating(false);
      setEditingMatchId(null);
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(
        internalMatches.reduce((groups, match) => {
          const dateObj = new Date(match.scheduledTime);
          const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
          if (!groups[dateStr]) groups[dateStr] = [];
          groups[dateStr].push(match);
          return groups;
        }, {})
      )
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([dateString, matches]) => (
        <div key={dateString}>
          <div className="text-primary-red text-xs font-bold uppercase tracking-wider mb-2">
            {dateString}
          </div>
          <div className="bg-[#222] border border-[#333] divide-y divide-[#333]">
            {matches
              .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
              .map((match) => {
                const isCompleted = match.status === 'COMPLETED';
                const team1Wins = match.winnerId && match.winnerId === match.team1Id;
                const team2Wins = match.winnerId && match.winnerId === match.team2Id;
                const matchTimeObj = new Date(match.scheduledTime);
                const matchTime = matchTimeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                return (
                  <div key={match.id} className="flex flex-col md:flex-row items-center p-3 hover:bg-[#2a2a2a] transition-colors relative">
                    {/* Cột 1: Thời gian */}
                    <div className="w-24 text-[10px] font-mono text-[#a0a0a0] flex-shrink-0 text-center md:text-left mb-2 md:mb-0">
                      {editingMatchId === match.id ? (
                        <div className="flex flex-col gap-1 items-start">
                          <input 
                            type="datetime-local" 
                            className="bg-[#111] text-white text-[10px] p-1 w-[120px] outline-none"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => handleSaveEdit(match.id)} disabled={isUpdating} className="text-[#32cd32] hover:text-white"><Check size={14} /></button>
                            <button onClick={() => setEditingMatchId(null)} className="text-primary-red hover:text-white"><X size={14} /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {matchTime}
                          {isOrganizer && !isCompleted && (
                            <button 
                              onClick={() => {
                                // Format to YYYY-MM-DDTHH:mm
                                const tzOffset = matchTimeObj.getTimezoneOffset() * 60000;
                                const localISOTime = (new Date(matchTimeObj - tzOffset)).toISOString().slice(0,16);
                                setEditDate(localISOTime);
                                setEditingMatchId(match.id);
                              }} 
                              className="text-[#666] hover:text-white"
                              title="Sửa lịch thi đấu"
                            >
                              <Pencil size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Cột 2: Tên đội và Tỷ số */}
                    <div className="flex-1 min-w-0 pr-4 pl-4 md:pl-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className={`text-xs font-semibold flex items-center gap-2 ${team1Wins ? 'text-white' : 'text-[#a0a0a0]'}`}>
                          {match.team1LogoUrl && <img src={match.team1LogoUrl} className="w-4 h-4 object-contain" alt=""/>}
                          {match.team1Name || 'TBD'}
                        </div>
                        <div className={`text-xs font-mono font-bold ${team1Wins ? 'text-white' : 'text-[#a0a0a0]'}`}>{isCompleted ? match.scoreTeam1 : '-'}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-semibold flex items-center gap-2 ${team2Wins ? 'text-white' : 'text-[#a0a0a0]'}`}>
                          {match.team2LogoUrl && <img src={match.team2LogoUrl} className="w-4 h-4 object-contain" alt=""/>}
                          {match.team2Name || 'TBD'}
                        </div>
                        <div className={`text-xs font-mono font-bold ${team2Wins ? 'text-white' : 'text-[#a0a0a0]'}`}>{isCompleted ? match.scoreTeam2 : '-'}</div>
                      </div>
                    </div>

                    {/* Cột 3: Trạng thái (Sửa lại width nhỏ hơn để nhường chỗ cho nút bấm) */}
                    <div className="w-24 flex justify-center flex-shrink-0 my-2 md:my-0">
                      <div className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${isCompleted ? 'bg-[#555] text-white' : 'bg-[#32cd32]/20 text-[#32cd32] border border-[#32cd32]/30'}`}>
                        {isCompleted ? 'Completed' : 'Upcoming'}
                      </div>
                    </div>

                    {/* Cột 4: Vòng đấu */}
                    <div className="w-24 md:mr-4 text-right text-[10px] text-[#a0a0a0] flex-shrink-0 flex flex-col items-end">
                      <span className="font-bold text-white">{getRoundLabel(match.roundNumber, totalRounds)}</span>
                      <span>Trận {match.positionInRound}</span>
                    </div>

                    {/* Cột 5: NÚT VÀO PHÒNG BAN/PICK (MỚI THÊM) */}
                    <div className="flex-shrink-0 mt-3 md:mt-0 w-full md:w-auto text-right">
                      <button
                        onClick={() => navigate(`/lobby/${match.id}`)}
                        className={`w-full md:w-auto text-white px-4 py-2 md:py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${isCompleted ? 'bg-[#555] hover:bg-[#666]' : 'bg-[#ff4655] hover:bg-red-500 shadow-[0_0_10px_rgba(255,70,85,0.2)] hover:shadow-[0_0_15px_rgba(255,70,85,0.4)]'}`}
                      >
                        {isCompleted ? 'Lịch sử Ban/Pick' : 'Vào Ban/Pick'}
                      </button>
                    </div>

                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
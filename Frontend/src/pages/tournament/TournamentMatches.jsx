import React from 'react';

const getRoundLabel = (roundNum, totalRounds) => {
  if (roundNum === totalRounds) return "Chung Kết";
  if (roundNum === totalRounds - 1) return "Bán Kết";
  if (roundNum === totalRounds - 2) return "Tứ Kết";
  return `Vòng ${roundNum}`;
};

export default function TournamentMatches({ internalMatches = [] }) {
  const rounds = [...new Set(internalMatches.map(m => m.roundNumber))].sort((a, b) => a - b);
  const totalRounds = rounds.length > 0 ? Math.max(...rounds) : 0;

  if (internalMatches.length === 0) {
    return (
      <div className="bg-[#222] border border-[#333] p-8 text-center text-sm text-[#a0a0a0]">
        Chưa có trận đấu nào được tạo cho giải đấu này.
      </div>
    );
  }

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
                const matchTime = new Date(match.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                return (
                  <div key={match.id} className="flex flex-col md:flex-row items-center p-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer">
                    <div className="w-24 text-[10px] font-mono text-[#a0a0a0] flex-shrink-0 text-center md:text-left mb-2 md:mb-0">
                      {matchTime}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
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

                    <div className="w-32 flex justify-center flex-shrink-0 my-2 md:my-0">
                      <div className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${isCompleted ? 'bg-[#555] text-white' : 'bg-[#32cd32]/20 text-[#32cd32] border border-[#32cd32]/30'}`}>
                        {isCompleted ? 'Completed' : 'Upcoming'}
                      </div>
                    </div>

                    <div className="w-32 text-right text-[10px] text-[#a0a0a0] flex-shrink-0 flex flex-col items-end">
                      <span className="font-bold text-white">{getRoundLabel(match.roundNumber, totalRounds)}</span>
                      <span>Trận {match.positionInRound}</span>
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

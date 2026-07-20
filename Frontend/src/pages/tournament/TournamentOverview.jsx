import React, { useState } from 'react';

// ─── Internal Bracket Node (Read-only) ───────────────
function BracketMatchNode({ match }) {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';
  const team1Wins = match.winnerId && match.winnerId === match.team1Id;
  const team2Wins = match.winnerId && match.winnerId === match.team2Id;

  return (
    <div className={`w-52 bg-surface-charcoal border ${isLive ? 'border-primary-red/60' : isCompleted ? 'border-success-cyan/40' : 'border-outline-variant'} text-xs`}>
      {/* Team 1 */}
      <div className={`flex items-center justify-between px-2 py-1.5 border-b border-outline-variant/30 ${team1Wins ? 'bg-success-cyan/10' : ''}`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {match.team1LogoUrl && (
            <img src={match.team1LogoUrl} alt="" className="w-3.5 h-3.5 object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <span className={`font-display uppercase text-[10px] truncate ${team1Wins ? 'text-success-cyan font-bold' : match.team1Name ? 'text-off-white' : 'text-tactical-gray/40'}`}>
            {match.team1Name || 'TBD'}
          </span>
        </div>
        <span className={`font-display w-4 text-center text-[10px] ${team1Wins ? 'text-success-cyan font-bold' : 'text-tactical-gray'}`}>
          {match.team1Name ? match.scoreTeam1 : '-'}
        </span>
      </div>

      {/* Team 2 */}
      <div className={`flex items-center justify-between px-2 py-1.5 ${team2Wins ? 'bg-success-cyan/10' : ''}`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {match.team2LogoUrl && (
            <img src={match.team2LogoUrl} alt="" className="w-3.5 h-3.5 object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          <span className={`font-display uppercase text-[10px] truncate ${team2Wins ? 'text-success-cyan font-bold' : match.team2Name ? 'text-off-white' : 'text-tactical-gray/40'}`}>
            {match.team2Name || 'TBD'}
          </span>
        </div>
        <span className={`font-display w-4 text-center text-[10px] ${team2Wins ? 'text-success-cyan font-bold' : 'text-tactical-gray'}`}>
          {match.team2Name ? match.scoreTeam2 : '-'}
        </span>
      </div>
    </div>
  );
}

const getRoundLabel = (roundNum, totalRounds) => {
  if (roundNum === totalRounds) return "Chung Kết";
  if (roundNum === totalRounds - 1) return "Bán Kết";
  if (roundNum === totalRounds - 2) return "Tứ Kết";
  return `Vòng ${roundNum}`;
};

export default function TournamentOverview({ 
  internalMatches = [], 
  registeredTeams = [],
  upcomingMatches = [],
  pastMatches = [],
  activeSubTab,
  setActiveSubTab,
  tournament,
  standings = [],
  currentUser,
  onJoinTeam
}) {
  const [showRosters, setShowRosters] = useState(false);
  const isGroupKnockout = tournament?.structure === 'GROUP_KNOCKOUT';
  const groupMatches = internalMatches.filter(m => m.stage === 'GROUP');
  const bracketMatches = isGroupKnockout ? internalMatches.filter(m => m.stage === 'KNOCKOUT') : internalMatches;

  const rounds = [...new Set(bracketMatches.map(m => m.roundNumber))].sort((a, b) => a - b);
  const totalRounds = rounds.length > 0 ? Math.max(...rounds) : 0;
  
  const matchesByRound = bracketMatches.reduce((acc, match) => {
    if (!acc[match.roundNumber]) acc[match.roundNumber] = [];
    acc[match.roundNumber].push(match);
    return acc;
  }, {});

  const subTabs = rounds.length > 0 
    ? rounds.map(roundNum => {
        const matchesInRound = matchesByRound[roundNum] || [];
        const earliestDate = matchesInRound.reduce((earliest, match) => {
          if (!match.scheduledTime) return earliest;
          const matchDate = new Date(match.scheduledTime);
          return !earliest || matchDate < earliest ? matchDate : earliest;
        }, null);

        const dateStr = earliestDate 
          ? earliestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'TBD';

        return {
          name: getRoundLabel(roundNum, totalRounds),
          date: dateStr
        };
      })
    : [
        { name: 'Quarterfinals', date: 'TBD' },
        { name: 'Semifinals', date: 'TBD' },
        { name: 'Grand Final', date: 'TBD' },
      ];

  return (
    <div>
      <div className="flex items-end border-b border-[#333] gap-6 mb-6">
        {subTabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveSubTab && setActiveSubTab(tab.name)}
            className={`
              pb-3 text-left transition-colors relative
              ${activeSubTab === tab.name ? 'text-white' : 'text-[#a0a0a0] hover:text-white'}
            `}
          >
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#a0a0a0] mb-1">{tab.date}</div>
            <div className="text-sm font-bold">{tab.name}</div>
            {activeSubTab === tab.name && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary-red"></div>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column (Groups / Bracket) */}
        <div className={`flex-1 ${internalMatches.length === 0 ? 'w-full' : ''}`}>
          
          {isGroupKnockout && standings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider mb-3">Vòng Bảng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['A', 'B'].map(groupName => (
                  <div key={groupName} className="bg-[#222] border border-[#333]">
                    <div className="bg-[#111] p-2 text-center text-xs font-bold text-white border-b border-[#333] uppercase">
                      Bảng {groupName}
                    </div>
                    <div className="flex items-center p-2 border-b border-[#333]">
                      <div className="w-8 text-[10px] font-bold text-[#a0a0a0] uppercase">#</div>
                      <div className="flex-1 text-[10px] font-bold text-[#a0a0a0] uppercase">Đội</div>
                      <div className="w-10 text-[10px] font-bold text-[#a0a0a0] uppercase text-center">Trận</div>
                      <div className="w-10 text-[10px] font-bold text-[#a0a0a0] uppercase text-center">T - B</div>
                      <div className="w-10 text-[10px] font-bold text-[#a0a0a0] uppercase text-center">HS</div>
                      <div className="w-10 text-[10px] font-bold text-[#a0a0a0] uppercase text-center">Điểm</div>
                    </div>
                    {standings.filter(s => s.groupName === groupName).map((team, idx) => (
                      <div key={team.teamId} className={`flex items-center p-2 border-b border-[#333] hover:bg-[#2a2a2a] transition-colors ${idx < 4 ? 'border-l-2 border-l-success-cyan' : ''}`}>
                        <div className="w-8 text-xs font-semibold text-[#666] pl-2">{idx + 1}</div>
                        <div className="flex-1 text-xs font-semibold text-white flex items-center gap-2">
                          {team.logoUrl && <img src={team.logoUrl} className="w-4 h-4 object-contain" alt=""/>}
                          {team.teamName}
                        </div>
                        <div className="w-10 text-xs text-[#a0a0a0] text-center">{team.matchesPlayed}</div>
                        <div className="w-10 text-xs text-[#a0a0a0] text-center">{team.wins} - {team.losses}</div>
                        <div className="w-10 text-xs text-[#a0a0a0] text-center">{team.roundDifference > 0 ? `+${team.roundDifference}` : team.roundDifference}</div>
                        <div className="w-10 text-xs font-bold text-white text-center">{team.points}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {bracketMatches.length > 0 && (
            <>
              <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider mb-3">Sơ Đồ Thi Đấu</h2>
              <div className="bg-[#222] border border-[#333] p-4 mb-8 overflow-x-auto">
                <div className="flex gap-8 min-w-max">
                  {rounds.map((roundNum, roundIndex) => (
                    <div key={roundNum} className="flex flex-col">
                      {/* Round Header */}
                      <div className="text-center mb-4 pb-2 border-b border-[#333]">
                        <span className="font-display text-xs uppercase tracking-widest text-warning-amber">
                          {getRoundLabel(roundNum, totalRounds)}
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
                              <BracketMatchNode match={match} />
                              {roundIndex < rounds.length - 1 && (
                                <div className="w-8 border-t border-[#333] ml-0"></div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Prize Distribution (Mocked) */}
          <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider mb-3">Prize Distribution</h2>
          <div className="bg-[#222] border border-[#333] mb-8">
            <div className="flex items-center p-3 border-b border-[#333]">
              <div className="w-24 text-[10px] font-bold text-[#a0a0a0] uppercase">Place</div>
              <div className="w-24 text-[10px] font-bold text-[#a0a0a0] uppercase">Prize</div>
              <div className="w-48 text-[10px] font-bold text-[#a0a0a0] uppercase">Team</div>
              <div className="flex-1 text-[10px] font-bold text-[#a0a0a0] uppercase">Note</div>
            </div>
            
            {[
              { place: '1st', prize: '$100,000', team: 'TBD', note: 'Champions' },
              { place: '2nd', prize: '$50,000', team: 'TBD', note: 'Runner-up' },
              { place: '3rd', prize: '$25,000', team: 'TBD', note: 'Play-Ins' },
              { place: '4th', prize: '$15,000', team: 'TBD', note: 'Play-Ins' },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center p-3 border-t border-[#333] hover:bg-[#2a2a2a] transition-colors">
                <div className="w-24 text-xs font-semibold text-white">{row.place}</div>
                <div className="w-24 text-xs text-[#a0a0a0]">{row.prize}</div>
                <div className="w-48 text-xs font-semibold text-[#666] flex items-center gap-2">
                   <div className="text-primary-red">v</div> {row.team}
                </div>
                <div className="flex-1 text-xs text-[#a0a0a0]">{row.note}</div>
              </div>
            ))}
          </div>

          {/* Participating Teams Grid */}
          <div className="flex justify-between items-center mb-3">
             <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider">Participating Teams</h2>
             <button 
               onClick={() => setShowRosters(!showRosters)}
               className={`border text-[10px] font-bold px-3 py-1 transition-colors uppercase tracking-wider ${
                 showRosters 
                   ? 'bg-primary-red border-primary-red text-white' 
                   : 'bg-[#222] border-[#333] text-[#a0a0a0] hover:text-white hover:border-[#444]'
               }`}
             >
               {showRosters ? 'Hide Rosters' : 'Toggle Rosters'}
             </button>
          </div>
          
          {registeredTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {registeredTeams.map(team => {
                const activeMembers = team.members ? team.members.filter(m => m.status === 'ACCEPTED' || m.status === 'APPROVED') : [];
                return (
                  <div key={team.id} className="bg-[#222] border border-[#333] flex flex-col hover:bg-[#2a2a2a] transition-all cursor-pointer group rounded-sm overflow-hidden">
                     <div className="bg-[#2a2a2a] group-hover:bg-[#333] p-2 text-center text-xs font-bold text-white border-b border-[#333] truncate flex items-center justify-between px-3">
                       <span className="truncate">{team.name}</span>
                       {team.tag && <span className="text-[10px] text-primary-red font-mono font-normal">[{team.tag}]</span>}
                     </div>
                     
                     <div className="p-4 flex flex-col items-center justify-center min-h-[90px]">
                       {team.logoUrl ? (
                         <img src={team.logoUrl} alt={team.name} className="max-h-14 object-contain mb-2" />
                       ) : (
                         <div className="w-10 h-10 rounded bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-lg font-display font-bold text-primary-red mb-2">
                           {team.name.substring(0, 2).toUpperCase()}
                         </div>
                       )}
                       <div className="text-[11px] text-[#888] font-medium text-center truncate w-full">
                         Captain: <span className="text-white font-semibold">{team.captainInGameName || team.captainUsername || 'N/A'}</span>
                       </div>
                     </div>

                     {/* Roster Section */}
                     {showRosters && (
                       <div className="bg-[#161616] p-3 border-t border-[#333] space-y-1.5 text-[11px]">
                         <div className="text-[10px] font-bold text-primary-red uppercase tracking-wider mb-1.5 flex items-center justify-between border-b border-[#282828] pb-1">
                           <span>Roster</span>
                           <span className="text-[#666] font-normal">{activeMembers.length} players</span>
                         </div>
                         {activeMembers.length > 0 ? (
                           activeMembers.map((m, idx) => (
                             <div key={m.id || idx} className="flex items-center justify-between text-[#ccc] py-0.5 px-1 rounded hover:bg-[#222]">
                               <span className="font-medium text-white truncate flex items-center gap-1.5">
                                 {m.userId === team.captainId && (
                                   <span className="text-[9px] bg-amber-500/20 text-amber-400 font-bold px-1 rounded uppercase">C</span>
                                 )}
                                 {m.inGameName || m.username}
                               </span>
                               {m.inGameName && m.username && m.inGameName !== m.username && (
                                 <span className="text-[10px] text-[#666] truncate font-mono">(@{m.username})</span>
                               )}
                             </div>
                           ))
                         ) : (
                           <div className="text-[10px] text-[#666] italic py-1 text-center">No active members</div>
                         )}
                       </div>
                     )}

                     <div className="p-2 text-center text-[10px] text-[#666] border-t border-[#333] bg-[#1a1a1a] mt-auto flex items-center justify-between px-3">
                       <span>{activeMembers.length ? `${activeMembers.length} Active Players` : `${team.memberCount || 0} Members`}</span>
                       {currentUser && onJoinTeam && team.captainId !== currentUser.id && !(team.members && team.members.some(m => m.userId === currentUser.id)) && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); onJoinTeam(team.id); }}
                           className="text-[10px] bg-primary-red/20 text-primary-red hover:bg-primary-red hover:text-white px-2 py-0.5 rounded transition-colors uppercase font-bold"
                         >
                           Xin gia nhập
                         </button>
                       )}
                     </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#222] border border-[#333] p-8 text-center text-sm text-[#a0a0a0]">
              No teams have registered for this tournament yet.
            </div>
          )}
          
        </div>

        {/* Right Column (Sidebar) */}
        {internalMatches.length > 0 && (
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
            
            {/* Upcoming Matches */}
            <div>
              <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider mb-3">Upcoming Matches</h2>
              <div className="bg-[#222] border border-[#333]">
                {upcomingMatches.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#a0a0a0]">Không có trận đấu sắp tới.</div>
                ) : upcomingMatches.slice(0, 5).map((match, idx) => (
                    <div key={idx} className="p-3 border-b border-[#333] last:border-0 hover:bg-[#2a2a2a] cursor-pointer transition-colors flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-[10px] text-[#a0a0a0] mb-2">{getRoundLabel(match.roundNumber, totalRounds)}</div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            {match.team1LogoUrl && <img src={match.team1LogoUrl} className="w-3.5 h-3.5 object-contain" alt=""/>}
                            {match.team1Name || 'TBD'}
                          </div>
                          <div className="text-xs text-[#666]">-</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            {match.team2LogoUrl && <img src={match.team2LogoUrl} className="w-3.5 h-3.5 object-contain" alt=""/>}
                            {match.team2Name || 'TBD'}
                          </div>
                          <div className="text-xs text-[#666]">-</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-[#32cd32] w-14 text-right">
                        {new Date(match.scheduledTime).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Latest Results */}
            <div>
              <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider mb-3">Latest Results</h2>
              <div className="bg-[#222] border border-[#333]">
                {pastMatches.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#a0a0a0]">Chưa có kết quả nào.</div>
                ) : pastMatches.slice(0, 5).map((match, idx) => {
                    const team1Wins = match.winnerId && match.winnerId === match.team1Id;
                    const team2Wins = match.winnerId && match.winnerId === match.team2Id;

                    return (
                    <div key={idx} className="p-3 border-b border-[#333] last:border-0 hover:bg-[#2a2a2a] cursor-pointer transition-colors flex justify-between items-center">
                      <div className="flex-1">
                        <div className="text-[10px] text-[#a0a0a0] mb-2">{getRoundLabel(match.roundNumber, totalRounds)}</div>
                        <div className="flex items-center justify-between mb-1">
                          <div className={`text-xs font-semibold flex items-center gap-2 ${team1Wins ? 'text-white' : 'text-[#a0a0a0]'}`}>
                            {match.team1LogoUrl && <img src={match.team1LogoUrl} className="w-3.5 h-3.5 object-contain" alt=""/>}
                            {match.team1Name || 'TBD'}
                          </div>
                          <div className={`text-xs font-mono font-bold pr-4 ${team1Wins ? 'text-white' : 'text-[#a0a0a0]'}`}>{match.scoreTeam1}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`text-xs font-semibold flex items-center gap-2 ${team2Wins ? 'text-white' : 'text-[#a0a0a0]'}`}>
                            {match.team2LogoUrl && <img src={match.team2LogoUrl} className="w-3.5 h-3.5 object-contain" alt=""/>}
                            {match.team2Name || 'TBD'}
                          </div>
                          <div className={`text-xs font-mono font-bold pr-4 ${team2Wins ? 'text-white' : 'text-[#a0a0a0]'}`}>{match.scoreTeam2}</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-[#a0a0a0] w-14 text-right">
                        {new Date(match.scheduledTime).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
                      </div>
                    </div>
                  )})}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

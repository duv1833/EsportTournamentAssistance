import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TactileButton from '../components/common/TactileButton';

export default function TournamentDetailsVLR({
  tournament,
  currentUser,
  onBack,
  onRegister,
  onManage
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSubTab, setActiveSubTab] = useState('Group Stage');

  if (!tournament) return null;

  const tabs = ['Overview', 'Matches', 'Stats', 'Agents'];
  const subTabs = [
    { name: 'Playoffs', date: 'AUG 28-SEP 6' },
    { name: 'Play-Ins', date: 'AUG 14-24' },
    { name: 'Group Stage', date: 'JUL 17-AUG 10' }
  ];

  // Check if current user is in any team in this tournament
  const userTeamInTournament = tournament.registeredTeams?.find(team => {
    const isCaptain = (team.captainId && currentUser?.id && team.captainId === currentUser.id) ||
                      (team.captainUsername && currentUser?.username && team.captainUsername === currentUser.username);
    const isMember = team.members && team.members.some(m => 
      ((m.userId && currentUser?.id && m.userId === currentUser.id) ||
       (m.username && currentUser?.username && m.username === currentUser.username)) &&
      (m.status === 'APPROVED' || m.status === 'ACCEPTED' || m.status === 'PENDING' || m.status === 'INVITED')
    );
    return isCaptain || isMember;
  });

  // Mock Groups logic (Split registered teams into 2 groups)
  const registeredTeams = tournament.registeredTeams || [];
  const groupAlpha = registeredTeams.slice(0, Math.ceil(registeredTeams.length / 2));
  const groupOmega = registeredTeams.slice(Math.ceil(registeredTeams.length / 2));

  // Fill mock empty slots if less than 5 teams per group to make it look like the picture
  const fillGroup = (group, count) => {
    const filled = [...group];
    while (filled.length < count) {
      filled.push(null);
    }
    return filled;
  };

  const alphaDisplay = fillGroup(groupAlpha, 5);
  const omegaDisplay = fillGroup(groupOmega, 5);

  const renderGroupRow = (team, idx) => {
    if (!team) {
      return (
        <div key={`empty-${idx}`} className="flex items-center p-3 border-t border-[#333] hover:bg-[#2a2a2a] bg-[#222]">
           <div className="w-[170px] flex-shrink-0 flex items-center gap-3">
             <div className="w-6 h-6 bg-[#333] rounded-full"></div>
             <div className="text-sm font-semibold text-[#666]">TBD</div>
           </div>
           <div className="w-12 text-center text-xs text-[#a0a0a0] font-mono">0-0</div>
           <div className="w-12 text-center text-xs text-[#a0a0a0] font-mono">0/0</div>
           <div className="w-16 text-center text-xs text-[#a0a0a0] font-mono">0/0</div>
           <div className="flex-1 text-right text-xs text-[#a0a0a0] font-mono">0</div>
        </div>
      );
    }
    
    // Mock score based on index to look realistic
    const wins = 5 - idx > 0 ? 1 : 0;
    const losses = 5 - idx > 0 ? 0 : 1;
    const delta = (5 - idx) * 3 - 5;
    const deltaColor = delta > 0 ? 'text-[#32cd32]' : delta < 0 ? 'text-primary-red' : 'text-[#a0a0a0]';

    return (
      <div key={team.id} className="flex items-center p-3 border-t border-[#333] hover:bg-[#2a2a2a] bg-[#222] transition-colors cursor-pointer">
         <div className="w-[170px] flex-shrink-0 flex items-center gap-3">
           {team.logoUrl ? (
             <img src={team.logoUrl} alt={team.name} className="w-6 h-6 object-contain" />
           ) : (
             <div className="w-6 h-6 bg-surface-bright flex items-center justify-center text-[10px] font-bold text-white rounded-full">
               {team.name.substring(0, 2).toUpperCase()}
             </div>
           )}
           <div>
             <div className="text-sm font-semibold text-white truncate max-w-[120px]">{team.name}</div>
             <div className="text-[10px] text-[#a0a0a0]">United States</div>
           </div>
         </div>
         <div className="w-12 text-center text-xs font-mono font-bold text-white">{wins}-{losses}</div>
         <div className="w-12 text-center text-xs font-mono text-[#a0a0a0]">{wins*2}/{losses*2+1}</div>
         <div className="w-16 text-center text-xs font-mono text-[#a0a0a0]">{40 - idx * 2}/{30 + idx}</div>
         <div className={`flex-1 text-right text-xs font-mono ${deltaColor}`}>
           {delta > 0 ? '+' : ''}{delta}
         </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#1b1b1b] min-h-screen text-off-white font-sans pb-16">
      
      {/* Header Section */}
      <div className="max-w-[1200px] mx-auto pt-6 px-4">
        <button onClick={onBack} className="text-[#a0a0a0] hover:text-white text-xs uppercase font-bold flex items-center gap-1 mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Tournaments
        </button>
        
        <div className="bg-[#222] border border-[#333] flex flex-col md:flex-row items-start p-6 gap-6 relative">
          
          {/* Logo */}
          <div className="w-32 h-32 bg-[#111] flex items-center justify-center shrink-0 border border-[#333]">
            <div className="text-primary-red font-display text-5xl font-bold">V</div>
          </div>
          
          {/* Info */}
          <div className="flex-1 space-y-3 pt-1">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-none text-white">
              {tournament.name}
            </h1>
            <p className="text-[#a0a0a0] text-sm">
              {tournament.rulesDescription || "Part of the Valorant Champions Tour, Riot's official tournament circuit."}
            </p>
            
            <div className="flex flex-wrap gap-x-12 gap-y-4 pt-2">
              <div>
                <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider mb-1">Dates</p>
                <p className="text-sm font-semibold text-white">Jul 17 – Sep 7, 2026</p>
              </div>
              <div>
                <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider mb-1">Prize</p>
                <p className="text-sm font-semibold text-white">$250,000</p>
              </div>
              <div>
                <p className="text-[#a0a0a0] text-[10px] uppercase font-bold tracking-wider mb-1">Location</p>
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>🇧🇷</span> São Paulo
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
             <button className="bg-[#2a2a2a] hover:bg-[#333] border border-[#444] text-white text-xs font-bold px-4 py-2 transition-colors">
              Add to Calendar ▾
            </button>
            
            {tournament.registrationStatus === 'OPEN' && !userTeamInTournament && (
              <button 
                onClick={onRegister}
                className="bg-primary-red hover:bg-red-700 text-white text-xs font-bold px-4 py-2 transition-colors uppercase mt-2"
              >
                Register Team
              </button>
            )}
            
            {currentUser && (currentUser.username === tournament.creatorUsername || currentUser.globalRole === 'ADMIN') && (
              <button 
                onClick={onManage}
                className="bg-success-cyan hover:bg-cyan-600 text-[#111] text-xs font-bold px-4 py-2 transition-colors uppercase mt-2"
              >
                Manage
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="max-w-[1200px] mx-auto px-4 mt-2">
        <div className="flex items-end border-b border-[#333]">
          <div className="flex bg-[#222]">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-3 text-xs font-bold transition-colors border-t border-x border-transparent
                  ${activeTab === tab 
                    ? 'bg-[#1b1b1b] text-white border-t-[#333] border-x-[#333] border-b-transparent relative top-[1px]' 
                    : 'bg-[#222] text-[#a0a0a0] hover:text-white'}
                `}
              >
                {tab}
                {tab === 'Matches' && <span className="ml-1 text-[9px] text-[#666]">(30)</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      {activeTab === 'Overview' && (
        <div className="max-w-[1200px] mx-auto px-4 mt-4">
          <div className="flex items-end border-b border-[#333] gap-6">
            {subTabs.map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveSubTab(tab.name)}
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
        </div>
      )}

      {/* Overview Content */}
      {activeTab === 'Overview' && (
        <div className="max-w-[1200px] mx-auto px-4 mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left Column (Groups) */}
            <div className="flex-1">
              <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider mb-3">Groups</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Group Alpha */}
                <div className="bg-[#222] border border-[#333]">
                  <div className="flex items-center p-3 border-b border-[#333]">
                    <div className="w-[170px] text-xs font-bold text-white uppercase">Group Alpha</div>
                    <div className="w-12 text-center text-[10px] font-bold text-[#a0a0a0]">REC</div>
                    <div className="w-12 text-center text-[10px] font-bold text-[#a0a0a0]">MAP</div>
                    <div className="w-16 text-center text-[10px] font-bold text-[#a0a0a0]">RND</div>
                    <div className="flex-1 text-right text-[10px] font-bold text-[#a0a0a0]">Δ</div>
                  </div>
                  {alphaDisplay.map((team, idx) => renderGroupRow(team, idx))}
                </div>

                {/* Group Omega */}
                <div className="bg-[#222] border border-[#333]">
                  <div className="flex items-center p-3 border-b border-[#333]">
                    <div className="w-[170px] text-xs font-bold text-white uppercase">Group Omega</div>
                    <div className="w-12 text-center text-[10px] font-bold text-[#a0a0a0]">REC</div>
                    <div className="w-12 text-center text-[10px] font-bold text-[#a0a0a0]">MAP</div>
                    <div className="w-16 text-center text-[10px] font-bold text-[#a0a0a0]">RND</div>
                    <div className="flex-1 text-right text-[10px] font-bold text-[#a0a0a0]">Δ</div>
                  </div>
                  {omegaDisplay.map((team, idx) => renderGroupRow(team, idx))}
                </div>

              </div>
              
              <div className="flex justify-center mt-3 mb-8">
                 <button className="bg-[#222] border border-[#333] text-[#a0a0a0] hover:text-white text-xs font-bold px-4 py-2 flex items-center gap-2 transition-colors">
                   <span className="text-[10px]">▼</span> Show Matches (15)
                 </button>
              </div>

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
                 <button className="bg-[#222] border border-[#333] text-[#a0a0a0] hover:text-white text-[10px] font-bold px-3 py-1 transition-colors">
                   Toggle Rosters
                 </button>
              </div>
              
              {registeredTeams.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {registeredTeams.map(team => (
                    <div key={team.id} className="bg-[#222] border border-[#333] flex flex-col h-40 hover:bg-[#2a2a2a] transition-colors cursor-pointer group">
                       <div className="bg-[#2a2a2a] group-hover:bg-[#333] p-2 text-center text-xs font-bold text-white border-b border-[#333] truncate">
                         {team.name}
                       </div>
                       <div className="flex-1 flex items-center justify-center p-4">
                         {team.logoUrl ? (
                           <img src={team.logoUrl} alt={team.name} className="max-h-16 object-contain" />
                         ) : (
                           <div className="text-4xl font-display font-bold text-[#444] group-hover:text-[#555]">
                             {team.name.substring(0,2).toUpperCase()}
                           </div>
                         )}
                       </div>
                       <div className="p-2 text-center text-[10px] text-[#666] border-t border-[#333]">
                         Registered Team
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#222] border border-[#333] p-8 text-center text-sm text-[#a0a0a0]">
                  No teams have registered for this tournament yet.
                </div>
              )}
              
            </div>

            {/* Right Column (Sidebar) */}
            <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
              
              {/* Upcoming Matches */}
              <div>
                <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider mb-3">Upcoming Matches</h2>
                <div className="bg-[#222] border border-[#333]">
                   {[
                     { label: 'Group Stage - Week 2', t1: 'Evil Geniuses', t2: 'LEVIATÁN', time: '3d 20h' },
                     { label: 'Group Stage - Week 2', t1: 'ENVY', t2: 'MIBR', time: '3d 23h' },
                     { label: 'Group Stage - Week 2', t1: 'FURIA', t2: 'NRG', time: '4d 20h' }
                   ].map((match, idx) => (
                     <div key={idx} className="p-3 border-b border-[#333] last:border-0 hover:bg-[#2a2a2a] cursor-pointer transition-colors flex justify-between items-center">
                       <div className="flex-1">
                         <div className="text-[10px] text-[#a0a0a0] mb-2">{match.label}</div>
                         <div className="flex items-center justify-between mb-1">
                           <div className="text-xs font-semibold text-white flex items-center gap-2">
                             <span className="text-[10px]">🇺🇸</span> {match.t1}
                           </div>
                           <div className="text-xs text-[#666]">-</div>
                         </div>
                         <div className="flex items-center justify-between">
                           <div className="text-xs font-semibold text-white flex items-center gap-2">
                             <span className="text-[10px]">🇧🇷</span> {match.t2}
                           </div>
                           <div className="text-xs text-[#666]">-</div>
                         </div>
                       </div>
                       <div className="text-[10px] font-bold text-[#32cd32] w-14 text-right">
                         {match.time}
                       </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* Latest Results */}
              <div>
                <h2 className="text-primary-red text-xs font-bold uppercase tracking-wider mb-3">Latest Results</h2>
                <div className="bg-[#222] border border-[#333]">
                   {[
                     { label: 'Group Stage - Week 1', t1: 'NRG', s1: 2, t2: 'MIBR', s2: 1, time: '23h 56m' },
                     { label: 'Group Stage - Week 1', t1: 'G2 Esports', s1: 1, t2: '100 Thieves', s2: 2, time: '1d 3h' },
                     { label: 'Group Stage - Week 1', t1: 'KRÜ Esports', s1: 1, t2: 'LOUD', s2: 2, time: '2d 1h' }
                   ].map((match, idx) => (
                     <div key={idx} className="p-3 border-b border-[#333] last:border-0 hover:bg-[#2a2a2a] cursor-pointer transition-colors flex justify-between items-center">
                       <div className="flex-1">
                         <div className="text-[10px] text-[#a0a0a0] mb-2">{match.label}</div>
                         <div className="flex items-center justify-between mb-1">
                           <div className={`text-xs font-semibold flex items-center gap-2 ${match.s1 > match.s2 ? 'text-white' : 'text-[#a0a0a0]'}`}>
                             <span className="text-[10px]">🇺🇸</span> {match.t1}
                           </div>
                           <div className={`text-xs font-mono font-bold pr-4 ${match.s1 > match.s2 ? 'text-white' : 'text-[#a0a0a0]'}`}>{match.s1}</div>
                         </div>
                         <div className="flex items-center justify-between">
                           <div className={`text-xs font-semibold flex items-center gap-2 ${match.s2 > match.s1 ? 'text-white' : 'text-[#a0a0a0]'}`}>
                             <span className="text-[10px]">🇧🇷</span> {match.t2}
                           </div>
                           <div className={`text-xs font-mono font-bold pr-4 ${match.s2 > match.s1 ? 'text-white' : 'text-[#a0a0a0]'}`}>{match.s2}</div>
                         </div>
                       </div>
                       <div className="text-[10px] font-bold text-[#a0a0a0] w-14 text-right">
                         {match.time}
                       </div>
                     </div>
                   ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

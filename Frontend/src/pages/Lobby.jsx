import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import api from '../services/api';
import { updateMatchResult } from '../services/matchService'; 

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

const MAP_POOL = ['ASCENT', 'BIND', 'BREEZE', 'FRACTURE', 'HAVEN', 'ICEBOX', 'LOTUS', 'PEARL', 'SPLIT', 'SUNSET'];

const INITIAL_SERIES = {
  id: null, format: 'BO3',
  teamA: { id: 0, name: 'ĐANG TẢI...', short: 'TBA', score: 0 }, 
  teamB: { id: 0, name: 'ĐANG TẢI...', short: 'TBB', score: 0 },
  bannedMaps: [],
  games: [
    { id: 101, gameNumber: 1, map: 'CHƯA CHỌN', status: 'WAITING', scoreA: 0, scoreB: 0, teamAPicks: [], teamABans: [], teamBPicks: [], teamBBans: [], currentTurnTeamId: 1 },
    { id: 102, gameNumber: 2, map: 'CHƯA CHỌN', status: 'LOCKED', scoreA: 0, scoreB: 0, teamAPicks: [], teamABans: [], teamBPicks: [], teamBBans: [], currentTurnTeamId: 1 },
    { id: 103, gameNumber: 3, map: 'CHƯA CHỌN', status: 'LOCKED', scoreA: 0, scoreB: 0, teamAPicks: [], teamABans: [], teamBPicks: [], teamBBans: [], currentTurnTeamId: 1 },
  ]
};

const Lobby = () => {
  const { matchId } = useParams(); 
  const navigate = useNavigate();
  const currentUser = getCurrentUser() || {}; 
  
  const [seriesData, setSeriesData] = useState(() => {
    const saved = localStorage.getItem(`lobby_series_${matchId}`);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (parsed && parsed.teamA && parsed.teamB && Array.isArray(parsed.games)) {
          return parsed;
        }
      } catch(e) {}
    }
    return INITIAL_SERIES;
  });
  
  useEffect(() => {
    if (seriesData.id) {
      localStorage.setItem(`lobby_series_${matchId}`, JSON.stringify(seriesData));
    }
  }, [seriesData, matchId]);

  const [activeGame, setActiveGame] = useState(null);
  
  const [draftPhase, setDraftPhase] = useState('NONE'); 
  const [mapDraftStep, setMapDraftStep] = useState(0);
  const [selectedHover, setSelectedHover] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [startCountdown, setStartCountdown] = useState(null); 
  const [tempScores, setTempScores] = useState({});

  const [stompClient, setStompClient] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set()); 

  let autoRole = 'PLAYER';
  let currentTurnTeamId = 0;

  const username = (currentUser.username || '').toLowerCase();
  const email = (currentUser.email || '').toLowerCase();

  if (currentUser.globalRole === 'ADMIN' || currentUser.globalRole === 'REFEREE' || currentUser.globalRole === 'ORGANIZER') {
    autoRole = 'ADMIN';
  } 
  else if (currentUser.id === seriesData.teamA.captainId || (seriesData.teamA.short && (username.includes(seriesData.teamA.short.toLowerCase()) || email.includes(seriesData.teamA.short.toLowerCase())))) {
    autoRole = 'TEAM_A';
    currentTurnTeamId = 1;
  } 
  else if (currentUser.id === seriesData.teamB.captainId || (seriesData.teamB.short && (username.includes(seriesData.teamB.short.toLowerCase()) || email.includes(seriesData.teamB.short.toLowerCase())))) {
    autoRole = 'TEAM_B';
    currentTurnTeamId = 2;
  }

  const currentUserRole = autoRole === 'ADMIN' ? 'ADMIN' : 'PLAYER';
  const currentUserId = currentTurnTeamId; 
  const isTeamAPresent = onlineUsers.has('TEAM_A');
  const isTeamBPresent = onlineUsers.has('TEAM_B');

  const getMapDraftSequence = (format) => {
    const normalized = (format || 'BO3').toUpperCase();
    if (normalized === 'BO1') {
      return [
        { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
        { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
        { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
        { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
        { action: 'BAN', teamId: 1 }
      ];
    }
    if (normalized === 'BO5') {
      return [
        { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
        { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
        { action: 'PICK', teamId: 1 }, { action: 'PICK', teamId: 2 },
        { action: 'PICK', teamId: 1 }, { action: 'PICK', teamId: 2 }
      ];
    }
    return [
      { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
      { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
      { action: 'PICK', teamId: 1 }, { action: 'PICK', teamId: 2 },
      { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 }
    ];
  };

  const getAgentDraftSequence = () => {
    return [
      { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
      { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
      { action: 'BAN', teamId: 1 }, { action: 'BAN', teamId: 2 },
      { action: 'PICK', teamId: 1 }, { action: 'PICK', teamId: 2 },
      { action: 'PICK', teamId: 1 }, { action: 'PICK', teamId: 2 },
      { action: 'PICK', teamId: 1 }, { action: 'PICK', teamId: 2 },
      { action: 'PICK', teamId: 1 }, { action: 'PICK', teamId: 2 },
      { action: 'PICK', teamId: 1 }, { action: 'PICK', teamId: 2 }
    ];
  };

  const activeGameSafe = {
    id: activeGame?.id ?? null,
    gameNumber: activeGame?.gameNumber ?? 1,
    map: activeGame?.map ?? 'CHƯA CHỌN',
    currentTurnTeamId: activeGame?.currentTurnTeamId ?? 1,
    teamAPicks: Array.isArray(activeGame?.teamAPicks) ? activeGame.teamAPicks : [],
    teamABans: Array.isArray(activeGame?.teamABans) ? activeGame.teamABans : [],
    teamBPicks: Array.isArray(activeGame?.teamBPicks) ? activeGame.teamBPicks : [],
    teamBBans: Array.isArray(activeGame?.teamBBans) ? activeGame.teamBBans : [],
    mapBansA: Array.isArray(activeGame?.mapBansA) ? activeGame.mapBansA : [],
    mapBansB: Array.isArray(activeGame?.mapBansB) ? activeGame.mapBansB : [],
    mapPicksA: Array.isArray(activeGame?.mapPicksA) ? activeGame.mapPicksA : [],
    mapPicksB: Array.isArray(activeGame?.mapPicksB) ? activeGame.mapPicksB : [],
    sidePicksA: Array.isArray(activeGame?.sidePicksA) ? activeGame.sidePicksA : [],
    sidePicksB: Array.isArray(activeGame?.sidePicksB) ? activeGame.sidePicksB : [],
    mapDecider: activeGame?.mapDecider ?? null,
  };

  const isMapVeto = draftPhase === 'MAP_VETO';
  const currentMapAction = isMapVeto ? getMapDraftSequence(seriesData.format)[mapDraftStep] : null;

  const totalAgentActions = activeGameSafe.teamABans.length + activeGameSafe.teamBBans.length + activeGameSafe.teamAPicks.length + activeGameSafe.teamBPicks.length;
  const agentDraftSeq = getAgentDraftSequence();
  const currentAgentAction = (!isMapVeto && totalAgentActions < agentDraftSeq.length) ? agentDraftSeq[totalAgentActions] : null;
  const isAgentDraftComplete = (!isMapVeto && totalAgentActions >= agentDraftSeq.length);

  const usedMaps = new Set([
    ...activeGameSafe.mapBansA, ...activeGameSafe.mapBansB,
    ...activeGameSafe.mapPicksA, ...activeGameSafe.mapPicksB,
    ...(activeGameSafe.mapDecider ? [activeGameSafe.mapDecider] : [])
  ]);

  const currentTurnTeamIdForDraft = isMapVeto ? currentMapAction?.teamId : currentAgentAction?.teamId;
  const isMyTurn = currentTurnTeamId !== 0 && currentTurnTeamIdForDraft === currentTurnTeamId && !isAgentDraftComplete;

  const mapStatus = (mapName) => {
    // Kiểm tra tất cả các tập hợp đã lưu trữ
    const isBanned = activeGameSafe.mapBansA.includes(mapName) || activeGameSafe.mapBansB.includes(mapName);
    const isPicked = activeGameSafe.mapPicksA.includes(mapName) || activeGameSafe.mapPicksB.includes(mapName) || activeGameSafe.mapDecider === mapName;
    
    if (isBanned) return 'BANNED';
    if (isPicked) return 'PICKED';
    return null;
};

  const agentStatus = (agentName) => {
    if (activeGameSafe.teamABans.includes(agentName) || activeGameSafe.teamBBans.includes(agentName)) return 'BANNED';
    if (currentUserId === 1 && activeGameSafe.teamAPicks.includes(agentName)) return 'PICKED_BY_ME';
    if (currentUserId === 2 && activeGameSafe.teamBPicks.includes(agentName)) return 'PICKED_BY_ME';
    return null;
  };

  useEffect(() => {
    if (matchId) {
      const fetchMatchData = async () => {
        try {
          const response = await api.get(`/matches/${matchId}`);
          const realMatch = response.data.data;
          
          setSeriesData(prev => {
            const scoreA = realMatch.scoreTeam1 || 0;
            const scoreB = realMatch.scoreTeam2 || 0;
            const totalCompleted = scoreA + scoreB;
            const matchFormat = realMatch.format || 'BO3';
            const winThreshold = matchFormat === 'BO3' ? 2 : matchFormat === 'BO5' ? 3 : 1;
            const isOver = realMatch.status === 'COMPLETED' || scoreA >= winThreshold || scoreB >= winThreshold;
            
            let baseGames = [...prev.games];
            const expectedGamesCount = matchFormat === 'BO1' ? 1 : matchFormat === 'BO5' ? 5 : 3;
            while (baseGames.length < expectedGamesCount) {
                const nextId = baseGames.length > 0 ? baseGames[baseGames.length - 1].id + 1 : 101;
                const nextGameNumber = baseGames.length + 1;
                baseGames.push({
                    id: nextId, gameNumber: nextGameNumber, map: 'CHƯA CHỌN', status: 'LOCKED', scoreA: 0, scoreB: 0,
                    teamAPicks: [], teamABans: [], teamBPicks: [], teamBBans: [], currentTurnTeamId: 1
                });
            }

            const newGames = baseGames.map((g, index) => {
               if (index < totalCompleted) {
                   return { ...g, status: 'COMPLETED' };
               }
               if (isOver && index >= totalCompleted) {
                   return { ...g, status: 'CANCELED' };
               }
               if (!isOver && index === totalCompleted) {
                   if (g.status === 'LOCKED' || g.status === 'CANCELED' || g.status === 'COMPLETED') {
                       return { ...g, status: 'WAITING' };
                   }
                   return g;
               }
               if (!isOver && index > totalCompleted) {
                   return { ...g, status: 'LOCKED' };
               }
               return g;
            });

            return {
              ...prev, id: realMatch.id, format: matchFormat,
              teamA: { ...prev.teamA, id: realMatch.team1Id, name: realMatch.team1Name || 'SAIGON PHANTOM', short: realMatch.team1Tag || 'SGP', score: scoreA },
              teamB: { ...prev.teamB, id: realMatch.team2Id, name: realMatch.team2Name || 'PAPER REX', short: realMatch.team2Tag || 'PRX', score: scoreB },
              games: newGames
            };
          });
        } catch (error) {
          setSeriesData(prev => ({ ...prev, teamA: { ...prev.teamA, name: 'SAIGON PHANTOM', short: 'SGP' }, teamB: { ...prev.teamB, name: 'PAPER REX', short: 'PRX' } }));
        }
      };
      fetchMatchData();
    }
  }, [matchId]);

  useEffect(() => {
    if (!activeGame || startCountdown !== null || isAgentDraftComplete) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [activeGame, startCountdown, isAgentDraftComplete]);

  useEffect(() => {
    if (timeLeft === 0 && activeGame && startCountdown === null && !isAgentDraftComplete) {
      const isTeamAOnline = onlineUsers.has('TEAM_A');
      const isTeamBOnline = onlineUsers.has('TEAM_B');
      const isAdminOnline = onlineUsers.has('ADMIN');
      
      const isActiveTeamOnline = currentTurnTeamIdForDraft === 1 ? isTeamAOnline : isTeamBOnline;
      
      let shouldITrigger = false;
      if (isMyTurn) {
        shouldITrigger = true; 
      } else if (!isActiveTeamOnline) {
        if (autoRole === 'ADMIN') {
           shouldITrigger = true;
        } else if (autoRole === (currentTurnTeamIdForDraft === 1 ? 'TEAM_B' : 'TEAM_A') && !isAdminOnline) {
           shouldITrigger = true;
        }
      }

      if (shouldITrigger) {
        setTimeLeft(30); 

        let availableOptions = [];
        if (isMapVeto) {
           availableOptions = MAP_POOL.filter(m => !usedMaps.has(m));
        } else {
           const allBans = [...activeGameSafe.teamABans, ...activeGameSafe.teamBBans];
           const myPicks = currentUserId === 1 ? activeGameSafe.teamAPicks : activeGameSafe.teamBPicks;
           availableOptions = AGENT_POOL.map(a => a.name).filter(a => !allBans.includes(a) && !myPicks.includes(a));
        }

        const randomPick = currentMapAction?.action === 'PICK_SIDE' ? (Math.random() > 0.5 ? 'ATTACK' : 'DEFENSE') : (availableOptions[Math.floor(Math.random() * availableOptions.length)] || (isMapVeto ? 'ASCENT' : 'JETT'));
        const phaseType = isMapVeto ? 'MAP' : 'AGENT';
        const actionType = isMapVeto ? currentMapAction?.action : currentAgentAction?.action;

        const payload = { 
           type: 'DRAFT_ACTION', matchId: activeGameSafe.id, teamId: currentTurnTeamIdForDraft, actionType, phase: phaseType, selection: randomPick
        };
        
        try {
          if (stompClient && stompClient.connected) {
            stompClient.publish({ destination: `/topic/room/${matchId}`, body: JSON.stringify(payload) });
            stompClient.publish({ destination: "/app/draft/action", body: JSON.stringify(payload) });
          }
        } catch (e) {
          console.error("Lỗi khi tự động chọn:", e);
        }
      }
    }
  }, [timeLeft, activeGame, isMyTurn, startCountdown, isMapVeto, matchId, stompClient, currentMapAction, currentAgentAction, usedMaps, currentUserId, isAgentDraftComplete]);

  useEffect(() => {
    if (!activeGame) return;
    const syncGame = seriesData.games.find(g => g.id === activeGame.id);
    if (!syncGame) return;

    if (JSON.stringify(syncGame) !== JSON.stringify(activeGame)) {
      setActiveGame(syncGame);
    }

    const sequence = getMapDraftSequence(seriesData.format);
    const totalMapActions = (syncGame.mapBansA?.length||0) + (syncGame.mapBansB?.length||0) + (syncGame.mapPicksA?.length||0) + (syncGame.mapPicksB?.length||0) + (syncGame.sidePicksA?.length||0) + (syncGame.sidePicksB?.length||0);
    const hasDecider = syncGame.mapDecider ? 1 : 0;
    
    if (syncGame.gameNumber === 1 && seriesData.bannedMaps.length === 0) {
      if ((totalMapActions + hasDecider) >= sequence.length) {
         if (draftPhase !== 'AGENT_DRAFT') setDraftPhase('AGENT_DRAFT');
      } else {
         if (draftPhase !== 'MAP_VETO') setDraftPhase('MAP_VETO');
         if (mapDraftStep !== totalMapActions) setMapDraftStep(totalMapActions);
      }
    } else {
      if (draftPhase !== 'AGENT_DRAFT') setDraftPhase('AGENT_DRAFT');
    }
  }, [seriesData, activeGame, draftPhase, mapDraftStep]);

  useEffect(() => {
    if (startCountdown !== null && startCountdown > 0) {
      const timer = setTimeout(() => setStartCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (startCountdown === 0) {
      setStartCountdown(null);
      if (activeGame?.gameNumber === 1 && seriesData.bannedMaps.length === 0) {
        setMapDraftStep(0);
        setDraftPhase('MAP_VETO');
      } else {
        setDraftPhase('AGENT_DRAFT');
      }
    }
  }, [startCountdown, activeGame, seriesData.bannedMaps]);

  const handleLeaveRoom = () => {
    if (activeGame && !isAgentDraftComplete) {
      if (window.confirm('CẢNH BÁO: Đang Ban/Pick. Thoát ngay?')) navigate(-1);
    } else { navigate(-1); }
  };

  useEffect(() => {
    if (!matchId) return;
    const socket = new SockJS('/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/room/${matchId}`, (message) => {
          const data = JSON.parse(message.body);
          
          if (data.type === 'PING' || data.type === 'JOIN') {
             // We can trigger a sync request when a new user joins!
             if (data.type === 'JOIN') {
                 client.publish({ destination: `/topic/room/${matchId}`, body: JSON.stringify({ type: 'PING', role: autoRole }) });
                 setTimeout(() => {
                     client.publish({ destination: `/topic/room/${matchId}`, body: JSON.stringify({ type: 'SYNC_REQUEST' }) });
                 }, 500);
             }
             setOnlineUsers(prev => new Set([...prev, data.role]));
          }
          if (data.type === 'LEAVE') {
            setOnlineUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(data.role);
              return newSet;
            });
          }
          
          if (data.type === 'START_SYNC') {
            const gameIdValue = typeof data.gameId === 'string' ? Number(data.gameId) : data.gameId;
            const gameToStart = seriesData.games.find(g => g.id === gameIdValue);
            if (gameToStart) {
              setActiveGame(gameToStart); setStartCountdown(5);
              setSeriesData(prev => ({ ...prev, games: prev.games.map(g => g.id === gameIdValue ? { ...g, status: 'DRAFTING' } : g) }));
            }
          }

          if (data.type === 'COMPLETE_DRAFT') {
            const gameIdValue = typeof data.gameId === 'string' ? Number(data.gameId) : data.gameId;
            setSeriesData(prev => ({
              ...prev, 
              games: prev.games.map(g => g.id === gameIdValue ? { ...g, status: 'PLAYING' } : g)
            }));
            setActiveGame(null); 
            setDraftPhase('NONE');
          }

          if (data.type === 'DRAFT_ACTION') {
            const { matchId: incomingMatchId, teamId: actedTeamId, actionType, phase, selection } = data;
            setTimeLeft(30);

            setSeriesData(prev => {
              const sequenceMap = getMapDraftSequence(prev.format);
              const sequenceAgent = getAgentDraftSequence();
              
              // Clone mảng games để cập nhật an toàn
              const newGames = prev.games.map(g => ({ ...g }));
              
              const game1 = newGames.find(g => g.gameNumber === 1);
              const targetGame = newGames.find(g => g.id === incomingMatchId);
              if (!targetGame) return prev;
              
              const isTeamA = actedTeamId === 1;

              if (phase === 'MAP' && game1) {
                if (actionType === 'BAN') {
                  if (isTeamA) game1.mapBansA = [...(game1.mapBansA||[]), selection];
                  else game1.mapBansB = [...(game1.mapBansB||[]), selection];
                } else {
                  if (isTeamA) game1.mapPicksA = [...(game1.mapPicksA||[]), selection];
                  else game1.mapPicksB = [...(game1.mapPicksB||[]), selection];
                  
                  // ĐỒNG BỘ MAP VÀO VÁN ĐẤU TƯƠNG ỨNG
                  const totalPicks = (game1.mapPicksA?.length||0) + (game1.mapPicksB?.length||0);
                  const gameToUpdate = newGames.find(g => g.gameNumber === totalPicks);
                  if (gameToUpdate) {
                      gameToUpdate.map = selection;
                  }
                }

                const totalMapActions = (game1.mapBansA?.length||0) + (game1.mapBansB?.length||0) + (game1.mapPicksA?.length||0) + (game1.mapPicksB?.length||0) + (game1.sidePicksA?.length||0) + (game1.sidePicksB?.length||0);
                game1.currentTurnTeamId = totalMapActions < sequenceMap.length ? sequenceMap[totalMapActions].teamId : 1;
                
                // KIỂM TRA NẾU CÒN ĐÚNG 1 MAP (DECIDER) - Bước cuối là chọn Phe cho Decider
                if (totalMapActions === sequenceMap.length - 1 && sequenceMap[totalMapActions].action === 'PICK_SIDE') {
                   const usedMapsArray = [...(game1.mapBansA||[]), ...(game1.mapBansB||[]), ...(game1.mapPicksA||[]), ...(game1.mapPicksB||[])];
                   const availableMaps = MAP_POOL.filter(m => !usedMapsArray.includes(m));
                   const deciderMap = availableMaps[0] || 'DECIDER';
                   
                   game1.mapDecider = deciderMap;
                   
                   // Gán Map còn sót lại (Decider) cho Ván chưa được chọn
                   const finalGame = newGames.find(g => g.map === 'CHƯA CHỌN');
                   if (finalGame) finalGame.map = deciderMap;
                } else if (totalMapActions >= sequenceMap.length && !game1.mapDecider) {
                   // Fallback in case there is no PICK_SIDE for decider
                   const usedMapsArray = [...(game1.mapBansA||[]), ...(game1.mapBansB||[]), ...(game1.mapPicksA||[]), ...(game1.mapPicksB||[])];
                   const availableMaps = MAP_POOL.filter(m => !usedMapsArray.includes(m));
                   const deciderMap = availableMaps[0] || 'DECIDER';
                   game1.mapDecider = deciderMap;
                   const finalGame = newGames.find(g => g.map === 'CHƯA CHỌN');
                   if (finalGame) finalGame.map = deciderMap;
                }
              } else {
                // AGENT PHASE
                if (actionType === 'BAN') {
                  if (isTeamA) targetGame.teamABans = [...(targetGame.teamABans||[]), selection];
                  else targetGame.teamBBans = [...(targetGame.teamBBans||[]), selection];
                } else {
                  if (isTeamA) targetGame.teamAPicks = [...(targetGame.teamAPicks||[]), selection];
                  else targetGame.teamBPicks = [...(targetGame.teamBPicks||[]), selection];
                }
                
                const newTotalAgents = (targetGame.teamABans?.length||0) + (targetGame.teamBBans?.length||0) + (targetGame.teamAPicks?.length||0) + (targetGame.teamBPicks?.length||0);
                targetGame.currentTurnTeamId = newTotalAgents < sequenceAgent.length ? sequenceAgent[newTotalAgents].teamId : 1; 
              }
              
              return { ...prev, games: newGames };
            });
          } // <--- Added this bracket!
          if (data.type === 'SYNC_REQUEST') {
              setSeriesData(prev => {
                  const game1 = prev.games.find(g => g.gameNumber === 1);
                  const totalActions = (game1?.mapBansA?.length||0) + (game1?.mapBansB?.length||0) + (game1?.mapPicksA?.length||0) + (game1?.mapPicksB?.length||0) + (game1?.sidePicksA?.length||0) + (game1?.sidePicksB?.length||0);
                  if (totalActions > 0) {
                      client.publish({
                          destination: `/topic/room/${matchId}`,
                          body: JSON.stringify({ type: 'SYNC_REPLY', seriesData: prev })
                      });
                  }
                  return prev;
              });
          }
          if (data.type === 'SYNC_REPLY') {
              setSeriesData(prev => {
                  const game1 = prev.games.find(g => g.gameNumber === 1);
                  const myTotalActions = (game1?.mapBansA?.length||0) + (game1?.mapBansB?.length||0) + (game1?.mapPicksA?.length||0) + (game1?.mapPicksB?.length||0) + (game1?.sidePicksA?.length||0) + (game1?.sidePicksB?.length||0);
                  
                  const remoteGame1 = data.seriesData.games.find(g => g.gameNumber === 1);
                  const remoteTotalActions = (remoteGame1?.mapBansA?.length||0) + (remoteGame1?.mapBansB?.length||0) + (remoteGame1?.mapPicksA?.length||0) + (remoteGame1?.mapPicksB?.length||0) + (remoteGame1?.sidePicksA?.length||0) + (remoteGame1?.sidePicksB?.length||0);
                  
                  if (remoteTotalActions > myTotalActions) {
                      return data.seriesData;
                  }
                  return prev;
              });
          }
          if (data.type === 'SYNC_RESET') {
              localStorage.removeItem(`lobby_series_${matchId}`);
              window.location.reload();
          }
          if (data.type === 'UPDATE_SCORE') {
            const { gameId, scoreA, scoreB } = data;
            setSeriesData(prev => {
              const targetGame = prev.games.find(g => g.id === gameId);
              if (targetGame && targetGame.status === 'COMPLETED') return prev; // Already updated locally

              let newScoreA = prev.teamA.score; let newScoreB = prev.teamB.score;
              if (scoreA > scoreB) newScoreA += 1; else newScoreB += 1;
              const winThreshold = prev.format === 'BO3' ? 2 : prev.format === 'BO5' ? 3 : 1;
              const over = newScoreA >= winThreshold || newScoreB >= winThreshold;
              let nextGameUnlocked = false;

              const newGames = prev.games.map((g) => {
                if (g.id === gameId) return { ...g, status: 'COMPLETED', scoreA, scoreB };
                if (over && (g.status === 'LOCKED' || g.status === 'WAITING')) return { ...g, status: 'CANCELED' };
                if (!over && g.status === 'LOCKED' && !nextGameUnlocked && g.id > gameId) {
                  nextGameUnlocked = true; return { ...g, status: 'WAITING' };
                }
                return g;
              });
              
              return { ...prev, teamA: { ...prev.teamA, score: newScoreA }, teamB: { ...prev.teamB, score: newScoreB }, games: newGames };
            });
          }
          if (data.type === 'UNDO_SCORE') {
            const { gameId } = data;
            setSeriesData(prev => {
              const game = prev.games.find(g => g.id === gameId);
              if (!game || game.status !== 'COMPLETED') return prev;

              let newScoreA = prev.teamA.score; let newScoreB = prev.teamB.score;
              if (game.scoreA > game.scoreB) newScoreA = Math.max(0, newScoreA - 1); else newScoreB = Math.max(0, newScoreB - 1);

              const newGames = prev.games.map((g) => {
                if (g.id === gameId) return { ...g, status: 'PLAYING', scoreA: 0, scoreB: 0 };
                if (g.id > gameId) return { ...g, status: 'LOCKED', scoreA: 0, scoreB: 0 };
                return g;
              });
              
              return { ...prev, teamA: { ...prev.teamA, score: newScoreA }, teamB: { ...prev.teamB, score: newScoreB }, games: newGames };
            });
          }
        });
        
        client.publish({ destination: `/topic/room/${matchId}`, body: JSON.stringify({ type: 'JOIN', role: autoRole }) });
      }
    });
    client.activate();
    setStompClient(client);

    // Xử lý khi đóng tab trình duyệt
    const handleBeforeUnload = () => {
      try {
        if (client.connected) {
          client.publish({ destination: `/topic/room/${matchId}`, body: JSON.stringify({ type: 'LEAVE', role: autoRole }) });
        }
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      try {
        if (client.connected) {
          client.publish({ destination: `/topic/room/${matchId}`, body: JSON.stringify({ type: 'LEAVE', role: autoRole }) });
        }
      } catch (e) {}
      
      try {
        client.deactivate();
      } catch (e) {}
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [matchId, autoRole]);

  const handleLockSelection = () => {
    if (!selectedHover || !stompClient || !activeGameSafe.id || isAgentDraftComplete) return;

    setTimeLeft(30); 
    
    const phaseType = isMapVeto ? 'MAP' : 'AGENT';
    const actionType = isMapVeto ? currentMapAction?.action : currentAgentAction?.action;
    
    const payload = { 
      type: 'DRAFT_ACTION', matchId: activeGameSafe.id, teamId: currentUserId, actionType, phase: phaseType, selection: selectedHover
    };

    stompClient.publish({ destination: `/topic/room/${matchId}`, body: JSON.stringify(payload) });
    stompClient.publish({ destination: "/app/draft/action", body: JSON.stringify(payload) });
    
    setSelectedHover(null);
  };

  const handleAdminStartDraft = (gameId) => {
    stompClient?.publish({ destination: `/topic/room/${matchId}`, body: JSON.stringify({ type: 'START_SYNC', gameId }) });
  };

  const handleAdminCompleteDraft = () => {
    if (stompClient && activeGameSafe.id) {
      stompClient.publish({
        destination: `/topic/room/${matchId}`,
        body: JSON.stringify({ type: 'COMPLETE_DRAFT', gameId: activeGameSafe.id })
      });
    }
  };

  const handleAdminSaveScore = async (gameId) => {
    const scoreA = parseInt(tempScores[`${gameId}_A`] || 0); const scoreB = parseInt(tempScores[`${gameId}_B`] || 0);
    if (scoreA === scoreB) { alert("⚠️ Tỷ số không hợp lệ!"); return; }

    let currentSeriesScoreA = seriesData.teamA.score; 
    let currentSeriesScoreB = seriesData.teamB.score;
    if (scoreA > scoreB) currentSeriesScoreA += 1; else currentSeriesScoreB += 1;
    const winThreshold = seriesData.format === 'BO3' ? 2 : seriesData.format === 'BO5' ? 3 : 1;
    const isSeriesOver = currentSeriesScoreA >= winThreshold || currentSeriesScoreB >= winThreshold;
    
    try {
      const payload = {
          scoreTeam1: currentSeriesScoreA,
          scoreTeam2: currentSeriesScoreB,
          status: isSeriesOver ? 'COMPLETED' : 'LIVE',
          winnerId: isSeriesOver ? (currentSeriesScoreA > currentSeriesScoreB ? seriesData.teamA.id : seriesData.teamB.id) : null
      };
      await updateMatchResult(seriesData.id, payload, currentUser.id);

      if (stompClient) {
        stompClient.publish({
          destination: `/topic/room/${matchId}`,
          body: JSON.stringify({ type: 'UPDATE_SCORE', gameId, scoreA, scoreB })
        });
      }
    } catch (error) {
      console.error("Lỗi khi đồng bộ kết quả:", error);
      alert("Không thể lưu kết quả trận đấu lên máy chủ. Hãy kiểm tra lại kết nối hoặc quyền hạn của bạn!");
      return;
    }
    
    setSeriesData(prev => {
      let newScoreA = prev.teamA.score; let newScoreB = prev.teamB.score;
      if (scoreA > scoreB) newScoreA += 1; else newScoreB += 1;
      const over = newScoreA >= winThreshold || newScoreB >= winThreshold;
      let nextGameUnlocked = false;

      const newGames = prev.games.map((g) => {
        if (g.id === gameId) return { ...g, status: 'COMPLETED', scoreA, scoreB };
        if (over && (g.status === 'LOCKED' || g.status === 'WAITING')) return { ...g, status: 'CANCELED' };
        if (!over && g.status === 'LOCKED' && !nextGameUnlocked && g.id > gameId) {
          nextGameUnlocked = true; return { ...g, status: 'WAITING' };
        }
        return g;
      });
      return { ...prev, teamA: { ...prev.teamA, score: newScoreA }, teamB: { ...prev.teamB, score: newScoreB }, games: newGames };
    });
  };

  const handleAdminUndoScore = async (gameId) => {
    const game = seriesData.games.find(g => g.id === gameId);
    if (!game || game.status !== 'COMPLETED') return;

    if (!window.confirm("Bạn có chắc muốn hủy kết quả ván này để nhập lại?")) return;

    let currentSeriesScoreA = seriesData.teamA.score; 
    let currentSeriesScoreB = seriesData.teamB.score;
    if (game.scoreA > game.scoreB) currentSeriesScoreA = Math.max(0, currentSeriesScoreA - 1); 
    else currentSeriesScoreB = Math.max(0, currentSeriesScoreB - 1);

    try {
      const payload = {
          scoreTeam1: currentSeriesScoreA,
          scoreTeam2: currentSeriesScoreB,
          status: 'LIVE',
          winnerId: -1
      };
      await updateMatchResult(seriesData.id, payload, currentUser.id);

      if (stompClient) {
        stompClient.publish({
          destination: `/topic/room/${matchId}`,
          body: JSON.stringify({ type: 'UNDO_SCORE', gameId })
        });
      }
    } catch (error) {
      console.error("Lỗi khi hủy kết quả:", error);
      alert("Không thể hủy kết quả trận đấu lên máy chủ.");
      return;
    }

    setSeriesData(prev => {
      let newScoreA = prev.teamA.score; let newScoreB = prev.teamB.score;
      if (game.scoreA > game.scoreB) newScoreA = Math.max(0, newScoreA - 1); else newScoreB = Math.max(0, newScoreB - 1);

      const newGames = prev.games.map((g) => {
        if (g.id === gameId) return { ...g, status: 'PLAYING', scoreA: 0, scoreB: 0 };
        if (g.id > gameId) return { ...g, status: 'LOCKED', scoreA: 0, scoreB: 0 };
        return g;
      });
      
      return { ...prev, teamA: { ...prev.teamA, score: newScoreA }, teamB: { ...prev.teamB, score: newScoreB }, games: newGames };
    });
  };

  const AgentImage = ({ agentName, className }) => {
    const [imgError, setImgError] = useState(false);
    if (!agentName) return null;
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-[#1a242d] ${className}`}>
        {!imgError ? <img src={`/assets/agents/${agentName}.png`} alt={agentName} className="w-full h-full object-cover" onError={() => setImgError(true)} /> : <span className="text-[9px] font-bold text-gray-300 tracking-wider truncate px-1">{agentName}</span>}
      </div>
    );
  };

  const renderAgentSlots = (agents, type = 'pick', count = 5, size = 'sm') => {
    const slots = [];
    const isSmall = size === 'sm';
    const pickClass = isSmall ? 'w-8 h-8 xl:w-9 xl:h-9' : 'w-20 h-20';
    const banClass = isSmall ? 'w-5 h-5 xl:w-6 xl:h-6' : 'w-12 h-12';

    for (let i = 0; i < count; i++) {
      const agentName = agents[i];
      if (type === 'pick') {
        slots.push(<div key={i} className={`${pickClass} border flex items-center justify-center flex-shrink-0 bg-[#0f1923] ${agentName ? 'border-gray-500' : 'border-gray-700 border-dashed'}`}>{agentName && <AgentImage agentName={agentName} />}</div>);
      } else {
        slots.push(
          <div key={i} className={`${banClass} bg-red-950/40 border border-red-900/50 flex items-center justify-center flex-shrink-0 relative overflow-hidden opacity-80`}>
            {agentName ? (<><AgentImage agentName={agentName} className="opacity-40 grayscale" /><div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500 rotate-45 absolute"></div></div></>) : (<span className={`text-red-500/30 font-bold ${isSmall ? 'text-[6px]' : 'text-[10px]'}`}>BAN</span>)}
          </div>
        );
      }
    }
    return slots;
  };

  if (!activeGame) {
    return (
      <div className="min-h-screen bg-[#0f1923] text-white p-8 font-sans pb-32 relative">
        <button onClick={handleLeaveRoom} className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest z-10"><span>←</span> Rời Phòng</button>

        <div className="max-w-7xl mx-auto mb-10 text-center relative mt-4">
          <div className="absolute top-0 right-0 bg-success-cyan/20 border border-success-cyan text-success-cyan text-xs font-bold px-3 py-1 rounded">VAI TRÒ HIỆN TẠI: {autoRole}</div>
          <div className="absolute top-0 left-0 flex gap-4">
             <span className={`text-[10px] px-2 py-1 rounded border font-bold ${isTeamAPresent ? 'border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500'}`}>{seriesData.teamA.short}: {isTeamAPresent ? '🟢 ONLINE' : '⚫ OFFLINE'}</span>
             <span className={`text-[10px] px-2 py-1 rounded border font-bold ${isTeamBPresent ? 'border-[#ff4655] text-[#ff4655]' : 'border-gray-700 text-gray-500'}`}>{seriesData.teamB.short}: {isTeamBPresent ? '🟢 ONLINE' : '⚫ OFFLINE'}</span>
          </div>

          <h1 className="text-gray-400 text-sm tracking-widest mb-2 uppercase pt-8">TRẬN ĐẤU ID: {matchId} - {seriesData.format}</h1>
          <div className="flex justify-center items-center gap-12 font-display text-4xl mb-4 relative">
            <span className="text-blue-400 w-48 text-right">{seriesData.teamA.name}</span>
            <div className="bg-[#1b1b1b] px-6 py-3 rounded-lg border border-gray-800 tracking-[0.2em] shadow-lg flex items-center justify-center relative">
              <span className="text-white">{seriesData.teamA.score}</span><span className="text-[#ff4655] mx-4">-</span><span className="text-white">{seriesData.teamB.score}</span>
              {currentUserRole === 'ADMIN' && (
                <button 
                  onClick={() => {
                    if(window.confirm("Bạn có chắc muốn Reset trạng thái trận này cho TẤT CẢ mọi người?")) {
                      if (stompClient) {
                          stompClient.publish({
                              destination: `/topic/room/${matchId}`,
                              body: JSON.stringify({ type: 'SYNC_RESET' })
                          });
                      } else {
                          localStorage.removeItem(`lobby_series_${matchId}`);
                          window.location.reload();
                      }
                    }
                  }}
                  className="absolute -bottom-8 whitespace-nowrap text-[10px] text-red-500 hover:text-red-400 underline cursor-pointer uppercase tracking-widest"
                >
                  LÀM MỚI TRẠNG THÁI (ADMIN)
                </button>
              )}
            </div>
            <span className="text-[#ff4655] w-48 text-left">{seriesData.teamB.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {(() => {
            const lastCompletedGame = [...seriesData.games].reverse().find(g => g.status === 'COMPLETED');
            const lastCompletedGameId = lastCompletedGame ? lastCompletedGame.id : null;
            
            const maxGames = seriesData.format === 'BO1' ? 1 : seriesData.format === 'BO5' ? 5 : 3;
            const gamesToRender = seriesData.games.slice(0, maxGames);

            return gamesToRender.map((game) => {
              const displayStatus = game.status;
              return (
              <div key={game.id} className={`flex flex-col xl:flex-row items-center justify-between p-4 xl:p-5 gap-4 border rounded-sm transition-all duration-300
                ${displayStatus === 'WAITING' ? 'border-gray-500 bg-[#1f2933]' : ''}
                ${displayStatus === 'PLAYING' ? 'border-blue-500 bg-[#1f2933]' : ''} 
                ${displayStatus === 'COMPLETED' ? 'border-gray-600 bg-[#121a23]' : ''}
                ${(displayStatus === 'LOCKED' || displayStatus === 'CANCELED') ? 'border-gray-800 bg-[#0a1118] opacity-40' : ''}
              `}>
                <div className="flex flex-col text-center xl:text-left w-full xl:w-32 shrink-0">
                  <span className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Ván {game.gameNumber}</span>
                  <span className={`text-3xl font-display uppercase font-bold tracking-wide ${game.map === 'CHƯA CHỌN' ? 'text-gray-600' : 'text-white'}`}>{game.map}</span>
                  <span className={`text-[10px] mt-1 uppercase tracking-wider font-bold ${displayStatus === 'PLAYING' ? 'text-blue-400' : 'text-gray-500'}`}>
                    {displayStatus === 'WAITING' ? 'Chuẩn bị' : displayStatus === 'PLAYING' ? 'ĐANG THI ĐẤU' : displayStatus === 'LOCKED' ? 'Bị khóa' : 'Đã kết thúc'}
                  </span>
                </div>

                {(displayStatus !== 'CANCELED' && displayStatus !== 'LOCKED') ? (
                  <div className="flex flex-1 flex-col xl:flex-row items-center justify-center gap-4 w-full">
                    <div className="flex items-center gap-2 justify-end shrink-0">
                      <div className="flex gap-1 hidden md:flex">{renderAgentSlots(game.teamABans, 'ban', 3, 'sm')}</div>
                      <div className="flex gap-1">{renderAgentSlots(game.teamAPicks, 'pick', 5, 'sm')}</div>
                      {currentUserRole === 'ADMIN' && displayStatus === 'PLAYING' ? (<input type="number" min="0" value={tempScores[`${game.id}_A`] !== undefined ? tempScores[`${game.id}_A`] : game.scoreA} onChange={(e) => { let val = parseInt(e.target.value); if (isNaN(val)) val = ''; else if (val < 0) val = 0; setTempScores({...tempScores, [`${game.id}_A`]: val}); }} className="w-12 h-10 bg-black border border-gray-600 text-center font-display text-2xl text-blue-400 focus:border-blue-500 outline-none ml-2 rounded" />) : (<span className="text-2xl font-display font-bold w-10 text-center text-blue-400 ml-2">{displayStatus === 'WAITING' ? '-' : game.scoreA}</span>)}
                    </div>
                    <span className="text-gray-600 font-bold hidden xl:block text-xl shrink-0">VS</span>
                    <div className="flex items-center gap-2 justify-start flex-row-reverse xl:flex-row shrink-0">
                      {currentUserRole === 'ADMIN' && displayStatus === 'PLAYING' ? (<input type="number" min="0" value={tempScores[`${game.id}_B`] !== undefined ? tempScores[`${game.id}_B`] : game.scoreB} onChange={(e) => { let val = parseInt(e.target.value); if (isNaN(val)) val = ''; else if (val < 0) val = 0; setTempScores({...tempScores, [`${game.id}_B`]: val}); }} className="w-12 h-10 bg-black border border-gray-600 text-center font-display text-2xl text-[#ff4655] focus:border-[#ff4655] outline-none mr-2 rounded" />) : (<span className="text-2xl font-display font-bold w-10 text-center text-[#ff4655] mr-2">{displayStatus === 'WAITING' ? '-' : game.scoreB}</span>)}
                      <div className="flex gap-1">{renderAgentSlots(game.teamBPicks, 'pick', 5, 'sm')}</div>
                      <div className="flex gap-1 hidden md:flex">{renderAgentSlots(game.teamBBans, 'ban', 3, 'sm')}</div>
                    </div>
                  </div>
                ) : (<div className="flex-1"></div>)}

                <div className="w-full xl:w-40 flex shrink-0 justify-center xl:justify-end">
                  {displayStatus === 'WAITING' && currentUserRole === 'ADMIN' && (
                    <button onClick={() => handleAdminStartDraft(game.id)} className="bg-[#ff4655] text-white text-[11px] px-6 py-3 font-bold uppercase rounded tracking-widest whitespace-nowrap transition-all hover:bg-red-500 shadow-[0_0_10px_rgba(255,70,85,0.4)] animate-pulse">
                      BẮT ĐẦU VÁN {game.gameNumber}
                    </button>
                  )}
                  {displayStatus === 'WAITING' && currentUserRole !== 'ADMIN' && <span className="text-[11px] text-yellow-400 font-bold uppercase flex items-center gap-2 whitespace-nowrap">⏳ Chờ trọng tài...</span>}
                  
                  {displayStatus === 'PLAYING' && currentUserRole === 'ADMIN' && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleAdminSaveScore(game.id)} className="bg-success-cyan text-background text-[11px] px-6 py-3 font-bold uppercase rounded hover:brightness-110 tracking-widest shadow-[0_0_10px_rgba(0,255,209,0.3)] whitespace-nowrap">Lưu kết quả</button>
                      <button onClick={() => setTempScores(prev => ({...prev, [`${game.id}_A`]: 0, [`${game.id}_B`]: 0}))} className="bg-gray-800 text-gray-300 text-[10px] px-4 py-2 font-bold uppercase rounded hover:bg-gray-700 tracking-widest whitespace-nowrap">Reset Tỉ số</button>
                    </div>
                  )}
                  {displayStatus === 'PLAYING' && currentUserRole !== 'ADMIN' && <span className="text-[11px] text-blue-400 font-bold uppercase animate-pulse whitespace-nowrap">ĐANG THI ĐẤU</span>}
                  
                  {displayStatus === 'COMPLETED' && (
                    <div className="flex flex-col items-center xl:items-end gap-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap">ĐÃ LƯU KẾT QUẢ</span>
                      {currentUserRole === 'ADMIN' && game.id === lastCompletedGameId && (
                        <button onClick={() => handleAdminUndoScore(game.id)} className="text-[10px] text-[#ff4655] hover:text-red-400 font-bold uppercase underline whitespace-nowrap">Sửa kết quả</button>
                      )}
                    </div>
                  )}
                  {(displayStatus === 'CANCELED' || displayStatus === 'LOCKED') && <span className="text-2xl text-gray-700">🔒</span>}
                </div>
              </div>
            );
            });
          })()}
        </div>
      </div>
    );
  }

  if (startCountdown !== null) {
    return (
       <div className="fixed inset-0 bg-[#0a1118] flex flex-col items-center justify-center z-[100]">
           <p className="text-gray-400 text-2xl font-bold uppercase tracking-[0.3em] mb-4">Chuẩn bị tiến vào</p>
           <h2 className="text-5xl font-display font-bold text-white mb-12 uppercase tracking-widest">
              {activeGame && activeGame.gameNumber === 1 && seriesData.bannedMaps.length === 0 ? 'PHÒNG CẤM / CHỌN BẢN ĐỒ' : activeGame ? `PHÒNG DRAFT VÁN ${activeGame.gameNumber}` : 'PHÒNG DRAFT'}
           </h2>
           <div className="relative flex items-center justify-center">
              <div className="absolute w-48 h-48 rounded-full border-4 border-transparent border-t-[#ff4655] border-l-[#ff4655] animate-spin"></div>
              <span className="text-[120px] font-display font-bold text-[#ff4655] drop-shadow-[0_0_20px_rgba(255,70,85,0.8)]">{startCountdown}</span>
           </div>
       </div>
    );
  }

  const POOL_DATA = isMapVeto ? MAP_POOL : AGENT_POOL;

  return (
    <div className="min-h-screen bg-[#0f1923] text-white p-4 flex flex-col relative pb-32 overflow-hidden">
      
      <button onClick={handleLeaveRoom} className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase text-sm font-bold tracking-widest z-10"><span>←</span> Rời Phòng</button>

      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-transparent via-[#ff4655]/20 to-transparent flex items-center justify-center border-b border-[#ff4655]/30">
          <span className="text-[#ff4655] font-bold tracking-[0.3em] uppercase text-sm animate-pulse">
            {isMapVeto ? "🔥 GIAI ĐOẠN 1: CẤM VÀ CHỌN BẢN ĐỒ THI ĐẤU 🔥" : (isAgentDraftComplete ? "✅ ĐÃ HOÀN TẤT CHỌN ĐỘI HÌNH ✅" : "⚔️ GIAI ĐOẠN 2: CẤM VÀ CHỌN ĐẶC VỤ ⚔️")}
          </span>
      </div>

      <div className="flex-1 flex flex-col items-center mt-16">
        <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest text-gray-300">
          VÁN {activeGameSafe.gameNumber} - {isMapVeto ? (currentMapAction?.action === 'PICK_SIDE' ? 'ĐANG CHỜ CHỌN PHE' : (currentMapAction?.action === 'BAN' ? 'ĐANG CHỜ CẤM MAP' : 'ĐANG CHỜ CHỌN MAP')) : (isAgentDraftComplete ? 'ĐÃ HOÀN TẤT' : currentAgentAction?.action === 'BAN' ? 'ĐANG CHỜ CẤM TƯỚNG' : 'ĐANG CHỜ CHỌN TƯỚNG')}
        </h2>
        
        <div className="w-full max-w-[1400px] grid grid-cols-[1fr_auto_1fr] gap-8 items-center mb-12">
          {/* ĐỘI A */}
          <div className={`flex flex-col border-2 p-8 rounded-lg bg-[#121a23] transition-all duration-300 ${!isAgentDraftComplete && activeGameSafe.currentTurnTeamId === 1 ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-[#1f2933]'}`}>
            <h3 className="text-3xl font-display font-bold text-blue-400 mb-6 text-left">{seriesData.teamA.name}</h3>
            <div className="mb-8"><div className="grid grid-cols-5 gap-3">{!isMapVeto && renderAgentSlots(activeGameSafe.teamAPicks, 'pick', 5, 'lg')}</div></div>
            <div className="flex justify-end gap-2">{!isMapVeto && renderAgentSlots(activeGameSafe.teamABans, 'ban', 3, 'lg')}</div>
          </div>
          
          {/* ĐỒNG HỒ */}
          <div className="flex flex-col items-center justify-center w-48 relative">
             <span className="text-xs text-gray-400 tracking-widest mb-2 font-bold uppercase">Thời Gian</span>
             <span className={`font-display text-7xl font-bold transition-all duration-300 ${!isAgentDraftComplete && timeLeft <= 10 ? 'text-[#ff4655] scale-110 animate-pulse drop-shadow-[0_0_15px_rgba(255,70,85,0.6)]' : (isAgentDraftComplete ? 'text-success-cyan' : 'text-white')}`}>
                {isAgentDraftComplete ? 'OK' : timeLeft}
             </span>
             
             <div className="absolute -bottom-16 w-[300px] text-center">
                 <span className={`text-sm uppercase font-bold tracking-widest px-6 py-2 rounded-full border shadow-lg ${isAgentDraftComplete ? 'bg-green-900/40 text-success-cyan border-success-cyan' : currentTurnTeamIdForDraft === 1 ? 'bg-blue-900/40 text-blue-400 border-blue-500' : 'bg-red-900/40 text-[#ff4655] border-[#ff4655]'}`}>
                    {isAgentDraftComplete ? 'CHỜ ADMIN VÀO TRẬN' : `Đang đợi ${currentTurnTeamIdForDraft === 1 ? seriesData.teamA.short : seriesData.teamB.short} ${isMapVeto ? (currentMapAction?.action === 'BAN' ? 'CẤM MAP' : currentMapAction?.action === 'PICK_SIDE' ? 'CHỌN PHE' : 'CHỌN MAP') : (currentAgentAction?.action === 'BAN' ? 'CẤM TƯỚNG' : 'CHỌN TƯỚNG')}...`}
                 </span>
             </div>
          </div>
          
          {/* ĐỘI B */}
          <div className={`flex flex-col border-2 p-8 rounded-lg bg-[#121a23] transition-all duration-300 text-right ${!isAgentDraftComplete && activeGameSafe.currentTurnTeamId === 2 ? 'border-[#ff4655] shadow-[0_0_30px_rgba(255,70,85,0.2)]' : 'border-[#1f2933]'}`}>
             <h3 className="text-3xl font-display font-bold text-[#ff4655] mb-6 text-right">{seriesData.teamB.name}</h3>
            <div className="mb-8"><div className="grid grid-cols-5 gap-3 flex-row-reverse">{!isMapVeto && renderAgentSlots(activeGameSafe.teamBPicks, 'pick', 5, 'lg')}</div></div>
            <div className="flex justify-start gap-2">{!isMapVeto && renderAgentSlots(activeGameSafe.teamBBans, 'ban', 3, 'lg')}</div>
          </div>
        </div>

        {/* GIAO DIỆN HOÀN TẤT DÀNH CHO TRỌNG TÀI & NGƯỜI CHƠI */}
        {isAgentDraftComplete ? (
          <div className="w-full max-w-[1000px] mt-10 bg-[#1a242d] p-12 rounded border-2 border-success-cyan/30 text-center shadow-[0_0_40px_rgba(0,255,209,0.1)] flex flex-col items-center justify-center">
             <h3 className="text-3xl font-display font-bold text-success-cyan mb-4 uppercase tracking-[0.2em]">Đã hoàn tất chọn đội hình</h3>
             <p className="text-gray-400 mb-10">Hai đội đã hoàn tất việc chọn tướng cho Ván {activeGameSafe.gameNumber}.</p>
             
             {currentUserRole === 'ADMIN' ? (
                <button onClick={handleAdminCompleteDraft} className="bg-success-cyan text-background px-12 py-5 font-bold tracking-widest rounded uppercase transition hover:brightness-110 shadow-[0_0_20px_rgba(0,255,209,0.4)] animate-pulse hover:scale-105 active:scale-95">
                  XÁC NHẬN VÀ CHUYỂN SANG ĐANG THI ĐẤU
                </button>
             ) : (
                <div className="border border-yellow-500/50 bg-yellow-900/20 px-10 py-5 rounded">
                  <span className="text-yellow-400 font-bold uppercase flex items-center justify-center gap-3 animate-pulse tracking-widest">
                    <span className="text-2xl">⏳</span> ĐANG CHỜ TRỌNG TÀI XÁC NHẬN VÀO TRẬN...
                  </span>
                </div>
             )}
          </div>
        ) : (
          <div className={`w-full max-w-[1000px] mt-10 bg-[#1f2933] p-8 rounded border border-gray-700 text-center transition-all duration-300 shadow-2xl ${(!isMyTurn) ? 'opacity-50 pointer-events-none grayscale-[30%]' : ''}`}>
            <h4 className="text-gray-400 text-sm mb-6 uppercase tracking-widest flex items-center justify-center gap-2 font-bold">
              {!isMyTurn && <span className="text-[#ff4655] border border-[#ff4655] px-2 py-0.5 rounded">🔒 CHƯA TỚI LƯỢT CHỌN CỦA ĐỘI BẠN</span>} 
              {isMapVeto ? 'DANH SÁCH BẢN ĐỒ (MAP POOL)' : 'DANH SÁCH ĐẶC VỤ'}
            </h4>
            
            {currentMapAction?.action === 'PICK_SIDE' ? (
              <div className="flex justify-center gap-8 mt-8">
                <button
                  onMouseEnter={() => setSelectedHover('ATTACK')}
                  onMouseLeave={() => setSelectedHover(null)}
                  onClick={() => setSelectedHover('ATTACK')}
                  className={`w-64 py-8 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${selectedHover === 'ATTACK' ? 'border-red-500 bg-red-500/20' : 'border-gray-700 hover:border-red-500 hover:bg-red-500/10'}`}
                >
                  <span className="text-6xl mb-4">🗡️</span>
                  <span className="text-2xl font-bold font-display uppercase tracking-widest text-red-400">ATTACK (CÔNG)</span>
                </button>
                <button
                  onMouseEnter={() => setSelectedHover('DEFENSE')}
                  onMouseLeave={() => setSelectedHover(null)}
                  onClick={() => setSelectedHover('DEFENSE')}
                  className={`w-64 py-8 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${selectedHover === 'DEFENSE' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-700 hover:border-blue-500 hover:bg-blue-500/10'}`}
                >
                  <span className="text-6xl mb-4">🛡️</span>
                  <span className="text-2xl font-bold font-display uppercase tracking-widest text-blue-400">DEFENSE (THỦ)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                {POOL_DATA.map((item) => {
                   const itemName = isMapVeto ? item : item.name;
                   const isSelected = selectedHover === itemName;
                   
                   const status = isMapVeto ? mapStatus(itemName) : agentStatus(itemName);
                   const disabled = status === 'BANNED' || status === 'PICKED' || status === 'PICKED_BY_ME' || !isMyTurn;
                   const label = status === 'BANNED' ? 'BỊ CẤM' : (status === 'PICKED' || status === 'PICKED_BY_ME') ? 'ĐÃ CHỌN' : '';
                   
                   if (isMapVeto) {
                     return (
                        <button key={itemName}
                          onClick={() => !disabled && setSelectedHover(itemName)}
                          disabled={disabled}
                          className={`relative w-32 h-20 bg-[#0a1118] border-2 flex items-center justify-center rounded overflow-hidden group transition-all duration-200 ${isSelected ? 'border-[#ff4655] scale-110 z-10 shadow-[0_0_15px_rgba(255,70,85,0.5)]' : disabled ? 'border-gray-800 bg-gray-900/80 cursor-not-allowed' : 'border-gray-600 hover:border-gray-400'}`}>
                            <span className="font-display font-bold tracking-widest text-lg transition-transform">{itemName}</span>
                            {label && <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] uppercase tracking-[0.2em] font-bold text-white py-1">{label}</div>}
                        </button>
                     );
                   } else {
                     return (
                        <button key={itemName}
                          onClick={() => !disabled && setSelectedHover(itemName)}
                          disabled={disabled}
                          className={`relative w-20 h-20 md:w-24 md:h-24 bg-[#0a1118] border-2 flex items-center justify-center rounded overflow-hidden group transition-all duration-200 ${isSelected ? 'border-[#ff4655] scale-110 z-10 shadow-[0_0_15px_rgba(255,70,85,0.5)]' : 'border-transparent hover:border-gray-400'} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}> 
                          <AgentImage agentName={itemName} className="group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1 pt-4 text-center">
                             <span className={`text-[10px] font-bold tracking-wider ${item.role === 'Duelist' ? 'text-red-300' : item.role === 'Controller' ? 'text-purple-300' : item.role === 'Initiator' ? 'text-green-300' : 'text-yellow-300'}`}>{itemName}</span>
                          </div>
                          {label && <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"><span className="text-white text-[10px] font-bold tracking-widest uppercase border border-gray-500 bg-black/50 px-1 py-0.5 rounded">{label}</span></div>}
                        </button>
                     );
                   }
                })}
              </div>
            )}

            <button onClick={handleLockSelection} className={`mt-10 px-16 py-4 font-bold tracking-widest rounded uppercase transition-all duration-300 shadow-lg
              ${selectedHover ? 'bg-[#ff4655] text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(255,70,85,0.6)] cursor-pointer' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}>
              {selectedHover ? `KHÓA: ${selectedHover}` : `VUI LÒNG CHỌN ${isMapVeto ? 'MAP' : 'TƯỚNG'}`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Lobby;
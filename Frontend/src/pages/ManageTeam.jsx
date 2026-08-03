import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { Shield, Check, X, UserMinus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TactileButton from '../components/common/TactileButton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function ManageTeam({ currentUser: propUser }) {
  const { currentUser: authUser } = useAuth();
  const currentUser = propUser || authUser;

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchManagedTeams = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await teamService.getTeamsByCaptain(currentUser.id);
      if (res.success) {
        setTeams(res.data || []);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách đội tuyển đang quản lý');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagedTeams();
  }, [currentUser]);

  const handleAction = async (action, teamId, memberId) => {
    setError('');
    setSuccess('');
    try {
      let res;
      if (action === 'approve') {
        res = await teamService.approveJoinRequest(teamId, memberId, currentUser.id);
      } else if (action === 'reject') {
        res = await teamService.rejectJoinRequest(teamId, memberId, currentUser.id);
      } else if (action === 'kick') {
        if (!window.confirm('Bạn có chắc chắn muốn kích thành viên này khỏi đội?')) return;
        res = await teamService.kickMember(teamId, memberId, currentUser.id);
      }

      if (res && res.success) {
        setSuccess(res.message || 'Thao tác thành công!');
        fetchManagedTeams();
      } else if (res) {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi thực hiện thao tác');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-12">
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12 text-center animate-fade-in">
        <div className="bg-surface-charcoal border border-outline-variant p-12 clip-corner">
          <Shield size={48} className="text-tactical-gray mx-auto mb-4" />
          <h2 className="font-display text-2xl text-off-white uppercase mb-2">VUI LÒNG ĐĂNG NHẬP</h2>
          <p className="font-mono text-sm text-tactical-gray">Bạn cần đăng nhập để xem các đội tuyển đang quản lý.</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12 text-center animate-fade-in">
        <div className="bg-surface-charcoal border border-outline-variant p-12 clip-corner">
          <Shield size={48} className="text-tactical-gray mx-auto mb-4" />
          <h2 className="font-display text-2xl text-off-white uppercase mb-2">BẠN CHƯA QUẢN LÝ ĐỘI NÀO</h2>
          <p className="font-mono text-sm text-tactical-gray">Hãy đăng ký tham gia giải đấu với vai trò Đội Trưởng để bắt đầu quản lý đội.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 animate-fade-in">
      <div className="mb-10 border-b border-outline-variant pb-6">
        <h2 className="font-display text-4xl text-off-white uppercase">QUẢN LÝ ĐỘI TUYỂN</h2>
        <p className="font-mono text-xs text-tactical-gray mt-2">// DUYỆT THÀNH VIÊN VÀ QUẢN LÝ ĐỘI HÌNH THI ĐẤU</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-primary-red/10 border border-primary-red text-primary-red font-mono text-xs uppercase">
          // Lỗi: {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-success-cyan/10 border border-success-cyan text-success-cyan font-mono text-xs uppercase">
          // {success}
        </div>
      )}

      <div className="space-y-8">
        {teams.map(team => {
          const approvedMembers = team.members ? team.members.filter(m => (m.status === 'APPROVED' || m.status === 'ACCEPTED') && m.username !== team.captainUsername && m.userId !== team.captainId) : [];
          const pendingMembers = team.members ? team.members.filter(m => (m.status === 'PENDING' || m.status === 'INVITED') && m.username !== team.captainUsername && m.userId !== team.captainId) : [];
          const totalMembers = 1 + approvedMembers.length;

          return (
            <div key={team.id} className="bg-surface-charcoal border border-outline-variant clip-corner-top overflow-hidden">
              <div className="bg-surface-bright px-6 py-4 flex justify-between items-center border-b border-outline-variant">
                <div className="flex items-center gap-4">
                  <Shield size={28} className="text-primary-red" />
                  <div>
                    <h3 className="font-display text-2xl text-off-white uppercase">{team.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-xs text-tactical-gray uppercase">TAG: #{team.tag}</span>
                      {team.inviteCode && (
                        <span className="font-mono text-[10px] text-success-cyan bg-success-cyan/10 border border-success-cyan/30 px-2 py-0.5 uppercase font-bold">
                          MÃ MỜI: {team.inviteCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div>
                    <span className="font-mono text-xs text-tactical-gray uppercase block mb-1">SĨ SỐ THÀNH VIÊN</span>
                    <span className={`font-display text-xl ${totalMembers >= 7 ? 'text-primary-red' : 'text-success-cyan'}`}>
                      {totalMembers} / 7
                    </span>
                  </div>
                  {team.inviteCode && (
                    <button
                      onClick={() => {
                        const inviteUrl = `${window.location.origin}/join-team?code=${team.inviteCode}`;
                        navigator.clipboard.writeText(inviteUrl);
                        alert(`Đã sao chép link mời tham gia đội ${team.name}:\n\n${inviteUrl}`);
                      }}
                      className="font-mono text-[10px] bg-primary-red/10 hover:bg-primary-red text-primary-red hover:text-off-white border border-primary-red/40 px-3 py-1.5 transition-colors uppercase font-bold tracking-wider flex items-center gap-1.5"
                    >
                      🔗 COPIED LINK MỜI THAM GIA
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Mời Thành Viên Mới & Yêu cầu chờ duyệt */}
                <div className="space-y-6">
                  {/* Form Mời */}
                  <div className="bg-background border border-outline-variant p-4 clip-corner">
                    <h4 className="font-mono text-xs text-primary-red uppercase font-bold mb-3 flex items-center gap-1.5">
                      <UserMinus className="rotate-180" size={16} /> MỜI THÀNH VIÊN VÀO ĐỘI
                    </h4>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const usernameOrEmail = formData.get('usernameOrEmail');
                      const inGameName = formData.get('inGameName');
                      if (!usernameOrEmail) return;
                      try {
                        setError(''); setSuccess('');
                        const res = await teamService.inviteMember(team.id, currentUser.id, usernameOrEmail, inGameName);
                        if (res.success) {
                          setSuccess(res.message || 'Mời thành viên thành công!');
                          e.target.reset();
                          fetchManagedTeams();
                        } else {
                          setError(res.message);
                        }
                      } catch (err) {
                        setError(err.response?.data?.message || 'Không thể mời thành viên này');
                      }
                    }} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          name="usernameOrEmail"
                          placeholder="Username hoặc Email người chơi..."
                          required
                          className="w-full bg-surface-charcoal border border-outline-variant px-3 py-2 text-xs text-off-white focus:border-primary-red outline-none font-mono"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="inGameName"
                          placeholder="In-Game Name (Ví dụ: TenZ#NA1)..."
                          className="w-full bg-surface-charcoal border border-outline-variant px-3 py-2 text-xs text-off-white focus:border-primary-red outline-none font-mono"
                        />
                      </div>
                      <TactileButton variant="primary" size="sm" type="submit" disabled={totalMembers >= 7} className="w-full justify-center">
                        GỬI LỜI MỜI
                      </TactileButton>
                    </form>
                  </div>

                  {/* Yêu cầu chờ duyệt */}
                  <div>
                    <h4 className="font-mono text-sm text-warning-amber uppercase border-b border-outline-variant pb-2 mb-4 flex items-center gap-2 font-bold">
                      <AlertTriangle size={16} /> YÊU CẦU CHỜ DUYỆT ({pendingMembers.length})
                    </h4>
                    {pendingMembers.length === 0 ? (
                      <p className="font-mono text-xs text-tactical-gray py-2">Không có yêu cầu tham gia mới.</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingMembers.map(req => (
                          <div key={req.id} className="bg-background border border-outline-variant p-3 flex justify-between items-center">
                            <div>
                              <span className="font-body text-sm font-semibold text-off-white">@{req.username}</span>
                              {req.inGameName && (
                                <p className="font-mono text-[10px] text-success-cyan">IGN: {req.inGameName}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <TactileButton
                                variant="cyan"
                                size="sm"
                                onClick={() => handleAction('approve', team.id, req.id)}
                                disabled={totalMembers >= 7}
                                className="flex items-center gap-1"
                              >
                                <Check size={14} /> DUYỆT
                              </TactileButton>
                              <TactileButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction('reject', team.id, req.id)}
                                className="flex items-center gap-1"
                              >
                                <X size={14} /> TỪ CHỐI
                              </TactileButton>
                            </div>
                              <X size={14} /> TỪ CHỐI
                            </TactileButton>
>>>>>>> origin/tminh
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Danh sách thành viên chính thức */}
                <div>
                  <h4 className="font-mono text-sm text-success-cyan uppercase border-b border-outline-variant pb-2 mb-4 font-bold">
                    THÀNH VIÊN CHÍNH THỨC ({totalMembers})
                  </h4>
                  <div className="space-y-3">
                    {/* Captain */}
                    <div className="bg-background border border-primary-red/30 p-3 flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary-red"></div>
                      <span className="font-body text-sm font-semibold text-off-white pl-2">@{team.captainUsername}</span>
                      <span className="font-mono text-[10px] bg-primary-red/20 text-primary-red border border-primary-red/30 px-2 py-0.5 uppercase font-bold">
                        👑 CAPTAIN
                      </span>
                    </div>

                    {/* Members */}
                    {approvedMembers.map(member => (
                      <div key={member.id} className="bg-background border border-outline-variant p-3 flex justify-between items-center">
                        <div>
                          <span className="font-body text-sm text-off-white">@{member.username}</span>
                          {member.inGameName && (
                            <p className="font-mono text-[10px] text-tactical-gray">IGN: {member.inGameName}</p>
                          )}
                        </div>
                        <TactileButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleAction('kick', team.id, member.id)}
                          className="flex items-center gap-1"
                        >
                          <UserMinus size={14} /> KICK
                        </TactileButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

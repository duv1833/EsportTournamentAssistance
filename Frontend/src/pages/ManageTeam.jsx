import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { Shield, Check, X, UserMinus, AlertTriangle } from 'lucide-react';

function TactileButton({ children, className = '', ...props }) {
  return (
    <button
      className={`transition-all active:scale-[0.97] active:-translate-y-[0.5px] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function ManageTeam({ currentUser }) {
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
        setTeams(res.data);
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
        setSuccess(res.message);
        fetchManagedTeams();
      } else if (res) {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi thực hiện thao tác');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-off-white font-mono">ĐANG TẢI THÔNG TIN...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12 text-center">
        <div className="bg-surface-charcoal border border-outline-variant p-12">
          <Shield size={48} className="text-tactical-gray mx-auto mb-4" />
          <h2 className="font-display text-2xl text-off-white uppercase mb-2">BẠN CHƯA QUẢN LÝ ĐỘI NÀO</h2>
          <p className="font-mono text-sm text-tactical-gray">Hãy tạo đội tuyển và đăng ký giải đấu để bắt đầu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 border-b border-outline-variant pb-6">
        <h2 className="font-display text-4xl text-off-white uppercase">QUẢN LÝ ĐỘI TUYỂN</h2>
        <p className="font-mono text-xs text-tactical-gray mt-2">DUYỆT THÀNH VIÊN VÀ QUẢN LÝ ĐỘI HÌNH</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-primary-red/10 border border-primary-red text-primary-red font-mono text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-success-cyan/10 border border-success-cyan text-success-cyan font-mono text-sm">
          {success}
        </div>
      )}

      <div className="space-y-8">
        {teams.map(team => {
          const approvedMembers = team.members.filter(m => m.status === 'APPROVED');
          const pendingMembers = team.members.filter(m => m.status === 'PENDING');
          const totalMembers = 1 + approvedMembers.length; // Captain + approved

          return (
            <div key={team.id} className="bg-surface-charcoal border border-outline-variant clip-corner-top overflow-hidden">
              <div className="bg-surface-bright px-6 py-4 flex justify-between items-center border-b border-outline-variant">
                <div className="flex items-center gap-4">
                  <Shield size={28} className="text-primary-red" />
                  <div>
                    <h3 className="font-display text-2xl text-off-white uppercase">{team.name}</h3>
                    <span className="font-mono text-xs text-tactical-gray uppercase">TAG: #{team.tag}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-tactical-gray uppercase block mb-1">SĨ SỐ</span>
                  <span className={`font-display text-xl ${totalMembers >= 7 ? 'text-primary-red' : 'text-success-cyan'}`}>
                    {totalMembers} / 7
                  </span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Yêu cầu chờ duyệt */}
                <div>
                  <h4 className="font-mono text-sm text-warning-amber uppercase border-b border-outline-variant pb-2 mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} /> YÊU CẦU CHỜ DUYỆT ({pendingMembers.length})
                  </h4>
                  {pendingMembers.length === 0 ? (
                    <p className="font-mono text-xs text-tactical-gray">Không có yêu cầu nào.</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingMembers.map(req => (
                        <div key={req.id} className="bg-background border border-outline-variant p-3 flex justify-between items-center">
                          <span className="font-body text-sm text-off-white">{req.username}</span>
                          <div className="flex gap-2">
                            <TactileButton
                              onClick={() => handleAction('approve', team.id, req.id)}
                              disabled={totalMembers >= 7}
                              className="bg-success-cyan hover:bg-success-cyan/80 text-background px-3 py-1.5 flex items-center gap-1 font-mono text-xs uppercase disabled:opacity-50"
                            >
                              <Check size={14} /> DUYỆT
                            </TactileButton>
                            <TactileButton
                              onClick={() => handleAction('reject', team.id, req.id)}
                              className="bg-surface-charcoal border border-outline-variant hover:border-primary-red text-off-white px-3 py-1.5 flex items-center gap-1 font-mono text-xs uppercase"
                            >
                              <X size={14} /> TỪ CHỐI
                            </TactileButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Danh sách thành viên chính thức */}
                <div>
                  <h4 className="font-mono text-sm text-success-cyan uppercase border-b border-outline-variant pb-2 mb-4">
                    THÀNH VIÊN CHÍNH THỨC
                  </h4>
                  <div className="space-y-3">
                    {/* Captain */}
                    <div className="bg-background border border-primary-red/30 p-3 flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary-red"></div>
                      <span className="font-body text-sm text-off-white pl-2">{team.captainUsername}</span>
                      <span className="font-mono text-[10px] bg-primary-red/20 text-primary-red px-2 py-0.5 uppercase">CAPTAIN</span>
                    </div>
                    {/* Members */}
                    {approvedMembers.map(member => (
                      <div key={member.id} className="bg-background border border-outline-variant p-3 flex justify-between items-center">
                        <span className="font-body text-sm text-off-white">{member.username}</span>
                        <TactileButton
                          onClick={() => handleAction('kick', team.id, member.id)}
                          className="text-tactical-gray hover:text-primary-red font-mono text-xs flex items-center gap-1 uppercase transition-colors"
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

import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { Shield, ArrowRight, Check, Search, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TactileButton from '../components/common/TactileButton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Teams({ currentUser: propUser, onJoinTeam }) {
  const { currentUser: authUser } = useAuth();
  const currentUser = propUser || authUser;

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamService.getAllTeams();
      if (res.success) {
        setTeams(res.data || []);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách đội tuyển');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleJoinClick = (teamId) => {
    if (!currentUser) {
      setError('Bạn cần đăng nhập để xin gia nhập đội!');
      return;
    }
    if (onJoinTeam) {
      onJoinTeam(teamId);
    } else {
      handleJoinTeamDirect(teamId);
    }
  };

  const handleJoinTeamDirect = async (teamId) => {
    setError('');
    setSuccess('');
    try {
      const res = await teamService.joinTeam(teamId, currentUser.id);
      if (res.success) {
        setSuccess('Đã gửi yêu cầu tham gia đội tuyển!');
        fetchTeams();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu tham gia');
    }
  };

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.tag && t.tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.captainUsername && t.captainUsername.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12 animate-fade-in">
      <div className="mb-10 border-b border-outline-variant pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display text-4xl text-off-white uppercase">DANH SÁCH ĐỘI TUYỂN</h2>
          <p className="font-mono text-xs text-tactical-gray mt-2">// TÌM VÀ GIA NHẬP ĐỘI TUYỂN ĐỂ THAM GIA GIẢI ĐẤU</p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tactical-gray" />
          <input
            type="text"
            placeholder="Tìm tên đội, Tag hoặc Captain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-charcoal border border-outline-variant pl-9 pr-3 py-2 text-off-white font-body text-xs focus:outline-none focus:border-primary-red"
          />
        </div>
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

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Không tìm thấy đội tuyển"
          desc={searchTerm ? `Không có đội tuyển nào phù hợp với từ khóa "${searchTerm}".` : "Chưa có đội tuyển nào được khởi tạo trên hệ thống."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            const isCaptain = currentUser && team.captainId === currentUser.id;
            const isMember = currentUser && team.members?.some(m => m.userId === currentUser.id && (m.status === 'APPROVED' || m.status === 'ACCEPTED'));
            const hasRequested = currentUser && team.members?.some(m => m.userId === currentUser.id && (m.status === 'PENDING' || m.status === 'INVITED'));
            const approvedMemberCount = 1 + (team.members ? team.members.filter(m => m.status === 'APPROVED' || m.status === 'ACCEPTED').length : 0);

            return (
              <div key={team.id} className="bg-surface-charcoal border border-outline-variant p-6 flex flex-col clip-corner-top hover:border-primary-red transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-surface-bright flex items-center justify-center border border-outline-variant overflow-hidden shrink-0">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <Shield size={24} className="text-tactical-gray" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-2xl text-off-white uppercase truncate">{team.name}</h3>
                    <span className="font-mono text-xs bg-surface-bright px-2 py-0.5 text-off-white/70">#{team.tag}</span>
                  </div>
                </div>

                <div className="mb-6 flex-grow space-y-3 border-t border-b border-outline-variant/30 py-3">
                  <div>
                    <p className="font-mono text-[10px] text-tactical-gray uppercase mb-0.5">ĐỘI TRƯỞNG:</p>
                    <p className="font-body text-sm font-semibold text-success-cyan">@{team.captainUsername}</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center font-mono text-[10px] text-tactical-gray mb-1">
                      <span>SĨ SỐ THÀNH VIÊN:</span>
                      <span className="text-off-white font-bold">{approvedMemberCount} / 7</span>
                    </div>
                    {/* Member capacity bar */}
                    <div className="w-full bg-background h-1.5 rounded-full overflow-hidden border border-outline-variant/40">
                      <div
                        className="bg-primary-red h-full transition-all"
                        style={{ width: `${(approvedMemberCount / 7) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  {isCaptain ? (
                    <span className="font-mono text-xs text-primary-red uppercase flex items-center justify-center gap-2 py-2 border border-primary-red/30 bg-primary-red/10">
                      <Check size={14} /> BẠN LÀ ĐỘI TRƯỞNG
                    </span>
                  ) : isMember ? (
                    <span className="font-mono text-xs text-success-cyan uppercase flex items-center justify-center gap-2 py-2 border border-success-cyan/30 bg-success-cyan/10">
                      <Check size={14} /> ĐÃ THAM GIA
                    </span>
                  ) : hasRequested ? (
                    <span className="font-mono text-xs text-warning-amber uppercase flex items-center justify-center gap-2 py-2 border border-warning-amber/30 bg-warning-amber/10">
                      ⏳ ĐANG CHỜ DUYỆT
                    </span>
                  ) : (
                    <TactileButton
                      variant="primary"
                      onClick={() => handleJoinClick(team.id)}
                      className="w-full justify-center flex items-center gap-2"
                    >
                      XIN GIA NHẬP <ArrowRight size={14} />
                    </TactileButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

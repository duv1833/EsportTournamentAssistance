import React, { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import { Shield, ArrowRight, Check } from 'lucide-react';

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

export default function Teams({ currentUser }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamService.getAllTeams();
      if (res.success) {
        setTeams(res.data);
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

  const handleJoinTeam = async (teamId) => {
    if (!currentUser) {
      setError('Bạn cần đăng nhập để xin gia nhập đội!');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await teamService.joinTeam(teamId, currentUser.id);
      if (res.success) {
        setSuccess('Đã gửi yêu cầu tham gia đội tuyển!');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu tham gia');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-off-white font-mono">ĐANG TẢI DANH SÁCH ĐỘI TUYỂN...</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 border-b border-outline-variant pb-6 flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl text-off-white uppercase">DANH SÁCH ĐỘI TUYỂN</h2>
          <p className="font-mono text-xs text-tactical-gray mt-2">TÌM VÀ GIA NHẬP ĐỘI TUYỂN ĐỂ THAM GIA GIẢI ĐẤU</p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          // Check if current user is already a member (approved or pending) or captain
          const isCaptain = currentUser && team.captainId === currentUser.id;
          const isMember = currentUser && team.members.some(m => m.userId === currentUser.id);
          const hasRequested = currentUser && team.members.some(m => m.userId === currentUser.id && m.status === 'PENDING');

          return (
            <div key={team.id} className="bg-surface-charcoal border border-outline-variant p-6 flex flex-col clip-corner-top hover:border-primary-red transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-surface-bright flex items-center justify-center border border-outline-variant">
                  <Shield size={24} className="text-tactical-gray" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-off-white uppercase">{team.name}</h3>
                  <span className="font-mono text-xs bg-surface-bright px-2 py-0.5 text-off-white/70">#{team.tag}</span>
                </div>
              </div>
              
              <div className="mb-6 flex-grow">
                <p className="font-mono text-xs text-tactical-gray uppercase mb-1">ĐỘI TRƯỞNG:</p>
                <p className="font-body text-sm text-off-white">{team.captainUsername}</p>
                
                <p className="font-mono text-xs text-tactical-gray uppercase mb-1 mt-4">SỐ THÀNH VIÊN:</p>
                <p className="font-body text-sm text-off-white">
                  {1 + team.members.filter(m => m.status === 'APPROVED').length} / 7
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-outline-variant">
                {isCaptain ? (
                  <span className="font-mono text-xs text-primary-red uppercase flex items-center gap-2">
                    <Check size={14} /> BẠN LÀ ĐỘI TRƯỞNG
                  </span>
                ) : isMember ? (
                  hasRequested ? (
                    <span className="font-mono text-xs text-warning-amber uppercase">ĐANG CHỜ DUYỆT</span>
                  ) : (
                    <span className="font-mono text-xs text-success-cyan uppercase flex items-center gap-2">
                      <Check size={14} /> ĐÃ THAM GIA
                    </span>
                  )
                ) : (
                  <TactileButton
                    onClick={() => handleJoinTeam(team.id)}
                    className="w-full bg-primary-red hover:bg-primary-red/90 text-off-white font-mono text-sm py-2.5 uppercase flex justify-center items-center gap-2"
                  >
                    XIN GIA NHẬP <ArrowRight size={14} />
                  </TactileButton>
                )}
              </div>
            </div>
          );
        })}
        {teams.length === 0 && (
          <div className="col-span-full text-center py-10 font-mono text-tactical-gray">
            CHƯA CÓ ĐỘI TUYỂN NÀO TRÊN HỆ THỐNG
          </div>
        )}
      </div>
    </div>
  );
}

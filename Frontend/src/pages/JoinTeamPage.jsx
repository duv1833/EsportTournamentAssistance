import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import { Shield, UserPlus, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import TactileButton from '../components/common/TactileButton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function JoinTeamPage() {
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [team, setTeam] = useState(null);
  const [inGameName, setInGameName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (inviteCode) {
      fetchTeamByCode(inviteCode);
    } else {
      setLoading(false);
    }
  }, [inviteCode]);

  const fetchTeamByCode = async (code) => {
    setLoading(true);
    setError('');
    try {
      const res = await teamService.getTeamByInviteCode(code);
      if (res.success) {
        setTeam(res.data);
      } else {
        setError(res.message || 'Mã mời không tồn tại!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã mời đội tuyển không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate(`/login?redirect=/join-team?code=${inviteCode}`);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await teamService.joinTeamByInviteCode(inviteCode, currentUser.id, inGameName);
      if (res.success) {
        setSuccess('Đã gửi yêu cầu tham gia đội tuyển thành công! Vui lòng chờ Đội trưởng duyệt.');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu tham gia đội');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-md px-6 py-16">
        <LoadingSkeleton type="card" count={1} />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-6 py-16 animate-fade-in">
      <Link to="/tournaments" className="inline-flex items-center gap-1 font-mono text-xs text-tactical-gray hover:text-off-white mb-6 uppercase tracking-wider">
        <ArrowLeft size={14} /> Trở về danh sách giải
      </Link>

      <div className="bg-surface-charcoal border border-outline-variant p-8 clip-corner shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 border-b border-outline-variant/60 pb-6 mb-6">
          <div className="w-14 h-14 bg-surface-bright border border-outline-variant flex items-center justify-center shrink-0">
            <Shield size={32} className="text-primary-red" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-success-cyan uppercase font-bold tracking-widest">// LỜI MỜI THAM GIA ĐỘI TUYỂN</span>
            <h2 className="font-display text-3xl text-off-white uppercase leading-none mt-1">
              {team ? team.name : 'MÃ MỜI KHÔNG HỢP LỆ'}
            </h2>
            {team && <span className="font-mono text-xs text-tactical-gray uppercase">TAG: #{team.tag}</span>}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-primary-red/10 border border-primary-red text-primary-red font-mono text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>// LỖI: {error}</div>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-success-cyan/10 border border-success-cyan text-success-cyan text-center space-y-4">
            <CheckCircle2 size={48} className="mx-auto text-success-cyan animate-bounce" />
            <h3 className="font-display text-xl uppercase font-bold">THAM GIA THÀNH CÔNG</h3>
            <p className="font-mono text-xs text-off-white/80">{success}</p>
            <TactileButton variant="primary" onClick={() => navigate('/profile')} className="w-full justify-center">
              VÀO TRANG CÁ NHÂN
            </TactileButton>
          </div>
        ) : team ? (
          <form onSubmit={handleJoinTeam} className="space-y-5">
            <div className="bg-background/60 p-4 border border-outline-variant/40 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-tactical-gray">Đội Trưởng:</span>
                <span className="text-off-white font-bold">@{team.captainUsername}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-tactical-gray">Thành Viên:</span>
                <span className="text-success-cyan font-bold">{team.members ? team.members.length : 1} / 7 người</span>
              </div>
            </div>

            {!currentUser && (
              <div className="p-3 bg-warning-amber/10 border border-warning-amber/30 text-warning-amber font-mono text-xs">
                // Bạn cần đăng nhập để tham gia đội tuyển này.
              </div>
            )}

            <div>
              <label className="block font-mono text-xs text-tactical-gray uppercase mb-2">Tên Trong Game (In-Game Name / Riot ID)</label>
              <input
                type="text"
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                placeholder="Ví dụ: TenZ#NA1..."
                required
                className="w-full bg-background border border-outline-variant px-4 py-3 text-sm text-off-white focus:border-primary-red outline-none font-mono"
              />
            </div>

            <TactileButton
              variant="primary"
              size="lg"
              type="submit"
              disabled={submitting}
              className="w-full justify-center flex items-center gap-2"
            >
              <UserPlus size={18} /> {currentUser ? 'XÁC NHẬN THAM GIA ĐỘI' : 'ĐĂNG NHẬP ĐỂ THAM GIA'}
            </TactileButton>
          </form>
        ) : (
          <div className="text-center py-6 font-mono text-xs text-tactical-gray space-y-4">
            <p>Vui lòng kiểm tra lại liên kết hoặc xin mã mời mới từ Đội Trưởng.</p>
            <TactileButton variant="outline" onClick={() => navigate('/tournaments')} className="w-full justify-center">
              XEM XEM CÁC GIẢI ĐẤU
            </TactileButton>
          </div>
        )}
      </div>
    </div>
  );
}

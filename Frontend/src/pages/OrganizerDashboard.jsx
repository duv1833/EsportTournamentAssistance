import React, { useState, useEffect } from 'react';
import { getTournamentRegistrations, approveRegistration, rejectRegistration } from '../services/tournamentService';
import TactileButton from '../components/common/TactileButton';
import EmptyState from '../components/common/EmptyState';
import { Users, Mail, Phone, Gamepad2, ArrowLeft, Check, X } from 'lucide-react';

const OrganizerDashboard = ({ tournament, currentUser, onBack }) => {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRegistrations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getTournamentRegistrations(tournament.id, currentUser.id);
      if (res.success) {
        setRegistrations(res.data);
      } else {
        setError(res.message || 'Lỗi khi tải danh sách đăng ký.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi tải danh sách.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tournament && currentUser) {
      fetchRegistrations();
    }
  }, [tournament, currentUser]);

  const handleApprove = async (teamId) => {
    try {
      const res = await approveRegistration(tournament.id, teamId, currentUser.id);
      if (res.success) {
        setSuccess('Duyệt đội tuyển thành công!');
        fetchRegistrations();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(res.message || 'Duyệt thất bại.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi duyệt.');
    }
  };

  const handleReject = async (teamId) => {
    try {
      const res = await rejectRegistration(tournament.id, teamId, currentUser.id);
      if (res.success) {
        setSuccess('Từ chối đội tuyển thành công!');
        fetchRegistrations();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(res.message || 'Từ chối thất bại.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi từ chối.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-surface-charcoal border border-outline-variant p-8 clip-corner">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 border-b border-outline-variant pb-6">
        <div>
          <h3 className="font-display text-2xl md:text-3xl text-off-white uppercase flex items-center gap-3">
            <Users className="text-primary-red" size={28} /> Quản lý Đăng Ký
          </h3>
          <p className="font-mono text-sm text-success-cyan uppercase tracking-wider mt-1">// GIẢI ĐẤU: {tournament.name}</p>
        </div>
        <TactileButton
          onClick={onBack}
          className="bg-surface-bright text-off-white font-display text-xs py-2 px-4 flex items-center gap-2 hover:bg-surface-bright/80"
        >
          <ArrowLeft size={14} /> Trở về danh sách giải
        </TactileButton>
      </div>

      {error && (
        <div className="bg-primary-red/10 border border-primary-red text-primary-red p-3 mb-6 text-sm font-mono uppercase">
          // Lỗi: {error}
        </div>
      )}
      {success && (
        <div className="bg-success-cyan/10 border border-success-cyan text-success-cyan p-3 mb-6 text-sm font-mono uppercase">
          // Thành công: {success}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 font-mono text-tactical-gray uppercase animate-pulse">Đang tải dữ liệu...</div>
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có đội đăng ký"
          desc="Hiện tại chưa có đội tuyển nào đăng ký tham gia giải đấu này."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm text-off-white border-collapse">
            <thead>
              <tr className="bg-surface-bright/50 border-y border-outline-variant uppercase font-display text-xs tracking-wider text-tactical-gray">
                <th className="py-3 px-4">Đội Tuyển</th>
                <th className="py-3 px-4">Đội Trưởng</th>
                <th className="py-3 px-4">Liên Hệ</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id} className="border-b border-outline-variant/50 hover:bg-surface-bright/20 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary-red uppercase">[{reg.teamTag}]</span>
                      <span className="font-bold">{reg.teamName}</span>
                    </div>
                    <div className="font-mono text-[10px] text-tactical-gray mt-1">ID: {reg.teamId}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Gamepad2 size={14} className="text-success-cyan" />
                      <span className="font-medium">@{reg.captainUsername}</span>
                    </div>
                    {reg.captainInGameName && (
                      <div className="font-mono text-[10px] text-success-cyan mt-1 pl-6">{reg.captainInGameName}</div>
                    )}
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] text-off-white/70 space-y-1">
                    {reg.captainEmail ? (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-tactical-gray" /> {reg.captainEmail}
                      </div>
                    ) : (
                      <div className="text-tactical-gray italic">Chưa có Email</div>
                    )}
                    {reg.captainPhoneNumber ? (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-tactical-gray" /> {reg.captainPhoneNumber}
                      </div>
                    ) : (
                      <div className="text-tactical-gray italic">Chưa có SĐT</div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-mono text-[10px] px-2 py-1 uppercase font-bold inline-block w-24 text-center ${
                      reg.status === 'APPROVED' ? 'bg-success-cyan/10 text-success-cyan border border-success-cyan/20' :
                      reg.status === 'REJECTED' ? 'bg-primary-red/10 text-primary-red border border-primary-red/20' :
                      'bg-warning-amber/10 text-warning-amber border border-warning-amber/20'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      {reg.status === 'PENDING' && (
                        <>
                          <TactileButton 
                            onClick={() => handleApprove(reg.teamId)}
                            className="bg-success-cyan/10 text-success-cyan border border-success-cyan hover:bg-success-cyan hover:text-background p-1.5"
                            title="Duyệt"
                          >
                            <Check size={16} />
                          </TactileButton>
                          <TactileButton 
                            onClick={() => handleReject(reg.teamId)}
                            className="bg-primary-red/10 text-primary-red border border-primary-red hover:bg-primary-red hover:text-off-white p-1.5"
                            title="Từ chối"
                          >
                            <X size={16} />
                          </TactileButton>
                        </>
                      )}
                      {reg.status !== 'PENDING' && (
                        <span className="font-mono text-xs text-tactical-gray italic">Đã xử lý</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;

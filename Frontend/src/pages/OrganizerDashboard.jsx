import React, { useState, useEffect } from 'react';
import { 
  getTournamentRegistrations, 
  approveRegistration, 
  rejectRegistration, 
  updateTournament,
  getTournamentOrganizers,
  addTournamentOrganizer,
  removeTournamentOrganizer
} from '../services/tournamentService';
import TactileButton from '../components/common/TactileButton';
import EmptyState from '../components/common/EmptyState';
import { Users, Mail, Phone, Gamepad2, ArrowLeft, Check, X, Settings, ShieldCheck, UserPlus, Trash2 } from 'lucide-react';

const OrganizerDashboard = ({ tournament, currentUser, onBack }) => {
  const [registrations, setRegistrations] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrgLoading, setIsOrgLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations', 'edit', 'organizers'
  
  // Add Organizer form state
  const [addOrgQuery, setAddOrgQuery] = useState('');
  const [addOrgRole, setAddOrgRole] = useState('REFEREE');
  const [isAddingOrg, setIsAddingOrg] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: tournament?.name || '',
    maxTeams: tournament?.maxTeams || 16,
    rulesDescription: tournament?.rulesDescription || '',
    format: tournament?.format || 'SINGLE_ELIMINATION',
    structure: tournament?.structure || 'SINGLE_ELIMINATION',
    startDate: tournament?.startDate ? tournament.startDate.split('T')[0] : '',
    endDate: tournament?.endDate ? tournament.endDate.split('T')[0] : '',
    prizePool: tournament?.prizePool || '',
    location: tournament?.location || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

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

  const fetchOrganizers = async () => {
    setIsOrgLoading(true);
    try {
      const res = await getTournamentOrganizers(tournament.id);
      if (res.success) {
        setOrganizers(res.data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách trọng tài/BTC:', err);
    } finally {
      setIsOrgLoading(false);
    }
  };

  useEffect(() => {
    if (tournament && currentUser) {
      fetchRegistrations();
      fetchOrganizers();
    }
  }, [tournament, currentUser]);

  const handleAddOrganizerSubmit = async (e) => {
    e.preventDefault();
    if (!addOrgQuery.trim()) {
      setError('Vui lòng nhập Username hoặc Email của người dùng!');
      return;
    }
    setIsAddingOrg(true);
    setError('');
    setSuccess('');
    try {
      const res = await addTournamentOrganizer(tournament.id, addOrgQuery.trim(), addOrgRole, currentUser.id);
      if (res.success) {
        setSuccess('Đã thêm Trọng tài / BTC thành công!');
        setAddOrgQuery('');
        fetchOrganizers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Thêm thất bại!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi thêm Trọng tài/BTC.');
    } finally {
      setIsAddingOrg(false);
    }
  };

  const handleRemoveOrganizerClick = async (targetUserId, targetDisplayName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn gỡ quyền Trọng tài / BTC của ${targetDisplayName}?`)) return;
    setError('');
    setSuccess('');
    try {
      const res = await removeTournamentOrganizer(tournament.id, targetUserId, currentUser.id);
      if (res.success) {
        setSuccess('Đã gỡ quyền thành công!');
        fetchOrganizers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Gỡ quyền thất bại!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi gỡ quyền.');
    }
  };

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

  const handleUpdateTournament = async (e) => {
    e.preventDefault();
    if (!editForm.name) {
      setError('Tên giải đấu không được để trống!');
      return;
    }
    
    setIsUpdating(true);
    setError('');
    try {
      const res = await updateTournament(
        tournament.id,
        editForm.name,
        editForm.maxTeams,
        editForm.rulesDescription,
        editForm.startDate,
        editForm.endDate,
        editForm.prizePool,
        editForm.location,
        editForm.structure,
        currentUser.id
      );
      if (res.success) {
        setSuccess('Cập nhật thông tin giải đấu thành công!');
        setTimeout(() => setSuccess(''), 3000);
        // Refresh page or trigger callback
      } else {
        setError(res.message || 'Cập nhật thất bại.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi cập nhật giải đấu.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdvanceToKnockout = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn chốt kết quả Vòng Bảng và tạo sơ đồ Tứ kết không? Hành động này không thể hoàn tác.")) return;
    setIsAdvancing(true);
    try {
      const { advanceToKnockout } = await import('../services/tournamentService');
      const res = await advanceToKnockout(tournament.id, currentUser.id);
      if (res.success) {
        setSuccess('Đã chốt danh sách Vòng Bảng và tạo nhánh đấu Tứ kết!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Lỗi khi chia cặp.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi chốt vòng bảng.');
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-surface-charcoal border border-outline-variant p-8 clip-corner">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 border-b border-outline-variant pb-6">
        <div>
          <h3 className="font-display text-2xl md:text-3xl text-off-white uppercase flex items-center gap-3">
            <Users className="text-primary-red" size={28} /> Dashboard Quản Lý
          </h3>
          <p className="font-mono text-sm text-success-cyan uppercase tracking-wider mt-1">// GIẢI ĐẤU: {tournament.name}</p>
        </div>
        <TactileButton
          onClick={onBack}
          className="bg-surface-bright text-off-white font-display text-xs py-2 px-4 flex items-center gap-2 hover:bg-surface-bright/80"
        >
          <ArrowLeft size={14} /> Quay lại
        </TactileButton>
      </div>

      <div className="flex gap-4 mb-6 border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-2 px-2 font-display text-sm uppercase tracking-wider ${activeTab === 'registrations' ? 'text-primary-red border-b-2 border-primary-red' : 'text-off-white/60 hover:text-off-white'}`}
        >
          Quản lý Đội ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab('organizers')}
          className={`pb-2 px-2 font-display text-sm uppercase tracking-wider ${activeTab === 'organizers' ? 'text-primary-red border-b-2 border-primary-red' : 'text-off-white/60 hover:text-off-white'}`}
        >
          Ban Trọng Tài & BTC ({organizers.length})
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`pb-2 px-2 font-display text-sm uppercase tracking-wider ${activeTab === 'edit' ? 'text-primary-red border-b-2 border-primary-red' : 'text-off-white/60 hover:text-off-white'}`}
        >
          Chỉnh sửa thông tin
        </button>
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

      {activeTab === 'registrations' && (
        <>
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
        </>
      )}

      {activeTab === 'organizers' && (
        <div className="space-y-8">
          {/* Form Phân quyền Trọng tài */}
          <div className="bg-background border border-outline-variant p-6 rounded-sm">
            <h4 className="font-display text-lg text-off-white uppercase mb-2 flex items-center gap-2">
              <UserPlus size={20} className="text-primary-red" /> Phân Quyền Trọng Tài / Đồng Ban Tổ Chức
            </h4>
            <p className="font-mono text-xs text-tactical-gray mb-4">
              Nhập Username hoặc Email của người dùng đã đăng ký tài khoản để gán vai trò Trọng tài phụ trách giải đấu này.
            </p>
            <form onSubmit={handleAddOrganizerSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={addOrgQuery}
                onChange={(e) => setAddOrgQuery(e.target.value)}
                placeholder="Nhập Username hoặc Email (VD: referee1 hoặc referee@gmail.com)"
                className="flex-1 bg-surface-charcoal border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                required
              />
              <select
                value={addOrgRole}
                onChange={(e) => setAddOrgRole(e.target.value)}
                className="bg-surface-charcoal border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
              >
                <option value="REFEREE">TRỌNG TÀI (REFEREE)</option>
                <option value="CO_ORGANIZER">ĐỒNG BTC (CO-ORGANIZER)</option>
              </select>
              <TactileButton
                type="submit"
                disabled={isAddingOrg}
                className="bg-primary-red hover:bg-primary-red/90 text-off-white font-mono text-xs py-3 px-6 uppercase font-bold tracking-wider disabled:opacity-50"
              >
                {isAddingOrg ? 'Đang thêm...' : 'Gán quyền'}
              </TactileButton>
            </form>
          </div>

          {/* Danh sách Trọng tài & BTC */}
          <div>
            <h4 className="font-display text-lg text-off-white uppercase mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-success-cyan" /> Danh Sách Ban Trọng Tài & BTC Hiện Tại ({organizers.length})
            </h4>
            
            {isOrgLoading ? (
              <div className="text-center py-8 font-mono text-tactical-gray uppercase animate-pulse">Đang tải danh sách...</div>
            ) : organizers.length === 0 ? (
              <div className="bg-background border border-outline-variant p-6 text-center text-sm font-mono text-tactical-gray">
                Chưa có Trọng tài nào được gán cho giải đấu này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizers.map(org => {
                  const isOwner = org.role === 'OWNER' || org.userId === tournament.creatorId;
                  return (
                    <div key={org.id} className="bg-background border border-outline-variant p-4 flex flex-col justify-between rounded-sm">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="font-body text-sm font-bold text-white flex items-center gap-2">
                            {org.displayName}
                            <span className="text-[11px] font-mono text-[#a0a0a0]">(@{org.username})</span>
                          </div>
                          <div className="font-mono text-xs text-tactical-gray mt-0.5">{org.email}</div>
                        </div>
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          org.role === 'OWNER' ? 'bg-primary-red/20 text-primary-red border border-primary-red/30' :
                          org.role === 'REFEREE' ? 'bg-success-cyan/20 text-success-cyan border border-success-cyan/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {org.role === 'OWNER' ? '👑 OWNER' : org.role === 'REFEREE' ? '⚖️ REFEREE' : '🛡️ CO-ORGANIZER'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-outline-variant/50 pt-3 mt-2 text-[11px] text-tactical-gray">
                        <span>Gán bởi: {org.assignedByUsername || 'Chủ giải'}</span>
                        {!isOwner && currentUser && (
                          <button
                            onClick={() => handleRemoveOrganizerClick(org.userId, org.displayName)}
                            className="text-primary-red hover:text-red-400 font-mono text-xs flex items-center gap-1 font-bold uppercase transition-colors"
                          >
                            <Trash2 size={12} /> Gỡ quyền
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <form onSubmit={handleUpdateTournament} className="space-y-6 max-w-2xl">
          <div>
            <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Tên giải đấu</label>
            <input
              type="text"
              className="w-full bg-background border border-outline-variant p-3 text-off-white font-display text-sm focus:outline-none focus:border-primary-red"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Số lượng đội tối đa</label>
              <select
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                value={editForm.maxTeams}
                onChange={(e) => setEditForm({ ...editForm, maxTeams: parseInt(e.target.value) })}
              >
                <option value={4}>4 Đội</option>
                <option value={8}>8 Đội</option>
                <option value={16}>16 Đội</option>
                <option value={32}>32 Đội</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Thể thức thi đấu</label>
              <select
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                value={editForm.structure}
                onChange={(e) => setEditForm({ ...editForm, structure: e.target.value })}
              >
                <option value="SINGLE_ELIMINATION">Loại Trực Tiếp (Single Elimination)</option>
                <option value="GROUP_KNOCKOUT">Vòng Bảng + Nhánh Đấu (Group Stage & Knockout)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Quy định / Mô tả</label>
            <textarea
              rows={5}
              className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
              value={editForm.rulesDescription}
              onChange={(e) => setEditForm({ ...editForm, rulesDescription: e.target.value })}
              placeholder="Nhập luật thi đấu và thông tin chi tiết..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Ngày bắt đầu</label>
              <input
                type="date"
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red [color-scheme:dark]"
                value={editForm.startDate}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Ngày kết thúc</label>
              <input
                type="date"
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red [color-scheme:dark]"
                value={editForm.endDate}
                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Giải thưởng</label>
              <input
                type="text"
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                placeholder="VD: $250,000"
                value={editForm.prizePool}
                onChange={(e) => setEditForm({ ...editForm, prizePool: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Địa điểm</label>
              <input
                type="text"
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                placeholder="VD: BR São Paulo"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant flex justify-between">
            {tournament.structure === 'GROUP_KNOCKOUT' ? (
              <TactileButton
                type="button"
                disabled={isAdvancing}
                onClick={handleAdvanceToKnockout}
                className="bg-warning-amber/10 text-warning-amber border border-warning-amber font-display text-sm py-3 px-6 uppercase font-bold hover:bg-warning-amber hover:text-background disabled:opacity-50"
              >
                {isAdvancing ? 'Đang xử lý...' : 'Chốt Vòng Bảng & Tạo Tứ Kết'}
              </TactileButton>
            ) : (
              <div></div>
            )}
            <TactileButton
              type="submit"
              disabled={isUpdating}
              className="bg-primary-red text-off-white font-display text-sm py-3 px-8 uppercase font-bold hover:brightness-110 disabled:opacity-50"
            >
              {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </TactileButton>
          </div>
        </form>
      )}
    </div>
  );
};

export default OrganizerDashboard;

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Search, Filter, AlertCircle, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { getAdminTournaments, approveTournament, rejectTournament, updateTournamentByAdmin, deleteTournamentByAdmin } from '../services/tournamentService';
import TactileButton from '../components/common/TactileButton';
import EmptyState from '../components/common/EmptyState';

export default function AdminTournamentManagement({ currentUser }) {
  const [tournaments, setTournaments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, APPROVED
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [editModal, setEditModal] = useState({
    isOpen: false,
    tournament: null,
    name: '',
    maxTeams: 16,
    rulesDescription: ''
  });

  const fetchTournaments = async () => {
    if (!currentUser || currentUser.globalRole !== 'ADMIN') return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await getAdminTournaments(currentUser.id);
      if (res.success) {
        setTournaments(res.data);
      } else {
        setErrorMessage(res.message || 'Không thể tải danh sách giải đấu');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Lỗi hệ thống khi tải danh sách giải đấu!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [currentUser]);

  const handleApprove = async (id) => {
    if (!currentUser) return;
    setActionLoadingId(id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await approveTournament(id, currentUser.id);
      if (res.success) {
        setSuccessMessage(`Đã phê duyệt thành công giải đấu ID #${id}!`);
        await fetchTournaments();
      } else {
        setErrorMessage(res.message || 'Duyệt giải đấu thất bại');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi khi phê duyệt giải đấu');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!currentUser) return;
    if (!window.confirm(`Từ chối giải đấu ID #${id} sẽ xóa giải đấu khỏi danh sách. Bạn có chắc chắn không?`)) return;
    
    setActionLoadingId(id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await rejectTournament(id, currentUser.id);
      if (res.success) {
        setSuccessMessage(`Đã từ chối và xóa giải đấu ID #${id} khỏi hệ thống!`);
        await fetchTournaments();
      } else {
        setErrorMessage(res.message || 'Từ chối giải đấu thất bại');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi khi từ chối giải đấu');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!currentUser) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hoàn toàn giải đấu ID #${id} khỏi hệ thống?`)) return;

    setActionLoadingId(id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await deleteTournamentByAdmin(id, currentUser.id);
      if (res.success) {
        setSuccessMessage(`Đã xóa thành công giải đấu ID #${id}!`);
        await fetchTournaments();
      } else {
        setErrorMessage(res.message || 'Xóa giải đấu thất bại');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi khi xóa giải đấu');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openEditModal = (tournament) => {
    setEditModal({
      isOpen: true,
      tournament,
      name: tournament.name || '',
      maxTeams: tournament.maxTeams || 16,
      rulesDescription: tournament.rulesDescription || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !editModal.tournament) return;

    setActionLoadingId(editModal.tournament.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await updateTournamentByAdmin(
        editModal.tournament.id,
        {
          name: editModal.name,
          maxTeams: editModal.maxTeams,
          rulesDescription: editModal.rulesDescription
        },
        currentUser.id
      );
      if (res.success) {
        setSuccessMessage(`Đã cập nhật thành công giải đấu ID #${editModal.tournament.id}!`);
        setEditModal({ ...editModal, isOpen: false });
        await fetchTournaments();
      } else {
        setErrorMessage(res.message || 'Cập nhật giải đấu thất bại');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Lỗi hệ thống khi cập nhật giải đấu!');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTournaments = tournaments.filter((t) => {
    const matchesStatus = filterStatus === 'ALL' || t.approvalStatus === filterStatus;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.creatorUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(t.id).includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    ALL: tournaments.length,
    PENDING: tournaments.filter((t) => t.approvalStatus === 'PENDING').length,
    APPROVED: tournaments.filter((t) => t.approvalStatus === 'APPROVED').length,
  };

  if (!currentUser || currentUser.globalRole !== 'ADMIN') {
    return (
      <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12 text-center">
        <EmptyState
          icon={AlertCircle}
          title="Quyền truy cập bị hạn chế"
          desc="Trang này chỉ dành cho tài khoản Quản trị viên (ADMIN). Vui lòng đăng nhập với tài khoản Admin để tiếp tục."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-8 h-8 text-primary-red" />
            <h2 className="font-display text-3xl text-off-white uppercase tracking-wider">
              Quản lý Giải đấu
            </h2>
          </div>
          <p className="font-mono text-xs text-tactical-gray uppercase">
            // Phê duyệt giải đấu mới và Quản lý các giải đấu đang vận hành trên hệ thống
          </p>
        </div>

        <TactileButton
          onClick={fetchTournaments}
          disabled={isLoading}
          className="bg-surface-bright text-off-white font-mono text-xs py-2.5 px-4 uppercase flex items-center gap-2 hover:bg-surface-bright/80 border border-outline-variant"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Làm mới
        </TactileButton>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="bg-primary-red/10 border border-primary-red text-primary-red p-4 mb-6 font-mono text-xs uppercase flex items-center gap-3">
          <AlertCircle size={18} />
          <span>// LỖI: {errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-success-cyan/10 border border-success-cyan text-success-cyan p-4 mb-6 font-mono text-xs uppercase flex items-center gap-3">
          <CheckCircle2 size={18} />
          <span>// THÀNH CÔNG: {successMessage}</span>
        </div>
      )}

      {/* Control Bar: Filter Tabs & Search */}
      <div className="bg-surface-charcoal border border-outline-variant p-4 mb-8 clip-corner flex flex-col md:flex-row justify-between gap-4 items-center">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { key: 'ALL', label: 'TẤT CẢ', color: 'text-off-white' },
            { key: 'PENDING', label: 'CHỜ DUYỆT', color: 'text-warning-amber' },
            { key: 'APPROVED', label: 'ĐANG TỔ CHỨC / ĐÃ DUYỆT', color: 'text-success-cyan' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`font-mono text-xs px-4 py-2 uppercase border font-bold transition-all flex items-center gap-2 ${
                filterStatus === key
                  ? 'bg-primary-red text-off-white border-primary-red'
                  : 'bg-background/50 border-outline-variant text-off-white/70 hover:text-off-white hover:border-tactical-gray'
              }`}
            >
              <span>{label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] bg-background ${color}`}>
                {counts[key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tactical-gray" />
          <input
            type="text"
            placeholder="Tìm theo tên giải, người tạo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-outline-variant pl-9 pr-4 py-2 text-off-white font-mono text-xs focus:outline-none focus:border-primary-red"
          />
        </div>
      </div>

      {/* Tournament Cards List */}
      {filteredTournaments.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="Không tìm thấy giải đấu nào"
          desc="Không có giải đấu nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn."
        />
      ) : (
        <div className="space-y-4">
          {filteredTournaments.map((t) => (
            <div
              key={t.id}
              className="bg-surface-charcoal border border-outline-variant p-6 clip-corner transition-all hover:border-outline-variant/80 flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="flex-grow space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-primary-red font-bold">// ID: {t.id}</span>
                  
                  {/* Approval Status Badge */}
                  <span
                    className={`font-mono text-[11px] px-2.5 py-0.5 uppercase font-bold flex items-center gap-1.5 border ${
                      t.approvalStatus === 'APPROVED'
                        ? 'bg-success-cyan/10 text-success-cyan border-success-cyan/30'
                        : 'bg-warning-amber/10 text-warning-amber border-warning-amber/30 animate-pulse'
                    }`}
                  >
                    {t.approvalStatus === 'APPROVED' && <CheckCircle2 size={12} />}
                    {t.approvalStatus === 'PENDING' && <Clock size={12} />}
                    {t.approvalStatus === 'PENDING' ? 'CHỜ AD DUYỆT' : 'ĐANG TỔ CHỨC / ĐÃ DUYỆT'}
                  </span>

                  <span className="font-mono text-[10px] text-tactical-gray border border-outline-variant/60 px-2 py-0.5">
                    ĐĂNG KÝ: {t.registrationStatus}
                  </span>
                </div>

                <h3 className="font-display text-2xl text-off-white uppercase tracking-wide">{t.name}</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs pt-1">
                  <div>
                    <span className="text-tactical-gray block text-[10px]">NGƯỜI TẠO:</span>
                    <span className="text-off-white font-bold">@{t.creatorUsername}</span>
                  </div>
                  <div>
                    <span className="text-tactical-gray block text-[10px]">THỂ THỨC:</span>
                    <span className="text-off-white font-bold">{t.format || 'Chưa thiết lập'}</span>
                  </div>
                  <div>
                    <span className="text-tactical-gray block text-[10px]">SỐ ĐỘI TỐI ĐA:</span>
                    <span className="text-off-white font-bold">{t.maxTeams} Đội</span>
                  </div>
                </div>

                {t.rulesDescription && (
                  <div className="bg-background/40 p-3 border border-outline-variant/40 font-body text-xs text-off-white/80 line-clamp-2 mt-2">
                    <span className="font-mono text-[10px] text-tactical-gray uppercase block mb-1">Mô tả & Luật:</span>
                    {t.rulesDescription}
                  </div>
                )}
              </div>

              {/* Actions Column */}
              <div className="flex md:flex-col justify-end gap-3 min-w-44 border-t md:border-t-0 md:border-l border-outline-variant pt-4 md:pt-0 md:pl-6">
                {t.approvalStatus === 'PENDING' ? (
                  <>
                    <TactileButton
                      onClick={() => handleApprove(t.id)}
                      disabled={actionLoadingId === t.id}
                      className="w-full bg-success-cyan text-background font-display text-xs py-2.5 px-4 uppercase tracking-wider font-bold hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      {actionLoadingId === t.id ? 'Đang duyệt...' : 'Phê Duyệt'}
                    </TactileButton>

                    <TactileButton
                      onClick={() => handleReject(t.id)}
                      disabled={actionLoadingId === t.id}
                      className="w-full bg-primary-red text-off-white font-display text-xs py-2.5 px-4 uppercase tracking-wider font-bold hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      {actionLoadingId === t.id ? 'Đang xử lý...' : 'Từ Chối'}
                    </TactileButton>
                  </>
                ) : (
                  <>
                    <TactileButton
                      onClick={() => openEditModal(t)}
                      disabled={actionLoadingId === t.id}
                      className="w-full bg-warning-amber text-background font-display text-xs py-2.5 px-4 uppercase tracking-wider font-bold hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Pencil size={14} />
                      Sửa
                    </TactileButton>

                    <TactileButton
                      onClick={() => handleDelete(t.id)}
                      disabled={actionLoadingId === t.id}
                      className="w-full bg-primary-red text-off-white font-display text-xs py-2.5 px-4 uppercase tracking-wider font-bold hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {actionLoadingId === t.id ? 'Đang xóa...' : 'Xóa'}
                    </TactileButton>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Tournament Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface-charcoal border border-outline-variant p-6 w-full max-w-lg clip-corner shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/60 pb-3">
              <h3 className="font-display text-xl text-off-white uppercase">Chỉnh sửa giải đấu #{editModal.tournament?.id}</h3>
              <button
                onClick={() => setEditModal({ ...editModal, isOpen: false })}
                className="text-tactical-gray hover:text-primary-red font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1">Tên giải đấu</label>
                <input
                  type="text"
                  required
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  className="w-full bg-background border border-outline-variant p-2.5 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-tactical-gray mb-1">Số đội tối đa</label>
                  <select
                    value={editModal.maxTeams}
                    onChange={(e) => setEditModal({ ...editModal, maxTeams: Number(e.target.value) })}
                    className="w-full bg-background border border-outline-variant p-2.5 text-off-white font-mono text-xs focus:outline-none focus:border-primary-red"
                  >
                    <option value={8}>8 Đội</option>
                    <option value={16}>16 Đội</option>
                    <option value={32}>32 Đội</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1">Mô tả & Luật</label>
                <textarea
                  rows={4}
                  value={editModal.rulesDescription}
                  onChange={(e) => setEditModal({ ...editModal, rulesDescription: e.target.value })}
                  className="w-full bg-background border border-outline-variant p-2.5 text-off-white font-body text-xs focus:outline-none focus:border-primary-red"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <TactileButton
                  type="button"
                  onClick={() => setEditModal({ ...editModal, isOpen: false })}
                  className="bg-surface-bright text-off-white font-display text-xs py-2 px-4 uppercase"
                >
                  Hủy
                </TactileButton>
                <TactileButton
                  type="submit"
                  disabled={actionLoadingId === editModal.tournament?.id}
                  className="bg-success-cyan text-background font-display text-xs py-2 px-4 uppercase font-bold hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoadingId === editModal.tournament?.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

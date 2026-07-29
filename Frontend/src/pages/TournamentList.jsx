import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, ArrowRight, Calendar, Users, MapPin } from 'lucide-react';
import { getAllTournaments, createTournament, getMyTournaments, updateTournament } from '../services/tournamentService';
import { useAuth } from '../contexts/AuthContext';
import TactileButton from '../components/common/TactileButton';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function TournamentList() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'my' | 'create'
  const [myTournaments, setMyTournaments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    maxTeams: 16,
    rulesDescription: '',
    startDate: '',
    endDate: '',
    prizePool: '',
    location: '',
    structure: 'SINGLE_ELIMINATION',
    format: 'BO3'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await getAllTournaments();
      if (res.success) {
        setTournaments(res.data || []);
      }
      if (currentUser) {
        const myRes = await getMyTournaments();
        if (myRes.success) {
          setMyTournaments(myRes.data || []);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách giải đấu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [currentUser]);

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.maxTeams) {
      setError('Vui lòng nhập đầy đủ thông tin giải đấu!');
      return;
    }
    if (!currentUser) {
      setError('Bạn cần đăng nhập để tạo giải đấu!');
      return;
    }

    setError('');
    setSuccess('');
    setCreateLoading(true);

    try {
      let res;
      if (editingId) {
        res = await updateTournament(
          editingId,
          createForm.name,
          parseInt(createForm.maxTeams),
          createForm.rulesDescription,
          createForm.startDate,
          createForm.endDate,
          createForm.prizePool,
          createForm.location,
          createForm.structure,
          createForm.format
        );
      } else {
        res = await createTournament(
          createForm.name,
          parseInt(createForm.maxTeams),
          createForm.rulesDescription,
          createForm.startDate,
          createForm.endDate,
          createForm.prizePool,
          createForm.location,
          createForm.structure,
          createForm.format
        );
      }

      if (res.success) {
        setSuccess(editingId ? 'Cập nhật giải đấu thành công!' : 'Tạo giải đấu thành công! Giải đấu đang chờ Admin duyệt.');
        setCreateForm({
          name: '',
          maxTeams: 16,
          rulesDescription: '',
          startDate: '',
          endDate: '',
          prizePool: '',
          location: '',
          structure: 'SINGLE_ELIMINATION',
          format: 'BO3'
        });
        setEditingId(null);
        await fetchTournaments();
        setTimeout(() => {
          setViewMode('my');
          setSuccess('');
        }, 2000);
      } else {
        setError(res.message || (editingId ? 'Cập nhật giải đấu thất bại!' : 'Tạo giải đấu thất bại!'));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống!');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setCreateForm({
      name: t.name || '',
      maxTeams: t.maxTeams || 16,
      rulesDescription: t.rulesDescription || '',
      startDate: t.startDate ? t.startDate.substring(0, 10) : '',
      endDate: t.endDate ? t.endDate.substring(0, 10) : '',
      prizePool: t.prizePool || '',
      location: t.location || '',
      structure: t.structure || 'SINGLE_ELIMINATION',
      format: t.format || 'BO3'
    });
    setViewMode('create');
  };

  return (
    <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12 animate-fade-in">
      {(viewMode === 'list' || viewMode === 'my') && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="font-display text-4xl text-off-white uppercase mb-1">GIẢI ĐẤU</h2>
              <p className="font-mono text-xs text-tactical-gray">// Các giải đấu Esports đỉnh cao</p>
            </div>

            {currentUser ? (
              <TactileButton
                variant="primary"
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setEditingId(null);
                  setCreateForm({
                    name: '',
                    maxTeams: 16,
                    rulesDescription: '',
                    startDate: '',
                    endDate: '',
                    prizePool: '',
                    location: '',
                    structure: 'SINGLE_ELIMINATION',
                    format: 'BO3'
                  });
                  setViewMode('create');
                }}
                className="flex items-center gap-2"
              >
                <Plus size={16} /> Tạo Giải Đấu Mới
              </TactileButton>
            ) : (
              <p className="font-mono text-xs text-warning-amber border border-warning-amber/30 bg-warning-amber/10 px-3 py-1.5 rounded">
                // Đăng nhập để tạo giải đấu mới
              </p>
            )}
          </div>

          {currentUser && (
            <div className="flex gap-4 mb-8 border-b border-outline-variant pb-4">
              <button
                onClick={() => setViewMode('list')}
                className={`font-mono text-sm uppercase tracking-wider px-4 py-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'text-primary-red border-b-2 border-primary-red font-bold' 
                    : 'text-tactical-gray hover:text-off-white'
                }`}
              >
                Tất Cả Giải Đấu
              </button>
              <button
                onClick={() => setViewMode('my')}
                className={`font-mono text-sm uppercase tracking-wider px-4 py-2 transition-colors ${
                  viewMode === 'my' 
                    ? 'text-primary-red border-b-2 border-primary-red font-bold' 
                    : 'text-tactical-gray hover:text-off-white'
                }`}
              >
                Giải Đấu Của Tôi
              </button>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : (viewMode === 'my' ? myTournaments : tournaments).length === 0 ? (
            <EmptyState
              icon={Trophy}
              title={viewMode === 'my' ? "Bạn chưa tạo giải đấu nào" : "Chưa có giải đấu nào"}
              desc={viewMode === 'my' ? "Hãy tạo giải đấu đầu tiên của bạn ngay bây giờ!" : "Không tìm thấy thông tin giải đấu."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(viewMode === 'my' ? myTournaments : tournaments).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                  className="bg-surface-charcoal border border-outline-variant p-6 flex flex-col justify-between clip-corner cursor-pointer hover:border-primary-red/60 transition-all hover:-translate-y-1 group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-mono text-xs text-success-cyan font-bold tracking-wider">// ID: {t.id}</span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 uppercase font-bold border ${
                        viewMode === 'my' ? (
                          t.approvalStatus === 'APPROVED' ? 'bg-success-cyan/10 text-success-cyan border-success-cyan/30' :
                          t.approvalStatus === 'PENDING' ? 'bg-warning-amber/10 text-warning-amber border-warning-amber/30' :
                          'bg-primary-red/10 text-primary-red border-primary-red/30'
                        ) : (
                          t.registrationStatus === 'OPEN' ? 'bg-success-cyan/10 text-success-cyan border-success-cyan/30' :
                          t.registrationStatus === 'PENDING' ? 'bg-warning-amber/10 text-warning-amber border-warning-amber/30' :
                          'bg-tactical-gray/10 text-tactical-gray border-tactical-gray/30'
                        )
                      }`}>
                        {viewMode === 'my' 
                          ? (t.approvalStatus === 'PENDING' ? 'Đang Chờ Duyệt' : t.approvalStatus === 'APPROVED' ? 'Đã Xuất Bản' : 'Bị Từ Chối')
                          : (t.registrationStatus === 'PENDING' ? 'Chờ duyệt' : t.registrationStatus)}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl text-off-white uppercase mb-3 group-hover:text-primary-red transition-colors line-clamp-1">
                      {t.name}
                    </h3>

                    <div className="space-y-2 mb-6 border-t border-b border-outline-variant/30 py-3">
                      <div className="flex justify-between font-mono text-xs text-tactical-gray">
                        <span>Thể thức:</span>
                        <span className="text-off-white font-bold">{t.structure === 'GROUP_KNOCKOUT' ? 'Vòng Bảng + Knockout' : 'Loại Trực Tiếp'}</span>
                      </div>
                      <div className="flex justify-between font-mono text-xs text-tactical-gray">
                        <span>Số đội:</span>
                        <span className="text-off-white font-bold">{t.registeredTeams ? t.registeredTeams.length : 0} / {t.maxTeams}</span>
                      </div>
                      <div className="flex justify-between font-mono text-xs text-tactical-gray">
                        <span>Người tạo:</span>
                        <span className="text-success-cyan font-bold">@{t.creatorUsername}</span>
                      </div>
                      {t.prizePool && (
                        <div className="flex justify-between font-mono text-xs text-tactical-gray">
                          <span>Giải thưởng:</span>
                          <span className="text-warning-amber font-bold">{t.prizePool}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    {t.approvalStatus === 'APPROVED' && (
                      <TactileButton
                        variant="primary"
                        onClick={() => navigate(`/tournaments/${t.id}`)}
                        className="w-full justify-center flex items-center gap-1.5"
                      >
                        THAM GIA GIẢI ĐẤU <ArrowRight size={14} />
                      </TactileButton>
                    )}

                    {viewMode === 'my' && t.approvalStatus === 'PENDING' && (
                      <TactileButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(t)}
                        className="w-full justify-center"
                      >
                        Chỉnh sửa Thông tin
                      </TactileButton>
                    )}

                    {currentUser && (currentUser.username === t.creatorUsername || currentUser.globalRole === 'ADMIN') && t.approvalStatus === 'APPROVED' && (
                      <TactileButton
                        variant="cyan"
                        size="sm"
                        onClick={() => navigate(`/tournaments/${t.id}/manage`)}
                        className="w-full justify-center"
                      >
                        Quản lý Giải đấu
                      </TactileButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {viewMode === 'create' && (
        <div className="max-w-2xl mx-auto bg-surface-charcoal border border-outline-variant p-8 clip-corner animate-scale-in">
          <h3 className="font-display text-3xl text-off-white uppercase mb-1">
            {editingId ? 'Chỉnh Sửa Giải Đấu' : 'Tạo Giải Đấu Mới'}
          </h3>
          <p className="font-mono text-xs text-tactical-gray mb-6">
            // {editingId ? 'Cập nhật lại thông tin giải đấu của bạn' : 'Thiết lập các thông số cơ bản cho giải đấu của bạn'}
          </p>

          {error && (
            <div className="bg-primary-red/10 border border-primary-red text-primary-red p-3 mb-4 text-xs font-mono uppercase">
              // Lỗi: {error}
            </div>
          )}
          {success && (
            <div className="bg-success-cyan/10 border border-success-cyan text-success-cyan p-3 mb-4 text-xs font-mono uppercase">
              // Thành công: {success}
            </div>
          )}

          <form onSubmit={handleCreateTournament} className="space-y-6">
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Tên Giải Đấu</label>
              <input
                type="text"
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                placeholder="VD: VALORANT VIETNAM CHALLENGERS"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Số Lượng Đội</label>
                <select
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                  value={createForm.maxTeams}
                  onChange={(e) => setCreateForm({ ...createForm, maxTeams: parseInt(e.target.value) })}
                >
                  <option value="4">4 Đội</option>
                  <option value="8">8 Đội</option>
                  <option value="16">16 Đội</option>
                  <option value="32">32 Đội</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Định Dạng Ván (Format)</label>
                <select
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                  value={createForm.format}
                  onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })}
                >
                  <option value="BO1">Best of 1 (BO1)</option>
                  <option value="BO3">Best of 3 (BO3)</option>
                  <option value="BO5">Best of 5 (BO5)</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Cấu Trúc Giải Đấu</label>
                <select
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                  value={createForm.structure}
                  onChange={(e) => setCreateForm({ ...createForm, structure: e.target.value })}
                >
                  <option value="SINGLE_ELIMINATION">Loại Trực Tiếp (Single Elimination)</option>
                  <option value="GROUP_KNOCKOUT">Vòng Bảng + Nhánh Đấu</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Mô Tả & Luật Thi Đấu</label>
              <textarea
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red h-32"
                placeholder="Nhập luật đấu, thể thức cụ thể, thời gian và giải thưởng..."
                value={createForm.rulesDescription}
                onChange={(e) => setCreateForm({ ...createForm, rulesDescription: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Ngày Bắt Đầu</label>
                <input
                  type="date"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red [color-scheme:dark]"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Ngày Kết Thúc</label>
                <input
                  type="date"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red [color-scheme:dark]"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Giải Thưởng (Prize Pool)</label>
                <input
                  type="text"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                  placeholder="VD: $250,000"
                  value={createForm.prizePool}
                  onChange={(e) => setCreateForm({ ...createForm, prizePool: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Địa Điểm</label>
                <input
                  type="text"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                  placeholder="VD: Online / TP. Hồ Chí Minh"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <TactileButton
                type="button"
                variant="secondary"
                onClick={() => setViewMode('list')}
                className="w-full justify-center"
              >
                HỦY BỎ
              </TactileButton>
              <TactileButton type="submit" variant="primary" className="w-full justify-center" disabled={createLoading}>
                {createLoading ? (editingId ? 'ĐANG CẬP NHẬT...' : 'ĐANG TẠO...') : (editingId ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN TẠO GIẢI ĐẤU')}
              </TactileButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trophy, ArrowRight } from 'lucide-react';
import { getAllTournaments, createTournament } from '../services/tournamentService';
import TactileButton from '../components/common/TactileButton';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';

export default function TournamentList() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [createForm, setCreateForm] = useState({ name: '', maxTeams: 16, rulesDescription: '', startDate: '', endDate: '', prizePool: '', location: '', structure: 'SINGLE_ELIMINATION', format: 'BO1' });
  const [tournamentError, setTournamentError] = useState('');
  const [tournamentSuccess, setTournamentSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTournaments = async () => {
    setIsFetching(true);
    try {
      const res = await getAllTournaments();
      if (res.success) {
        setTournaments(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách giải đấu:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.maxTeams) {
      setTournamentError('Vui lòng nhập đầy đủ thông tin giải đấu!');
      return;
    }
    if (!currentUser) {
      setTournamentError('Bạn cần đăng nhập để tạo giải đấu!');
      return;
    }
    setTournamentError('');
    setTournamentSuccess('');
    setIsLoading(true);
    try {
      const res = await createTournament(
        createForm.name,
        parseInt(createForm.maxTeams),
        createForm.rulesDescription,
        createForm.startDate,
        createForm.endDate,
        createForm.prizePool,
        createForm.location,
        createForm.structure,
        createForm.format,
        currentUser.id
      );
      if (res.success) {
        setTournamentSuccess('Tạo giải đấu thành công! Giải đấu của bạn đang chờ Admin phê duyệt trước khi được xuất bản công khai.');
        setCreateForm({ name: '', maxTeams: 16, rulesDescription: '', startDate: '', endDate: '', prizePool: '', location: '', structure: 'SINGLE_ELIMINATION', format: 'BO1' });
        await fetchTournaments();
        setTimeout(() => {
          setViewMode('list');
          setTournamentSuccess('');
        }, 2500);
      } else {
        setTournamentError(res.message || 'Tạo giải đấu thất bại!');
      }
    } catch (err) {
      setTournamentError(err.response?.data?.message || 'Lỗi hệ thống khi tạo giải đấu!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTournamentDetails = (id) => {
    navigate(`/tournaments/${id}`);
  };

  return (
    <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
      {viewMode === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="font-display text-3xl text-off-white uppercase mb-2">Giải đấu</h2>
              <p className="font-mono text-sm text-tactical-gray">// Các giải đấu Esports đỉnh cao</p>
            </div>
            {currentUser ? (
              <TactileButton
                onClick={() => {
                  setTournamentError('');
                  setTournamentSuccess('');
                  setViewMode('create');
                }}
                className="clip-corner bg-primary-red text-off-white font-display text-sm py-2.5 px-6 uppercase font-bold flex items-center gap-2 hover:brightness-110"
              >
                <Plus size={16} /> Tạo giải đấu mới
              </TactileButton>
            ) : (
              <p className="font-mono text-xs text-warning-amber">// Đăng nhập để tạo giải đấu mới</p>
            )}
          </div>

          {isFetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingSkeleton type="card" count={6} />
            </div>
          ) : tournaments.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Chưa có giải đấu nào"
              desc="Không tìm thấy thông tin giải đấu. Nếu bạn là nhà tổ chức, hãy tạo giải đấu đầu tiên ngay bây giờ!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => handleViewTournamentDetails(t.id)}
                  className="bg-surface-charcoal border border-outline-variant p-6 flex flex-col justify-between clip-corner cursor-pointer hover:border-primary-red/60 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-mono text-xs text-success-cyan font-bold tracking-wider">// ID: {t.id}</span>
                      <span className={`font-mono text-xs px-2 py-1 uppercase font-bold ${
                        t.registrationStatus === 'OPEN' ? 'bg-success-cyan/10 text-success-cyan border border-success-cyan/20' :
                        t.registrationStatus === 'PENDING' ? 'bg-warning-amber/10 text-warning-amber border border-warning-amber/20' :
                        'bg-tactical-gray/10 text-tactical-gray border border-tactical-gray/20'
                      }`}>
                        {t.registrationStatus === 'PENDING' ? 'Chờ duyệt' : t.registrationStatus}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-off-white uppercase mb-3 line-clamp-1">{t.name}</h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between font-mono text-xs border-b border-outline-variant pb-2">
                        <span className="text-tactical-gray">Định dạng:</span>
                        <span className="text-off-white font-bold">{t.format}</span>
                      </div>
                      <div className="flex justify-between font-mono text-xs text-off-white/60">
                        <span>Số đội:</span>
                        <span className="text-off-white font-bold">{t.registeredTeams ? t.registeredTeams.length : 0} / {t.maxTeams}</span>
                      </div>
                      <div className="flex justify-between font-mono text-xs text-off-white/60">
                        <span>Người tạo:</span>
                        <span className="text-off-white font-bold">@{t.creatorUsername}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <TactileButton
                      onClick={() => handleViewTournamentDetails(t.id)}
                      className="w-full bg-primary-red text-off-white font-display text-xs py-2.5 px-4 uppercase tracking-wider hover:brightness-110 text-center font-bold flex justify-center items-center gap-1.5"
                    >
                      THAM GIA GIẢI ĐẤU <ArrowRight size={14} />
                    </TactileButton>
                    {currentUser && (currentUser.username === t.creatorUsername || currentUser.globalRole === 'ADMIN') && (
                      <TactileButton
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tournaments/${t.id}/manage`);
                        }}
                        className="w-full bg-success-cyan text-[#111] font-display text-xs py-2.5 px-4 uppercase tracking-wider hover:brightness-110 text-center font-bold flex justify-center items-center gap-1.5"
                      >
                        QUẢN LÝ GIẢI ĐẤU
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
        <div className="max-w-2xl mx-auto bg-surface-charcoal border border-outline-variant p-8 clip-corner">
          <h3 className="font-display text-2xl text-off-white uppercase mb-2">Tạo giải đấu mới</h3>
          <p className="font-mono text-xs text-tactical-gray mb-6">// Thiết lập các thông số cơ bản cho giải đấu của bạn</p>

          {tournamentError && (
            <div className="bg-primary-red/10 border border-primary-red text-primary-red p-3 mb-4 text-sm font-mono uppercase">
              // Lỗi: {tournamentError}
            </div>
          )}
          {tournamentSuccess && (
            <div className="bg-success-cyan/10 border border-success-cyan text-success-cyan p-3 mb-4 text-sm font-mono uppercase">
              // Thành công: {tournamentSuccess}
            </div>
          )}

          <form onSubmit={handleCreateTournament} className="space-y-6">
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Tên giải đấu</label>
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
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Số lượng đội</label>
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
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Cấu trúc giải đấu</label>
                <select
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                  value={createForm.structure}
                  onChange={(e) => setCreateForm({ ...createForm, structure: e.target.value })}
                >
                  <option value="SINGLE_ELIMINATION">Loại Trực Tiếp (Single Elimination)</option>
                  <option value="GROUP_KNOCKOUT">Vòng Bảng + Nhánh Đấu (Group Stage & Knockout)</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Định dạng trận đấu (BO)</label>
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
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Mô tả & Luật thi đấu</label>
              <textarea
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red h-32"
                placeholder="Nhập luật đấu, thể thức cụ thể, thời gian và giải thưởng..."
                value={createForm.rulesDescription}
                onChange={(e) => setCreateForm({ ...createForm, rulesDescription: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red [color-scheme:dark]"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Ngày kết thúc</label>
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
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Giải thưởng (Prize Pool)</label>
                <input
                  type="text"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                  placeholder="VD: $250,000"
                  value={createForm.prizePool}
                  onChange={(e) => setCreateForm({ ...createForm, prizePool: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-2">Địa điểm</label>
                <input
                  type="text"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
                  placeholder="VD: BR São Paulo"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <TactileButton
                type="button"
                onClick={() => setViewMode('list')}
                className="w-full bg-surface-bright text-off-white font-display text-sm py-3 px-6 uppercase tracking-wider hover:bg-surface-bright/80"
              >
                Hủy & Quay lại
              </TactileButton>
              <TactileButton
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-red text-off-white font-display text-sm py-3 px-6 uppercase tracking-wider font-bold hover:brightness-110 disabled:opacity-50"
              >
                {isLoading ? 'Đang tạo...' : 'Xác nhận tạo'}
              </TactileButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

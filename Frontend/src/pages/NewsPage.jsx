import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Calendar, ArrowRight, Bell, Tag } from 'lucide-react';
import { getAllTournaments } from '../services/tournamentService';
import TactileButton from '../components/common/TactileButton';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function NewsPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await getAllTournaments();
        if (res.success) {
          setTournaments(res.data || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải tin tức giải đấu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Vừa cập nhật';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12 animate-fade-in">
      <div className="mb-10 border-b border-outline-variant pb-6">
        <h2 className="font-display text-4xl text-off-white uppercase flex items-center gap-3">
          <Newspaper className="text-primary-red" size={36} /> TIN TỨC & THÔNG BÁO
        </h2>
        <p className="font-mono text-xs text-tactical-gray mt-2">
          // Cập nhật thông tin mới nhất về các giải đấu Esports trên hệ thống
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main news feed */}
          <div className="lg:col-span-2 space-y-6">
            {tournaments.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title="Chưa có tin mới"
                desc="Tin tức và thông báo mới nhất từ các giải đấu sẽ xuất hiện tại đây khi giải đấu được khởi tạo."
              />
            ) : (
              tournaments.map((t) => (
                <article
                  key={t.id}
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                  className="bg-surface-charcoal border border-outline-variant p-6 clip-corner cursor-pointer hover:border-primary-red/60 transition-all hover:-translate-y-1 group relative"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-primary-red/10 border border-primary-red/30 text-primary-red font-mono text-[10px] px-2.5 py-0.5 uppercase tracking-wider font-bold">
                      GIẢI ĐẤU MỚI
                    </span>
                    <span className="font-mono text-xs text-tactical-gray flex items-center gap-1">
                      <Calendar size={12} /> {formatDate(t.startDate)}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl text-off-white uppercase mb-3 group-hover:text-primary-red transition-colors">
                    {t.name}
                  </h3>

                  <p className="font-body text-sm text-off-white/70 mb-4 line-clamp-2 leading-relaxed">
                    {t.rulesDescription || `Giải đấu ${t.name} do @${t.creatorUsername} tổ chức. Thể thức ${t.structure === 'GROUP_KNOCKOUT' ? 'Vòng Bảng + Knockout' : 'Loại Trực Tiếp'} với quy mô ${t.maxTeams} đội tuyển tham gia tranh tài.`}
                  </p>

                  <div className="flex justify-between items-center border-t border-outline-variant/30 pt-4 mt-2">
                    <div className="flex items-center gap-4 font-mono text-xs text-tactical-gray">
                      <span>Đã đăng ký: <strong className="text-off-white">{t.registeredTeams ? t.registeredTeams.length : 0}/{t.maxTeams}</strong></span>
                      {t.prizePool && <span>Giải thưởng: <strong className="text-warning-amber">{t.prizePool}</strong></span>}
                    </div>
                    <TactileButton variant="ghost" size="sm" className="flex items-center gap-1 text-primary-red group-hover:translate-x-1 transition-transform">
                      XEM THÊM <ArrowRight size={14} />
                    </TactileButton>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Sidebar announcements */}
          <aside className="space-y-6">
            <div className="bg-surface-charcoal border border-outline-variant p-6 clip-corner">
              <h3 className="font-display text-lg text-off-white uppercase mb-4 flex items-center gap-2 border-b border-outline-variant/40 pb-3">
                <Bell size={18} className="text-warning-amber" /> Thông Báo Hệ Thống
              </h3>
              <div className="space-y-4 font-body text-xs text-off-white/80">
                <div className="p-3 bg-background/50 border border-outline-variant/30">
                  <p className="font-mono text-[10px] text-success-cyan mb-1">// VCT 2026 UPDATE</p>
                  <p className="font-semibold text-white mb-1">Cập nhật hệ thống Ban/Pick Map & Agent real-time</p>
                  <p className="text-tactical-gray">Hệ thống WebSocket đã hỗ trợ đồng bộ theo từng giây cho phòng Ban/Pick.</p>
                </div>
                <div className="p-3 bg-background/50 border border-outline-variant/30">
                  <p className="font-mono text-[10px] text-warning-amber mb-1">// ANNOUNCEMENT</p>
                  <p className="font-semibold text-white mb-1">Hệ thống phân quyền Trọng tài & Ban Tổ Chức</p>
                  <p className="text-tactical-gray">Chủ giải có thể dễ dàng phân quyền trọng tài phụ trách trận đấu.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

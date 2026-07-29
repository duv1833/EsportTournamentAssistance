import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Shield, Trophy, Globe, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t-4 border-primary-red pt-12 pb-8 px-6 md:px-12 text-off-white/80">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Branding */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="w-7 h-7 text-primary-red" strokeWidth={2.5} />
            <span className="font-display text-2xl tracking-tighter text-off-white">TACTICAL EDGE</span>
          </div>
          <p className="font-body text-xs text-tactical-gray leading-relaxed max-w-md">
            Hệ thống điều hành và hỗ trợ tổ chức giải đấu Esports chuyên nghiệp. Quản lý sơ đồ thi đấu tự động, đồng bộ hóa thời gian thực và trải nghiệm cấm/chọn chuẩn Valorant.
          </p>
          <div className="flex items-center gap-3 pt-2 font-mono text-xs text-success-cyan">
            <span className="w-2 h-2 rounded-full bg-success-cyan animate-pulse"></span>
            <span>HỆ THỐNG ĐANG HOẠT ĐỘNG // ONLINE</span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="space-y-3">
          <h4 className="font-display text-sm text-off-white uppercase tracking-wider border-b border-outline-variant/40 pb-2">
            ĐƯỜNG DẪN NHANH
          </h4>
          <ul className="space-y-2 font-mono text-xs text-tactical-gray">
            <li>
              <Link to="/tournaments" className="hover:text-primary-red transition-colors flex items-center gap-1.5">
                <Trophy size={12} /> Các Giải Đấu
              </Link>
            </li>
            <li>
              <Link to="/matches" className="hover:text-primary-red transition-colors flex items-center gap-1.5">
                <Shield size={12} /> Lịch Thi Đấu & Bracket
              </Link>
            </li>
            <li>
              <Link to="/teams" className="hover:text-primary-red transition-colors flex items-center gap-1.5">
                <Globe size={12} /> Danh Sách Đội Tuyển
              </Link>
            </li>
            <li>
              <Link to="/news" className="hover:text-primary-red transition-colors flex items-center gap-1.5">
                <MessageSquare size={12} /> Tin Tức & Thông Báo
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Legal & Support */}
        <div className="space-y-3">
          <h4 className="font-display text-sm text-off-white uppercase tracking-wider border-b border-outline-variant/40 pb-2">
            HỖ TRỢ & ĐIỀU KHOẢN
          </h4>
          <ul className="space-y-2 font-mono text-xs text-tactical-gray">
            <li><span className="hover:text-off-white cursor-pointer">Luật Thi Đấu Chuẩn VCT</span></li>
            <li><span className="hover:text-off-white cursor-pointer">Quy Định Đội Tuyển & Vận Động Viên</span></li>
            <li><span className="hover:text-off-white cursor-pointer">Chính Sách Bảo Mật Dữ Liệu</span></li>
            <li><span className="hover:text-off-white cursor-pointer">Liên Hệ Ban Tổ Chức</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container mx-auto max-w-7xl pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[11px] text-tactical-gray">
        <p>© 2026 TACTICAL EDGE ESPORTS ENGINE. ALL RIGHTS RESERVED.</p>
        <p className="text-off-white/40">// VALORANT IS A REGISTERED TRADEMARK OF RIOT GAMES, INC.</p>
      </div>
    </footer>
  );
}

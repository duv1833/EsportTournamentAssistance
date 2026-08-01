import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Layers, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#0a1118] text-off-white border-t-2 border-primary-red pt-16 pb-8 overflow-hidden z-10">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-red/5 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Brand Col */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
              <div className="relative">
                <Layers className="text-primary-red group-hover:text-off-white transition-colors z-10 relative" size={32} strokeWidth={2} />
                <div className="absolute inset-0 bg-primary-red blur-md opacity-40 group-hover:opacity-80 transition-opacity"></div>
              </div>
              <span className="font-display font-bold text-2xl tracking-wider uppercase text-off-white group-hover:text-primary-red transition-colors">
                Tourney<span className="text-primary-red group-hover:text-off-white transition-colors">Hub</span>
              </span>
            </Link>
            <p className="font-body text-tactical-gray text-sm leading-relaxed mb-6">
              Nền tảng quản lý giải đấu eSports chuyên nghiệp. Kết nối cộng đồng game thủ, tổ chức các giải đấu quy mô từ nghiệp dư đến chuyên nghiệp với hệ thống tự động hóa hoàn toàn.
            </p>
            <div className="flex gap-4 mt-auto">
              {/* Removed brand icons */}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-display text-lg uppercase tracking-widest text-off-white border-l-2 border-primary-red pl-3">LIÊN KẾT NHANH</h4>
            <div className="grid grid-cols-2 gap-3">
              <NavLink to="/" className="font-mono text-sm text-tactical-gray hover:text-primary-red transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-primary-red rounded-full"></span> Trang chủ
              </NavLink>
              <NavLink to="/tournaments" className="font-mono text-sm text-tactical-gray hover:text-primary-red transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-primary-red rounded-full"></span> Giải đấu
              </NavLink>
              <NavLink to="/matches" className="font-mono text-sm text-tactical-gray hover:text-primary-red transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-primary-red rounded-full"></span> Lịch thi đấu
              </NavLink>
              <NavLink to="/teams" className="font-mono text-sm text-tactical-gray hover:text-primary-red transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-primary-red rounded-full"></span> Đội tuyển
              </NavLink>
              <NavLink to="/news" className="font-mono text-sm text-tactical-gray hover:text-primary-red transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-primary-red rounded-full"></span> Tin tức
              </NavLink>
              <NavLink to="/rules" className="font-mono text-sm text-tactical-gray hover:text-primary-red transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-primary-red rounded-full"></span> Quy tắc
              </NavLink>
            </div>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-6">
            <h4 className="font-display text-lg uppercase tracking-widest text-off-white border-l-2 border-primary-red pl-3">LIÊN HỆ</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-off-white/70">
                <MapPin size={18} className="text-primary-red shrink-0 mt-0.5" />
                <span className="font-body text-sm">123 Đường Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-3 text-off-white/70">
                <Mail size={18} className="text-primary-red shrink-0" />
                <a href="mailto:contact@tacticaledge.vn" className="font-mono text-sm hover:text-primary-red transition-colors">contact@tacticaledge.vn</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-tactical-gray uppercase">
            © 2024 TACTICAL EDGE. BẢN QUYỀN ĐƯỢC BẢO LƯU.
          </p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="font-mono text-xs text-tactical-gray hover:text-off-white transition-colors uppercase">Chính sách bảo mật</a>
            <a href="#terms" className="font-mono text-xs text-tactical-gray hover:text-off-white transition-colors uppercase">Điều khoản dịch vụ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

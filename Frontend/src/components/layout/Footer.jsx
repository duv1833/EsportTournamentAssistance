import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Layers, Mail, MapPin, Trophy, Shield, Globe, MessageSquare } from 'lucide-react';

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
                E<span className="text-primary-red group-hover:text-off-white transition-colors">TA</span>
              </span>
            </Link>
            <p className="font-body text-tactical-gray text-sm leading-relaxed mb-6">
              Hệ thống điều hành và hỗ trợ tổ chức giải đấu Esports chuyên nghiệp. Quản lý sơ đồ thi đấu tự động, đồng bộ hóa thời gian thực và trải nghiệm cấm/chọn chuẩn Valorant.
            </p>
            <div className="flex items-center gap-3 pt-2 font-mono text-xs text-success-cyan">
              <span className="w-2 h-2 rounded-full bg-success-cyan animate-pulse"></span>
              <span>HỆ THỐNG ĐANG HOẠT ĐỘNG // ONLINE</span>
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
            </div>
          </div>

          {/* Column 3: Contact & Info */}
          <div className="flex flex-col gap-6">
            <h4 className="font-display text-lg uppercase tracking-widest text-off-white border-l-2 border-primary-red pl-3">LIÊN HỆ & HỖ TRỢ</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 text-off-white/70">
                <MapPin size={18} className="text-primary-red shrink-0 mt-0.5" />
                <span className="font-body text-sm">TP. Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="flex items-center gap-3 text-off-white/70">
                <Mail size={18} className="text-primary-red shrink-0" />
                <a href="mailto:contact@eta.vn" className="font-mono text-sm hover:text-primary-red transition-colors">contact@eta.vn</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-tactical-gray uppercase">
            © {currentYear} ETA. BẢN QUYỀN ĐƯỢC BẢO LƯU.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-xs text-tactical-gray uppercase">VALORANT IS A REGISTERED TRADEMARK OF RIOT GAMES, INC.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-12 px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-surface-container-lowest border-t-4 border-primary-red">
      <div>
        <span className="font-display text-2xl text-off-white uppercase">TACTICAL EDGE</span>
        <p className="mt-2 font-body text-xs text-tactical-gray">
          © 2024 TACTICAL EDGE. NỀN TẢNG THỂ THAO ĐIỆN TỬ.
        </p>
      </div>
      <div className="flex flex-wrap gap-6 md:justify-end">
        <a className="font-mono text-xs text-primary-red underline hover:text-off-white transition-colors" href="#help">
          Hỗ trợ
        </a>
        <a className="font-mono text-xs text-off-white/70 hover:text-primary-red transition-colors" href="#rules">
          Quy tắc giải đấu
        </a>
        <a className="font-mono text-xs text-off-white/70 hover:text-primary-red transition-colors" href="#privacy">
          Chính sách bảo mật
        </a>
      </div>
    </footer>
  );
}

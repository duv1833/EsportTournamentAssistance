import React from 'react';
import { Shield, BadgeCheck, Mail, Key, ArrowRight, Globe } from 'lucide-react';
import TactileButton from '../common/TactileButton';

export default function RegisterForm({ registerForm, setRegisterForm, onSubmit, isLoading, authError, authSuccess, onSwitchToLogin }) {
  return (
    <div className="container mx-auto max-w-md px-6 py-12 flex flex-col items-center">
      <div className="w-full border border-outline-variant/60 shadow-2xl">
        <div className="bg-surface-charcoal border-b border-outline-variant/60 px-6 py-3 flex justify-between items-center text-[10px] font-mono tracking-widest text-tactical-gray uppercase">
          <span>ĐĂNG KÝ CHIẾN BINH</span>
          <BadgeCheck size={14} className="text-tactical-gray" />
        </div>

        <div className="w-full bg-surface-charcoal border-l-[3px] border-[#ffb3b2] p-8 flex flex-col items-center relative">
          <div className="mb-4">
            <Shield className="w-12 h-12 text-primary-red" strokeWidth={2} />
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-[#ffb3b2] tracking-wider uppercase mb-1 text-center">VALORANT TOURNAMENT ENGINE</h2>
          <p className="font-body text-xs text-tactical-gray mb-6 text-center">Tạo tài khoản để bắt đầu tham gia giải đấu</p>

          {authError && (
            <div className="w-full bg-primary-red/10 border border-primary-red text-primary-red text-xs font-mono p-3 mb-4 text-center">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="w-full bg-success-cyan/10 border border-success-cyan text-success-cyan text-xs font-mono p-3 mb-4 text-center">
              {authSuccess}
            </div>
          )}

          <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
            <div className="w-full flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-tactical-gray uppercase tracking-wider">TÊN HIỂN THỊ [ID]</label>
              <div className="relative flex items-center bg-background border border-outline-variant/60 focus-within:border-primary-red">
                <BadgeCheck className="absolute left-3 text-tactical-gray" size={16} />
                <input
                  type="text"
                  placeholder="Username"
                  disabled={isLoading}
                  className="w-full bg-transparent p-3 pl-10 text-off-white outline-none font-mono text-xs"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-tactical-gray uppercase tracking-wider">ĐỊA CHỈ EMAIL</label>
              <div className="relative flex items-center bg-background border border-outline-variant/60 focus-within:border-primary-red">
                <Mail className="absolute left-3 text-tactical-gray" size={16} />
                <input
                  type="email"
                  placeholder="email@example.com"
                  disabled={isLoading}
                  className="w-full bg-transparent p-3 pl-10 text-off-white outline-none font-mono text-xs"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-tactical-gray uppercase tracking-wider">MẬT KHẨU</label>
              <div className="relative flex items-center bg-background border border-outline-variant/60 focus-within:border-primary-red">
                <Key className="absolute left-3 text-tactical-gray" size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-transparent p-3 pl-10 text-off-white outline-none font-mono text-xs"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-tactical-gray uppercase tracking-wider">NHẬP LẠI MẬT KHẨU</label>
              <div className="relative flex items-center bg-background border border-outline-variant/60 focus-within:border-primary-red">
                <Key className="absolute left-3 text-tactical-gray" size={16} />
                <input
                  type="password"
                  placeholder="***"
                  disabled={isLoading}
                  className="w-full bg-transparent p-3 pl-10 text-off-white outline-none font-mono text-xs"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="w-full flex items-center gap-2 text-[10px] font-mono text-tactical-gray pt-2">
              <input
                type="checkbox"
                className="accent-primary-red bg-background border-outline-variant"
                checked={registerForm.tos}
                onChange={(e) => setRegisterForm({ ...registerForm, tos: e.target.checked })}
              />
              <span>Tôi chấp nhận <a href="#tos" className="text-primary-red hover:underline decoration-dotted">Điều khoản sử dụng (TOS)</a>.</span>
            </div>

            <TactileButton
              type="submit"
              disabled={isLoading}
              className="w-full clip-corner bg-primary-red hover:bg-primary-red/90 text-off-white font-display text-lg py-3.5 flex justify-center items-center gap-2 uppercase font-bold mt-2"
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-2 border-off-white border-t-transparent rounded-full"></span>
              ) : (
                <>ĐĂNG KÝ NGAY <ArrowRight size={16} /></>
              )}
            </TactileButton>
          </form>

          <TactileButton
            type="button"
            className="w-full clip-corner bg-surface-charcoal border border-outline-variant hover:border-tactical-gray text-off-white font-mono text-[11px] py-3.5 flex justify-center items-center gap-2 uppercase mt-4"
          >
            <Globe size={14} /> ĐĂNG KÝ VỚI GOOGLE
          </TactileButton>
        </div>
      </div>

      <div className="mt-6 text-center text-[11px] font-mono text-tactical-gray uppercase">
        Đã là thành viên?{' '}
        <TactileButton
          onClick={onSwitchToLogin}
          className="text-off-white hover:text-primary-red underline font-bold inline"
        >
          QUAY LẠI ĐĂNG NHẬP
        </TactileButton>
      </div>
    </div>
  );
}

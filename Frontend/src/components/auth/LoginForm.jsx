import React from 'react';
import { Shield, User, Lock, ArrowRight, Globe } from 'lucide-react';
import TactileButton from '../common/TactileButton';

export default function LoginForm({ loginForm, setLoginForm, onSubmit, isLoading, authError, authSuccess, onSwitchToRegister }) {
  return (
    <div className="container mx-auto max-w-md px-6 py-16 flex flex-col items-center">
      <div className="w-full bg-surface-charcoal border-l-[3px] border-primary-red p-8 flex flex-col items-center shadow-2xl relative">
        <div className="mb-4">
          <Shield className="w-12 h-12 text-primary-red" strokeWidth={2} />
        </div>

        <h2 className="font-display text-4xl text-off-white tracking-wider uppercase mb-1 text-center">ĐĂNG NHẬP HỆ THỐNG</h2>
        <p className="font-mono text-[10px] text-tactical-gray tracking-widest uppercase mb-6 text-center">TRÌNH QUẢN LÝ GIẢI ĐẤU</p>

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
            <label className="font-mono text-[10px] text-tactical-gray uppercase tracking-wider">■ TÊN ĐĂNG NHẬP HOẶC EMAIL</label>
            <div className="relative flex items-center bg-background border border-outline-variant/60 focus-within:border-primary-red">
              <User className="absolute left-3 text-tactical-gray" size={16} />
              <input
                type="text"
                placeholder="Email/Username"
                disabled={isLoading}
                className="w-full bg-transparent p-3 pl-10 text-off-white outline-none font-mono text-xs"
                value={loginForm.usernameOrEmail}
                onChange={(e) => setLoginForm({ ...loginForm, usernameOrEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-tactical-gray uppercase tracking-wider">■ MẬT KHẨU</label>
            <div className="relative flex items-center bg-background border border-outline-variant/60 focus-within:border-primary-red">
              <Lock className="absolute left-3 text-tactical-gray" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full bg-transparent p-3 pl-10 text-off-white outline-none font-mono text-xs"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
          </div>

          <div className="w-full flex justify-between items-center text-[10px] font-mono text-tactical-gray">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="accent-primary-red bg-background border-outline-variant" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a href="#forgot" className="hover:text-off-white transition-colors underline decoration-dotted">Quên mật khẩu?</a>
          </div>

          <TactileButton
            type="submit"
            disabled={isLoading}
            className="w-full clip-corner bg-primary-red hover:bg-primary-red/90 text-off-white font-display text-lg py-3 flex justify-center items-center gap-2 uppercase font-bold mt-2"
          >
            {isLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-off-white border-t-transparent rounded-full"></span>
            ) : (
              <>ĐĂNG NHẬP <ArrowRight size={16} /></>
            )}
          </TactileButton>
        </form>

        <div className="w-full flex items-center justify-center my-6 gap-2">
          <div className="flex-grow h-[1px] bg-outline-variant/30"></div>
          <span className="font-mono text-[9px] text-tactical-gray uppercase tracking-widest px-2">HOẶC</span>
          <div className="flex-grow h-[1px] bg-outline-variant/30"></div>
        </div>

        <TactileButton
          type="button"
          className="w-full clip-corner bg-surface-charcoal border border-outline-variant hover:border-tactical-gray text-off-white font-mono text-[11px] py-3 flex justify-center items-center gap-2 uppercase"
        >
          <Globe size={14} /> ĐĂNG NHẬP VỚI GOOGLE
        </TactileButton>
      </div>

      <div className="mt-8 text-center text-[11px] font-mono text-tactical-gray uppercase">
        Chưa có tài khoản?{' '}
        <TactileButton
          onClick={onSwitchToRegister}
          className="text-primary-red hover:text-off-white underline font-bold inline"
        >
          ĐĂNG KÝ NGAY
        </TactileButton>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Home, Swords, Trophy, Shield, Newspaper, Gamepad2, Layers, LogOut, Menu, X, ShieldCheck, User, ChevronDown, Settings } from 'lucide-react';
import TactileButton from '../common/TactileButton';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout, onAuthNav }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'TRANG CHỦ', icon: Home },
    { key: 'matches', label: 'LỊCH THI ĐẤU', icon: Swords },
    { key: 'tournaments', label: 'GIẢI ĐẤU', icon: Trophy },
    { key: 'teams', label: 'ĐỘI TUYỂN', icon: Shield },
    { key: 'manage_team', label: 'QUẢN LÝ ĐỘI', icon: ShieldCheck },
    { key: 'news', label: 'TIN TỨC', icon: Newspaper },
    { key: 'lobby', label: 'PHÒNG BAN/PICK', icon: Gamepad2 },
  ];

  // Admin dashboard link is now in the user dropdown

  return (
    <header className="fixed top-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 py-4 bg-background/95 backdrop-blur-sm border-b-2 border-outline-variant">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <Layers className="w-8 h-8 text-primary-red" strokeWidth={2.5} />
          <span className="font-display text-2xl tracking-tighter text-primary-red">TACTICAL EDGE</span>
        </div>
        <nav className="hidden md:flex gap-6">
          {navItems.map(({ key, label }) => (
            <TactileButton
              key={key}
              onClick={() => setActiveTab(key)}
              className={`font-display text-sm uppercase tracking-wider pb-1 ${
                activeTab === key ? 'text-primary-red border-b-2 border-primary-red' : 'text-off-white/70 hover:text-off-white'
              }`}
            >
              {label}
            </TactileButton>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:bg-surface-bright/20 p-2 rounded transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-surface-bright border border-outline-variant flex items-center justify-center overflow-hidden">
                <User size={18} className="text-off-white/70" />
              </div>
              <span className="font-mono text-sm text-off-white hidden sm:block">
                {currentUser.displayName || currentUser.nickname || currentUser.fullName || currentUser.username}
              </span>
              <ChevronDown size={14} className={`text-tactical-gray transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-charcoal border border-outline-variant shadow-lg z-[110] py-2">
                <div className="px-4 py-2 border-b border-outline-variant/50 mb-2">
                  <p className="font-body text-sm font-bold text-off-white">
                    {currentUser.displayName || currentUser.nickname || currentUser.fullName || currentUser.username}
                  </p>
                  <p className="font-mono text-[10px] text-success-cyan truncate">@{currentUser.username}</p>
                  <p className="font-mono text-xs text-tactical-gray truncate mt-0.5">{currentUser.email}</p>
                </div>
                
                <button
                  onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 font-display text-xs uppercase tracking-wider text-off-white/80 hover:bg-surface-bright/40 hover:text-off-white flex items-center gap-2"
                >
                  <Settings size={14} /> Hồ sơ cá nhân
                </button>

                {currentUser.globalRole === 'ADMIN' && (
                  <button
                    onClick={() => { setActiveTab('admin_dashboard'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 font-display text-xs uppercase tracking-wider text-warning-amber hover:bg-surface-bright/40 flex items-center gap-2"
                  >
                    <ShieldCheck size={14} /> Admin Dashboard
                  </button>
                )}

                <div className="border-t border-outline-variant/50 mt-2 pt-2">
                  <button
                    onClick={() => { onLogout(); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 font-display text-xs uppercase tracking-wider text-primary-red hover:bg-surface-bright/40 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <TactileButton
              onClick={() => onAuthNav('login')}
              className={`font-display text-sm uppercase tracking-wider hidden sm:inline-block ${
                activeTab === 'login' ? 'text-primary-red' : 'text-off-white/70 hover:text-off-white'
              }`}
            >
              LOGIN
            </TactileButton>
            <TactileButton
              onClick={() => onAuthNav('register')}
              className="clip-corner bg-primary-red text-off-white font-display text-sm px-6 py-2 uppercase hover:bg-primary-red/90 font-bold hidden sm:inline-block"
            >
              REGISTER
            </TactileButton>
          </>
        )}
        {/* Mobile menu toggle */}
        <TactileButton
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-off-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </TactileButton>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-surface-charcoal border-b-2 border-outline-variant md:hidden z-50">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map(({ key, label, icon: Icon }) => (
              <TactileButton
                key={key}
                onClick={() => { setActiveTab(key); setMobileMenuOpen(false); }}
                className={`font-display text-sm uppercase tracking-wider py-3 px-4 flex items-center gap-3 ${
                  activeTab === key ? 'text-primary-red bg-primary-red/10' : 'text-off-white/70 hover:text-off-white'
                }`}
              >
                <Icon size={16} /> {label}
              </TactileButton>
            ))}
            <div className="border-t border-outline-variant mt-2 pt-3 flex flex-col gap-2">
              {!currentUser ? (
                <>
                  <TactileButton
                    onClick={() => { onAuthNav('login'); setMobileMenuOpen(false); }}
                    className="font-display text-sm uppercase tracking-wider py-3 px-4 text-off-white/70 hover:text-off-white"
                  >
                    LOGIN
                  </TactileButton>
                  <TactileButton
                    onClick={() => { onAuthNav('register'); setMobileMenuOpen(false); }}
                    className="clip-corner bg-primary-red text-off-white font-display text-sm py-3 px-4 uppercase font-bold text-center"
                  >
                    REGISTER
                  </TactileButton>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 border-b border-outline-variant/50 mb-2">
                    <p className="font-body text-sm font-bold text-off-white">{currentUser.username}</p>
                    <p className="font-mono text-xs text-tactical-gray truncate">{currentUser.email}</p>
                  </div>
                  
                  <TactileButton
                    onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                    className="font-display text-sm uppercase tracking-wider py-3 px-4 text-off-white/70 hover:text-off-white flex items-center gap-2"
                  >
                    <Settings size={16} /> HỒ SƠ CÁ NHÂN
                  </TactileButton>

                  {currentUser.globalRole === 'ADMIN' && (
                    <TactileButton
                      onClick={() => { setActiveTab('admin_dashboard'); setMobileMenuOpen(false); }}
                      className="font-display text-sm uppercase tracking-wider py-3 px-4 text-warning-amber hover:text-warning-amber/80 flex items-center gap-2"
                    >
                      <ShieldCheck size={16} /> ADMIN DASHBOARD
                    </TactileButton>
                  )}

                  <TactileButton
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="font-display text-sm uppercase tracking-wider py-3 px-4 text-primary-red hover:text-off-white flex items-center gap-2"
                  >
                    <LogOut size={16} /> ĐĂNG XUẤT
                  </TactileButton>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

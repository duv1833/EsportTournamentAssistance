import React, { useState } from 'react';
import { Home, Swords, Trophy, Shield, Newspaper, Gamepad2, Layers, LogOut, Menu, X } from 'lucide-react';
import TactileButton from '../common/TactileButton';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout, onAuthNav }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'TRANG CHỦ', icon: Home },
    { key: 'matches', label: 'LỊCH THI ĐẤU', icon: Swords },
    { key: 'tournaments', label: 'GIẢI ĐẤU', icon: Trophy },
    { key: 'manage_team', label: 'QUẢN LÝ ĐỘI', icon: Shield },
    { key: 'news', label: 'TIN TỨC', icon: Newspaper },
    { key: 'lobby', label: 'PHÒNG BAN/PICK', icon: Gamepad2 },
  ];

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-background/95 backdrop-blur-sm border-b-2 border-outline-variant">
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
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-success-cyan uppercase tracking-wider hidden sm:inline-block">
              // WELCOME, {currentUser.username}
            </span>
            <TactileButton
              onClick={onLogout}
              className="font-display text-sm uppercase tracking-wider text-primary-red hover:text-off-white flex items-center gap-1.5"
            >
              <LogOut size={14} /> LOGOUT
            </TactileButton>
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
                <TactileButton
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="font-display text-sm uppercase tracking-wider py-3 px-4 text-primary-red hover:text-off-white flex items-center gap-2"
                >
                  <LogOut size={14} /> LOGOUT
                </TactileButton>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Swords, Trophy, Shield, Newspaper, Layers, LogOut, Menu, X, ShieldCheck, User, ChevronDown, Settings, Medal } from 'lucide-react';
import TactileButton from '../common/TactileButton';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { path: '/', label: 'TRANG CHỦ', icon: Home },
    { path: '/matches', label: 'LỊCH THI ĐẤU', icon: Swords },
    { path: '/tournaments', label: 'GIẢI ĐẤU', icon: Trophy },
    { path: '/teams', label: 'ĐỘI TUYỂN', icon: Shield },
    { path: '/manage-team', label: 'QUẢN LÝ ĐỘI', icon: ShieldCheck },
    { path: '/news', label: 'TIN TỨC', icon: Newspaper },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`fixed top-0 w-full z-[100] transition-all duration-300 flex justify-between items-center px-6 md:px-12 py-4 border-b-2 border-outline-variant ${scrolled ? 'bg-background/80 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-background/95 backdrop-blur-sm'}`}>
      <div className="flex items-center gap-8">
        <NavLink to="/" className="flex items-center gap-3 cursor-pointer">
          <Layers className="w-8 h-8 text-primary-red" strokeWidth={2.5} />
          <span className="font-display text-2xl tracking-tighter text-primary-red">ETA</span>
        </NavLink>

        <nav className="hidden md:flex gap-6">
          {navItems.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `font-display text-sm uppercase tracking-wider pb-1 transition-colors ${
                isActive ? 'text-primary-red border-b-2 border-primary-red' : 'text-off-white/70 hover:text-off-white'
              }`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {currentUser && <NotificationDropdown />}
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:bg-surface-bright/30 p-2 rounded transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-surface-bright border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-off-white/70" />
                )}
              </div>
              <span className="font-mono text-sm text-off-white hidden sm:block">
                {currentUser.displayName || currentUser.nickname || currentUser.fullName || currentUser.username}
              </span>
              <ChevronDown size={14} className={`text-tactical-gray transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-charcoal border border-outline-variant shadow-2xl z-[110] py-2 clip-corner animate-scale-in">
                <div className="px-4 py-2 border-b border-outline-variant/50 mb-2">
                  <p className="font-body text-sm font-bold text-off-white truncate">
                    {currentUser.displayName || currentUser.nickname || currentUser.fullName || currentUser.username}
                  </p>
                  <p className="font-mono text-[10px] text-success-cyan truncate">@{currentUser.username}</p>
                  <p className="font-mono text-xs text-tactical-gray truncate mt-0.5">{currentUser.email}</p>
                </div>

                <button
                  onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 font-display text-xs uppercase tracking-wider text-off-white/80 hover:bg-surface-bright/40 hover:text-off-white flex items-center gap-2 transition-colors"
                >
                  <Settings size={14} /> Hồ sơ cá nhân
                </button>

                {currentUser.globalRole === 'ADMIN' && (
                  <button
                    onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 font-display text-xs uppercase tracking-wider text-warning-amber hover:bg-surface-bright/40 flex items-center gap-2 transition-colors"
                  >
                    <ShieldCheck size={14} /> Admin Dashboard
                  </button>
                )}

                <div className="border-t border-outline-variant/50 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 font-display text-xs uppercase tracking-wider text-primary-red hover:bg-surface-bright/40 flex items-center gap-2 transition-colors"
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
              variant="ghost"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-block font-display text-sm uppercase tracking-wider"
            >
              LOGIN
            </TactileButton>
            <TactileButton
              variant="primary"
              onClick={() => navigate('/register')}
              className="hidden sm:inline-block"
            >
              REGISTER
            </TactileButton>
          </>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-off-white p-1"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-surface-charcoal border-b-2 border-outline-variant md:hidden z-50 animate-slide-up">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `font-display text-sm uppercase tracking-wider py-3 px-4 flex items-center gap-3 transition-colors ${
                  isActive ? 'text-primary-red bg-primary-red/10 border-l-2 border-primary-red' : 'text-off-white/70 hover:text-off-white'
                }`}
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}

            <div className="border-t border-outline-variant mt-2 pt-3 flex flex-col gap-2">
              {!currentUser ? (
                <>
                  <TactileButton
                    variant="ghost"
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="w-full justify-center"
                  >
                    LOGIN
                  </TactileButton>
                  <TactileButton
                    variant="primary"
                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                    className="w-full justify-center"
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
                    variant="ghost"
                    onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                    className="w-full justify-start gap-2"
                  >
                    <Settings size={16} /> HỒ SƠ CÁ NHÂN
                  </TactileButton>

                  {currentUser.globalRole === 'ADMIN' && (
                    <TactileButton
                      variant="ghost"
                      onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                      className="w-full justify-start gap-2 text-warning-amber"
                    >
                      <ShieldCheck size={16} /> ADMIN DASHBOARD
                    </TactileButton>
                  )}

                  <TactileButton
                    variant="danger"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full justify-start gap-2"
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

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Shield, Swords, Check, X, CheckCheck, RefreshCw, Zap, Clock, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    acceptRequest,
    rejectRequest,
    refreshNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'INVITE' | 'MATCH'
  const [actionLoading, setActionLoading] = useState({});
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccept = async (e, notif) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [notif.id]: 'accept' }));
    try {
      await acceptRequest(notif.teamId, notif.memberId, notif.captainId);
      markAsRead(notif.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận!');
    } finally {
      setActionLoading(prev => ({ ...prev, [notif.id]: null }));
    }
  };

  const handleReject = async (e, notif) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [notif.id]: 'reject' }));
    try {
      await rejectRequest(notif.teamId, notif.memberId, notif.captainId);
      markAsRead(notif.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối!');
    } finally {
      setActionLoading(prev => ({ ...prev, [notif.id]: null }));
    }
  };

  const handleItemClick = (notif) => {
    markAsRead(notif.id);
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'INVITE') return n.type === 'TEAM_INVITE' || n.type === 'JOIN_REQUEST';
    if (filter === 'MATCH') return n.type === 'MATCH_LIVE' || n.type === 'MATCH_UPCOMING';
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-off-white/80 hover:text-off-white hover:bg-surface-bright/50 rounded-lg transition-colors focus:outline-none"
        title="Thông báo"
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-warning-amber' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-red text-[10px] font-bold text-off-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface-charcoal border-2 border-outline-variant shadow-2xl z-[200] clip-corner animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between bg-background/50">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-primary-red" />
              <h3 className="font-display text-sm uppercase tracking-wider text-off-white font-bold">
                THÔNG BÁO {unreadCount > 0 && <span className="text-warning-amber">({unreadCount})</span>}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshNotifications}
                className="text-tactical-gray hover:text-off-white p-1 rounded transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-tactical-gray hover:text-primary-red font-mono text-[10px] uppercase flex items-center gap-1 transition-colors"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck size={14} /> Đã đọc hết
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-outline-variant/40 bg-background/30 font-mono text-[11px]">
            {[
              { key: 'ALL', label: 'TẤT CẢ' },
              { key: 'INVITE', label: 'ĐỘI TUYỂN' },
              { key: 'MATCH', label: 'THI ĐẤU' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-2 text-center uppercase tracking-wider transition-colors border-b-2 ${
                  filter === tab.key
                    ? 'border-primary-red text-primary-red font-bold bg-primary-red/10'
                    : 'border-transparent text-tactical-gray hover:text-off-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List Container */}
          <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant/30 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-tactical-gray">
                <Info size={32} className="mx-auto mb-2 opacity-40" />
                <p className="font-mono text-xs uppercase">Không có thông báo nào</p>
              </div>
            ) : (
              filteredNotifications.map(notif => {
                const isInvite = notif.type === 'TEAM_INVITE' || notif.type === 'JOIN_REQUEST';
                const isLive = notif.type === 'MATCH_LIVE';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer relative ${
                      !notif.isRead ? 'bg-primary-red/5 hover:bg-primary-red/10' : 'hover:bg-surface-bright/30'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!notif.isRead && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary-red animate-pulse"></span>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">
                        {isInvite ? (
                          <div className="w-8 h-8 rounded bg-warning-amber/15 border border-warning-amber/40 flex items-center justify-center text-warning-amber">
                            <Shield size={16} />
                          </div>
                        ) : isLive ? (
                          <div className="w-8 h-8 rounded bg-primary-red/20 border border-primary-red/50 flex items-center justify-center text-primary-red animate-pulse">
                            <Zap size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-success-cyan/15 border border-success-cyan/40 flex items-center justify-center text-success-cyan">
                            <Swords size={16} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-display text-xs font-bold uppercase text-off-white tracking-wide">
                          {notif.title}
                        </h4>
                        <p className="font-body text-xs text-tactical-gray mt-1 leading-relaxed">
                          {notif.message}
                        </p>

                        {/* Interactive Buttons for Invites */}
                        {notif.hasActions && (
                          <div className="mt-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={e => handleAccept(e, notif)}
                              disabled={actionLoading[notif.id]}
                              className="px-3 py-1.5 bg-success-cyan/20 border border-success-cyan text-success-cyan hover:bg-success-cyan hover:text-background font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 transition-all"
                            >
                              <Check size={12} /> {actionLoading[notif.id] === 'accept' ? 'ĐANG LƯU...' : 'ĐỒNG Ý'}
                            </button>
                            <button
                              onClick={e => handleReject(e, notif)}
                              disabled={actionLoading[notif.id]}
                              className="px-3 py-1.5 bg-primary-red/15 border border-primary-red/50 text-primary-red hover:bg-primary-red hover:text-off-white font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 transition-all"
                            >
                              <X size={12} /> {actionLoading[notif.id] === 'reject' ? 'ĐANG XỬ LÝ...' : 'TỪ CHỐI'}
                            </button>
                          </div>
                        )}

                        {/* Direct Action Link for Live Matches */}
                        {notif.actionLabel && (
                          <div className="mt-2.5">
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-success-cyan hover:underline uppercase tracking-wider font-bold">
                              {notif.actionLabel} &rarr;
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2.5 border-t border-outline-variant/40 text-center bg-background/50">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/manage-team');
              }}
              className="font-mono text-[10px] text-tactical-gray hover:text-off-white uppercase tracking-wider transition-colors"
            >
              Quản lý Đội tuyển & Lời mời &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../../services/userService';
import { Search, User as UserIcon, Loader2, Check, X } from 'lucide-react';

export default function UserAutocompleteInput({ selectedUsers = [], onSelectedUsersChange, placeholder }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeSelectedUsers = Array.isArray(selectedUsers) ? selectedUsers : [];

  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setLoading(false);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await userService.searchUsers(query.trim());
        const users = (res?.success && Array.isArray(res.data)) ? res.data : (Array.isArray(res) ? res : []);
        
        // Filter out users already selected in chips
        const unselected = users.filter(
          u => !safeSelectedUsers.some(sel => sel.id === u.id || sel.username === u.username)
        );

        setSuggestions(unselected);
        setShowDropdown(unselected.length > 0);
      } catch (err) {
        console.warn('Lỗi khi gợi ý người chơi:', err);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedUsers]);

  const handleSelect = (user) => {
    const nextList = [...safeSelectedUsers, user];
    if (onSelectedUsersChange) onSelectedUsersChange(nextList);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleRemove = (userId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextList = safeSelectedUsers.filter(u => u.id !== userId);
    if (onSelectedUsersChange) onSelectedUsersChange(nextList);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && query === '' && safeSelectedUsers.length > 0) {
      const nextList = safeSelectedUsers.slice(0, safeSelectedUsers.length - 1);
      if (onSelectedUsersChange) onSelectedUsersChange(nextList);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Outer Box containing Chips + Editable Text Input */}
      <div 
        onClick={() => inputRef.current && inputRef.current.focus()}
        className="w-full bg-surface-charcoal border border-outline-variant p-2 flex flex-wrap items-center gap-1.5 focus-within:border-primary-red min-h-[42px] cursor-text transition-colors"
      >
        {/* Selected User Chips */}
        {safeSelectedUsers.map((user) => (
          <span 
            key={user.id} 
            className="inline-flex items-center gap-1.5 bg-primary-red/15 border border-primary-red/50 text-off-white text-xs px-2 py-1 clip-corner font-mono animate-scale-in"
          >
            <div className="w-4 h-4 rounded-full bg-background border border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={10} className="text-tactical-gray" />
              )}
            </div>
            <span className="font-bold text-off-white">
              {user.displayName || user.nickname || user.username}
            </span>
            <button
              type="button"
              onClick={(e) => handleRemove(user.id, e)}
              className="text-tactical-gray hover:text-primary-red p-0.5 rounded-full hover:bg-primary-red/20 transition-colors ml-0.5"
              title="Bỏ người chơi này"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* Dynamic Text Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={
            safeSelectedUsers.length === 0 
              ? (placeholder || "Nhập Username hoặc Email người chơi...") 
              : "Nhập tìm thêm người chơi khác..."
          }
          autoComplete="off"
          className="flex-1 bg-transparent border-none outline-none text-xs text-off-white font-mono min-w-[140px] px-1 py-1"
        />

        <div className="ml-auto pointer-events-none text-tactical-gray px-1">
          {loading ? <Loader2 size={13} className="animate-spin text-primary-red" /> : <Search size={13} />}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface-charcoal border-2 border-outline-variant shadow-2xl z-[150] max-h-52 overflow-y-auto divide-y divide-outline-variant/30 custom-scrollbar animate-in fade-in duration-150 rounded-b">
          <div className="px-3 py-1.5 bg-background/50 font-mono text-[9px] text-tactical-gray uppercase tracking-wider flex justify-between">
            <span>GỢI Ý NGƯỜI CHƠI ({suggestions.length})</span>
            <span>CLICK ĐỂ CHỌN THÊM</span>
          </div>
          {suggestions.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelect(user)}
              className="p-2.5 hover:bg-primary-red/15 cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-background border border-outline-variant flex items-center justify-center shrink-0 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={14} className="text-tactical-gray" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xs text-off-white group-hover:text-primary-red truncate font-bold">
                    {user.displayName || user.fullName || user.nickname || user.username}
                  </div>
                  <div className="font-mono text-[10px] text-tactical-gray truncate">
                    @{user.username} • <span className="text-off-white/60">{user.email}</span>
                  </div>
                </div>
              </div>
              <span className="font-mono text-[9px] uppercase px-2 py-0.5 border border-outline-variant/60 text-tactical-gray group-hover:border-primary-red group-hover:bg-primary-red group-hover:text-off-white shrink-0 ml-2 font-bold transition-all flex items-center gap-1">
                <Check size={10} /> THÊM
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

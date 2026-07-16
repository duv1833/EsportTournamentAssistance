import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User, Mail, Phone, BadgeCheck, Save, Sparkles, AlertCircle, Check } from 'lucide-react';

function TactileButton({ children, className = '', ...props }) {
  return (
    <button
      className={`transition-all active:scale-[0.97] active:-translate-y-[0.5px] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function UserProfile({ currentUser, onUserUpdated }) {
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    nickname: currentUser?.nickname || '',
    phoneNumber: currentUser?.phoneNumber || '',
    avatarUrl: currentUser?.avatarUrl || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        nickname: currentUser.nickname || '',
        phoneNumber: currentUser.phoneNumber || '',
        avatarUrl: currentUser.avatarUrl || ''
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await userService.updateUserProfile(currentUser.id, formData);
      if (res.success) {
        setSuccess('Cập nhật thông tin cá nhân thành công!');
        const updatedUser = {
          ...currentUser,
          fullName: res.data.fullName,
          nickname: res.data.nickname,
          phoneNumber: res.data.phoneNumber,
          avatarUrl: res.data.avatarUrl,
          displayName: res.data.displayName
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (onUserUpdated) {
          onUserUpdated(updatedUser);
        }
      } else {
        setError(res.message || 'Cập nhật hồ sơ thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi cập nhật hồ sơ!');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewDisplayName = () => {
    if (formData.nickname && formData.nickname.trim()) return formData.nickname.trim();
    if (formData.fullName && formData.fullName.trim()) return formData.fullName.trim();
    return currentUser?.username || 'Gamer';
  };

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 border-b border-outline-variant pb-6">
        <h2 className="font-display text-4xl text-off-white uppercase tracking-wider flex items-center gap-3">
          <User className="text-primary-red" size={32} /> HỒ SƠ CÁ NHÂN
        </h2>
        <p className="font-mono text-xs text-tactical-gray mt-2">// Cập nhật thông tin nhận diện trên hệ thống giải đấu</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-primary-red/10 border border-primary-red text-primary-red font-mono text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success-cyan/10 border border-success-cyan text-success-cyan font-mono text-sm flex items-center gap-2">
          <Check size={16} /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Avatar Card Preview */}
        <div className="bg-surface-charcoal border border-outline-variant p-6 clip-corner flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-surface-bright border-2 border-primary-red/60 p-1 mb-4 flex items-center justify-center overflow-hidden shadow-lg relative">
            {formData.avatarUrl ? (
              <img
                src={formData.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <User size={40} className="text-tactical-gray" />
            )}
          </div>

          <h3 className="font-display text-xl text-off-white uppercase font-bold truncate max-w-full">
            {getPreviewDisplayName()}
          </h3>
          <p className="font-mono text-xs text-success-cyan mt-1">@{currentUser?.username}</p>
          <span className="mt-3 inline-block font-mono text-[10px] bg-primary-red/20 text-primary-red px-3 py-1 uppercase tracking-wider border border-primary-red/30">
            {currentUser?.globalRole || 'USER'}
          </span>

          <div className="w-full mt-6 pt-6 border-t border-outline-variant/60 text-left space-y-2 font-mono text-xs text-tactical-gray">
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-primary-red" /> {currentUser?.email}
            </p>
            {formData.phoneNumber && (
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-success-cyan" /> {formData.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Profile Edit Form */}
        <div className="md:col-span-2 bg-surface-charcoal border border-outline-variant p-6 md:p-8 clip-corner">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username (Disabled) */}
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Tên Đăng Nhập (Cố định)</label>
                <input
                  type="text"
                  value={currentUser?.username || ''}
                  disabled
                  className="w-full bg-background/50 border border-outline-variant/40 p-3 text-tactical-gray font-mono text-sm cursor-not-allowed"
                />
              </div>

              {/* Email (Disabled) */}
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Email (Cố định)</label>
                <input
                  type="text"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full bg-background/50 border border-outline-variant/40 p-3 text-tactical-gray font-mono text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label className="block font-mono text-xs uppercase text-warning-amber mb-1.5 flex items-center gap-1.5">
                <Sparkles size={14} /> Nickname / Biệt Danh Hiển Thị Giải Đấu
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="VD: Faker, Cap, SGP_Pro..."
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
              />
              <p className="font-mono text-[10px] text-tactical-gray mt-1.5">
                * Ưu tiên hiển thị Nickname nếu được cài đặt. Nếu để trống sẽ hiển thị Họ và Tên.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Họ và Tên đầy đủ</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Số điện thoại liên hệ</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="VD: 0912345678"
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">URL Ảnh Đại Diện (Avatar)</label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="Dán link ảnh đại diện (URL)..."
                className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-xs focus:outline-none focus:border-primary-red"
              />
            </div>

            <div className="pt-4 border-t border-outline-variant">
              <TactileButton
                type="submit"
                disabled={loading}
                className="w-full bg-primary-red hover:bg-primary-red/90 text-off-white font-display text-sm py-3 uppercase font-bold tracking-wider flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} /> {loading ? 'ĐANG LƯU...' : 'CẬP NHẬT HỒ SƠ'}
              </TactileButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

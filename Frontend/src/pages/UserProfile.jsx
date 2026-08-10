import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User, Mail, Phone, Save, Sparkles, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TactileButton from '../components/common/TactileButton';

export default function UserProfile({ currentUser: propUser, onUserUpdated }) {
  const { currentUser: authUser, updateUser } = useAuth();
  const currentUser = propUser || authUser;

  const parseNickname = (nick, id) => {
    if (!nick || !nick.trim()) {
      return { ignName: '', ignTag: String(id || '0001').padStart(4, '0') };
    }
    const parts = nick.split('#');
    if (parts.length >= 2) {
      return { ignName: parts[0].trim(), ignTag: parts.slice(1).join('#').trim() };
    }
    return { ignName: nick.trim(), ignTag: String(id || '0001').padStart(4, '0') };
  };

  const initialNick = parseNickname(currentUser?.nickname, currentUser?.id);

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    ignName: initialNick.ignName,
    ignTag: initialNick.ignTag,
    phoneNumber: currentUser?.phoneNumber || '',
    avatarUrl: currentUser?.avatarUrl || '',
    email: currentUser?.email || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.id) {
        try {
          const res = await userService.getUserProfile(currentUser.id);
          if (res.success && res.data) {
            const parsed = parseNickname(res.data.nickname, currentUser.id);
            setFormData({
              fullName: res.data.fullName || '',
              ignName: parsed.ignName,
              ignTag: parsed.ignTag,
              phoneNumber: res.data.phoneNumber || '',
              avatarUrl: res.data.avatarUrl || '',
              email: res.data.email || ''
            });
            const updatedUserData = {
              ...currentUser,
              fullName: res.data.fullName,
              nickname: res.data.nickname,
              phoneNumber: res.data.phoneNumber,
              avatarUrl: res.data.avatarUrl,
              displayName: res.data.displayName,
              email: res.data.email
            };
            updateUser(updatedUserData);
          }
        } catch (err) {
          console.error("Lỗi khi tải thông tin cá nhân từ server:", err);
          if (currentUser) {
            const parsed = parseNickname(currentUser.nickname, currentUser.id);
            setFormData({
              fullName: currentUser.fullName || '',
              ignName: parsed.ignName,
              ignTag: parsed.ignTag,
              phoneNumber: currentUser.phoneNumber || '',
              avatarUrl: currentUser.avatarUrl || '',
              email: currentUser.email || ''
            });
          }
        }
      }
    };
    loadProfile();
  }, [currentUser?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    // 1. Validate Email
    if (formData.email && formData.email.trim()) {
      const emailStr = formData.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailStr)) {
        setError('Địa chỉ Email không hợp lệ!');
        return;
      }
    }

    // 2. Validate Nickname / In-Game Name & Tag
    let combinedNickname = '';
    if (formData.ignName && formData.ignName.trim()) {
      const tag = formData.ignTag && formData.ignTag.trim() ? formData.ignTag.trim().replace(/^#/, '') : '0001';
      combinedNickname = `${formData.ignName.trim()}#${tag}`;
      const nickRegex = /^[a-zA-Z0-9_\s]{2,20}#[a-zA-Z0-9]{2,6}$/;
      if (!nickRegex.test(combinedNickname)) {
        setError('Tên In-Game phải có từ 2-20 ký tự và Tag từ 2-6 ký tự chữ hoặc số!');
        return;
      }
    }

    // 3. Validate Full Name
    if (formData.fullName && formData.fullName.trim()) {
      const name = formData.fullName.trim();
      if (name.length < 2 || name.length > 50) {
        setError('Họ và tên phải có độ dài từ 2 đến 50 ký tự!');
        return;
      }
      const nameRegex = /^[a-zA-ZÀ-ỹ\s'-]+$/;
      if (!nameRegex.test(name)) {
        setError('Họ và tên chỉ được chứa chữ cái và khoảng trắng, không chứa số hoặc ký tự đặc biệt!');
        return;
      }
    }

    // 4. Validate Phone Number (VN format)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phone = formData.phoneNumber.trim();
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(phone)) {
        setError('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số (Ví dụ: 0912345678, 0387654321)');
        return;
      }
    }

    // 5. Validate Avatar URL
    if (formData.avatarUrl && formData.avatarUrl.trim()) {
      const url = formData.avatarUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setError('URL Ảnh đại diện phải bắt đầu bằng http:// hoặc https://');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        fullName: formData.fullName,
        nickname: combinedNickname,
        phoneNumber: formData.phoneNumber,
        avatarUrl: formData.avatarUrl,
        email: formData.email
      };
      const res = await userService.updateUserProfile(currentUser.id, payload);
      if (res.success) {
        setSuccess('Cập nhật thông tin cá nhân thành công!');
        const updatedUserData = {
          ...currentUser,
          fullName: res.data.fullName,
          nickname: res.data.nickname,
          phoneNumber: res.data.phoneNumber,
          avatarUrl: res.data.avatarUrl,
          displayName: res.data.displayName,
          email: res.data.email
        };
        updateUser(updatedUserData);
        if (onUserUpdated) {
          onUserUpdated(updatedUserData);
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
    if (formData.ignName && formData.ignName.trim()) {
      const tag = formData.ignTag && formData.ignTag.trim() ? formData.ignTag.trim().replace(/^#/, '') : '';
      return tag ? `${formData.ignName.trim()}#${tag}` : formData.ignName.trim();
    }
    if (formData.fullName && formData.fullName.trim()) return formData.fullName.trim();
    return currentUser?.username || 'Gamer';
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12 text-center animate-fade-in">
        <div className="bg-surface-charcoal border border-outline-variant p-12 clip-corner">
          <User size={48} className="text-tactical-gray mx-auto mb-4" />
          <h2 className="font-display text-2xl text-off-white uppercase mb-2">VUI LÒNG ĐĂNG NHẬP</h2>
          <p className="font-mono text-sm text-tactical-gray">Bạn cần đăng nhập để xem và cập nhật hồ sơ cá nhân.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-6 py-12 animate-fade-in">
      <div className="mb-10 border-b border-outline-variant pb-6">
        <h2 className="font-display text-4xl text-off-white uppercase flex items-center gap-3">
          <User className="text-primary-red" size={32} /> HỒ SƠ CÁ NHÂN
        </h2>
        <p className="font-mono text-xs text-tactical-gray mt-2">// Cập nhật thông tin nhận diện trên hệ thống giải đấu</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-primary-red/10 border border-primary-red text-primary-red font-mono text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success-cyan/10 border border-success-cyan text-success-cyan font-mono text-xs flex items-center gap-2">
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
            <p className="flex items-center gap-2 truncate">
              <Mail size={14} className="text-primary-red shrink-0" /> <span className="truncate">{currentUser?.email}</span>
            </p>
            {formData.phoneNumber && (
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-success-cyan shrink-0" /> {formData.phoneNumber}
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

              {/* Email (Editable) */}
              <div>
                <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5 flex items-center gap-1">
                  <Mail size={12} /> Địa Chỉ Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="VD: user@example.com"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                />
              </div>
            </div>

            {/* Nickname / In-Game Name & Tag (2 Separate Fields) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-mono text-xs uppercase text-warning-amber mb-1.5 flex items-center gap-1.5 font-bold">
                  <Sparkles size={14} /> Tên In-Game (IGN)
                </label>
                <input
                  type="text"
                  value={formData.ignName}
                  onChange={(e) => setFormData({ ...formData, ignName: e.target.value })}
                  placeholder="VD: PRX_CAPTAIN, TenZ, Faker"
                  className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-warning-amber mb-1.5 flex items-center gap-1.5 font-bold">
                  #TAG
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-warning-amber font-mono font-bold">#</span>
                  <input
                    type="text"
                    value={formData.ignTag}
                    onChange={(e) => setFormData({ ...formData, ignTag: e.target.value.replace(/^#/, '') })}
                    placeholder="0011"
                    className="w-full bg-background border border-outline-variant p-3 pl-7 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red uppercase"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <p className="font-mono text-[10px] text-warning-amber">
                  * Tên In-Game hoàn chỉnh: <b className="text-off-white font-bold">{formData.ignName ? `${formData.ignName.trim()}#${formData.ignTag ? formData.ignTag.trim().replace(/^#/, '') : '0001'}` : 'Chưa thiết lập'}</b>. Thông tin này sẽ tự động điền khi bạn đăng ký tạo đội tham gia giải đấu.
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Họ và Tên Đầy Đủ</label>
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
              <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Số Điện Thoại Liên Hệ</label>
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
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full justify-center flex items-center gap-2"
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

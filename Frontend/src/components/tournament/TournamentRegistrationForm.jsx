import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Upload } from 'lucide-react';
import { registerForTournament } from '../../services/tournamentService';
import { useAuth } from '../../contexts/AuthContext';
import TactileButton from '../common/TactileButton';

export default function TournamentRegistrationForm({ tournament, onCancel, onSuccess }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    teamName: '',
    teamTag: '',
    captainInGameName: '',
    captainPhoneNumber: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Bạn cần đăng nhập để đăng ký giải đấu!');
      return;
    }
    if (!tournament) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await registerForTournament(
        tournament.id,
        formData.teamName,
        formData.teamTag,
        currentUser.id,
        formData.captainInGameName,
        formData.logoUrl,
        formData.captainPhoneNumber
      );

      if (res.success) {
        setSuccess('Đăng ký tham gia giải đấu thành công! Đang chờ Ban Tổ Chức duyệt.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(res.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi hệ thống khi gửi đăng ký!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-surface-charcoal border border-outline-variant p-8 clip-corner relative my-8 shadow-2xl animate-fade-in">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-tactical-gray hover:text-off-white transition-colors"
          type="button"
        >
          <X size={20} />
        </button>
      )}

      <h3 className="font-display text-2xl text-off-white uppercase mb-1">Đăng Ký Tham Gia Giải Đấu</h3>
      <p className="font-mono text-xs text-success-cyan mb-6">// Giải đấu: {tournament?.name}</p>

      {error && (
        <div className="bg-primary-red/10 border border-primary-red text-primary-red p-3 mb-4 text-xs font-mono flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-success-cyan/10 border border-success-cyan text-success-cyan p-3 mb-4 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <p className="font-body text-xs text-tactical-gray mb-6 leading-relaxed">
        Để đăng ký tham gia, vui lòng nhập đầy đủ thông tin đội tuyển của bạn. Bạn sẽ tự động trở thành Đội Trưởng (Captain) của đội tuyển này.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">
            Tên Đội Tuyển <span className="text-primary-red">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="VD: Saigon Phantom"
            value={formData.teamName}
            onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
            className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">
            Tag Đội Tuyển (2-5 ký tự) <span className="text-primary-red">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={5}
            placeholder="VD: SGP"
            value={formData.teamTag}
            onChange={(e) => setFormData({ ...formData, teamTag: e.target.value.toUpperCase() })}
            className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red uppercase"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">
            In-Game Name của Đội Trưởng <span className="text-primary-red">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="VD: SGP.Bâng#123"
            value={formData.captainInGameName}
            onChange={(e) => setFormData({ ...formData, captainInGameName: e.target.value })}
            className="w-full bg-background border border-outline-variant p-3 text-off-white font-body text-sm focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">
            Số Điện Thoại Liên Hệ <span className="text-primary-red">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="VD: 0912345678"
            value={formData.captainPhoneNumber}
            onChange={(e) => setFormData({ ...formData, captainPhoneNumber: e.target.value })}
            className="w-full bg-background border border-outline-variant p-3 text-off-white font-mono text-sm focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-tactical-gray mb-1.5">Logo Đội Tuyển (Tùy chọn)</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({ ...formData, logoUrl: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full bg-background border border-outline-variant p-2 text-off-white font-mono text-xs focus:outline-none focus:border-primary-red file:mr-3 file:py-1 file:px-3 file:bg-surface-bright file:text-off-white file:border-0 file:font-mono file:text-xs hover:file:bg-primary-red cursor-pointer"
            />
            <input
              type="url"
              placeholder="Hoặc dán URL link ảnh logo..."
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full bg-background border border-outline-variant p-2.5 text-off-white font-mono text-xs focus:outline-none focus:border-primary-red"
            />
          </div>

          {formData.logoUrl && (
            <div className="mt-3 flex items-center gap-3 p-2 bg-background/60 border border-outline-variant">
              <img
                src={formData.logoUrl}
                alt="Logo Preview"
                className="w-10 h-10 object-cover rounded border border-outline-variant"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="font-mono text-[10px] text-success-cyan">// Xem trước Logo thành công</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-3">
          {onCancel && (
            <TactileButton
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="w-full"
            >
              HỦY BỎ
            </TactileButton>
          )}
          <TactileButton
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'ĐANG GỬI...' : 'GỬI ĐĂNG KÝ'}
          </TactileButton>
        </div>
      </form>
    </div>
  );
}

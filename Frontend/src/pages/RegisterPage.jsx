import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    tos: false
  });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.phoneNumber || !registerForm.nickname || !registerForm.password || !registerForm.confirmPassword) {
      setAuthError('Vui lòng điền đầy đủ các thông tin đăng ký (gồm Số điện thoại và Riot ID)!');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(registerForm.username.trim())) {
      setAuthError('Tên đăng nhập phải từ 3-20 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email.trim())) {
      setAuthError('Email không hợp lệ!');
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9][0-9]{8}|0[0-9]{9,10}|\+?[0-9]{9,12})$/;
    if (!phoneRegex.test(registerForm.phoneNumber.trim())) {
      setAuthError('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại hợp lệ (VD: 0912345678).');
      return;
    }

    const riotIdRegex = /^.+#.{1,6}$/;
    if (!riotIdRegex.test(registerForm.nickname.trim())) {
      setAuthError('Riot ID In-game không hợp lệ! Bắt buộc nhập đúng định dạng TênIngame#TAG (Ví dụ: TenZ#SEN, Player#VN1).');
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{12,}$/;
    if (!passwordRegex.test(registerForm.password)) {
      setAuthError('Mật khẩu phải có ít nhất 12 ký tự, bao gồm ít nhất 1 chữ số và 1 ký tự đặc biệt (!@#$%...)!');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Mật khẩu nhập lại không khớp!');
      return;
    }
    if (!registerForm.tos) {
      setAuthError('Bạn phải chấp nhận Điều khoản sử dụng (TOS)!');
      return;
    }

    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);

    try {
      const data = await register(
        registerForm.username.trim(),
        registerForm.email.trim(),
        registerForm.password,
        registerForm.phoneNumber.trim(),
        registerForm.nickname.trim()
      );
      if (data.success) {
        setAuthSuccess(data.message || 'Đăng ký tài khoản thành công!');
        setRegisterForm({ username: '', email: '', phoneNumber: '', nickname: '', password: '', confirmPassword: '', tos: false });
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setAuthError(data.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 animate-fade-in">
      <RegisterForm
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        onSubmit={handleRegisterSubmit}
        isLoading={isLoading}
        authError={authError}
        authSuccess={authSuccess}
        onSwitchToLogin={() => navigate('/login')}
      />
    </div>
  );
}

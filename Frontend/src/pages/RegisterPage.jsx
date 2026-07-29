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
    password: '',
    confirmPassword: '',
    tos: false
  });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setAuthError('Vui lòng điền đầy đủ các thông tin đăng ký!');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(registerForm.username)) {
      setAuthError('Tên đăng nhập phải từ 3-20 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setAuthError('Email không hợp lệ!');
      return;
    }

    if (registerForm.password.length < 6) {
      setAuthError('Mật khẩu phải có ít nhất 6 ký tự!');
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
      const data = await register(registerForm.username, registerForm.email, registerForm.password);
      if (data.success) {
        setAuthSuccess(data.message || 'Đăng ký tài khoản thành công!');
        setRegisterForm({ username: '', email: '', password: '', confirmPassword: '', tos: false });
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

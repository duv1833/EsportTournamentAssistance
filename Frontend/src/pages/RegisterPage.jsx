import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', tos: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin đăng ký!');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(form.username)) {
      setError('Tên đăng nhập phải từ 3-20 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Email không hợp lệ!');
      return;
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }
    if (!form.tos) {
      setError('Bạn phải chấp nhận Điều khoản sử dụng (TOS)!');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await register(form.username, form.email, form.password);
      if (data.success) {
        setSuccess(data.message || 'Đăng ký tài khoản thành công!');
        setForm({ username: '', email: '', password: '', confirmPassword: '', tos: false });
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(data.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  return (
    <RegisterForm
      registerForm={form}
      setRegisterForm={setForm}
      onSubmit={handleSubmit}
      isLoading={loading}
      authError={error}
      authSuccess={success}
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
}

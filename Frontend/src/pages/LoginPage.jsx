import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usernameOrEmail || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập!');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await login(form.usernameOrEmail, form.password);
      if (data.success) {
        setSuccess(data.message || 'Đăng nhập thành công!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(data.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi hệ thống xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  return (
    <LoginForm
      loginForm={form}
      setLoginForm={setForm}
      onSubmit={handleSubmit}
      isLoading={loading}
      authError={error}
      authSuccess={success}
      onSwitchToRegister={handleSwitchToRegister}
    />
  );
}

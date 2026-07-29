import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.usernameOrEmail || !loginForm.password) {
      setAuthError('Vui lòng nhập đầy đủ thông tin đăng nhập!');
      return;
    }
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);

    try {
      const data = await login(loginForm.usernameOrEmail, loginForm.password);
      if (data.success) {
        setAuthSuccess(data.message || 'Đăng nhập thành công!');
        setLoginForm({ usernameOrEmail: '', password: '' });
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setAuthError(data.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Có lỗi hệ thống xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 animate-fade-in">
      <LoginForm
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        onSubmit={handleLoginSubmit}
        isLoading={isLoading}
        authError={authError}
        authSuccess={authSuccess}
        onSwitchToRegister={() => navigate('/register')}
      />
    </div>
  );
}

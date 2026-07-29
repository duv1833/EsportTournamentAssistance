import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    const res = await loginApi(usernameOrEmail, password);
    if (res.success && res.data) {
      setCurrentUser(res.data);
    }
    return res;
  };

  const register = async (username, email, password, role) => {
    const res = await registerApi(username, email, password, role);
    if (res.success && res.data) {
      setCurrentUser(res.data);
    }
    return res;
  };

  const logout = () => {
    logoutApi();
    setCurrentUser(null);
  };

  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.globalRole === 'ADMIN',
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, register as authRegister, logout as authLogout, getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
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
    const res = await authLogin(usernameOrEmail, password);
    if (res.success && res.data) {
      setCurrentUser(res.data);
    }
    return res;
  };

  const register = async (username, email, password, phoneNumber, nickname) => {
    const res = await authRegister(username, email, password, phoneNumber, nickname);
    if (res.success && res.data) {
      setCurrentUser(res.data);
    }
    return res;
  };

  const logout = () => {
    authLogout();
    setCurrentUser(null);
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateUser = updateCurrentUser;

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.globalRole === 'ADMIN',
    login,
    register,
    logout,
    updateUser,
    updateCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

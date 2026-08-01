import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as authLogin, register as authRegister, logout as authLogout, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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
    const data = await authLogin(usernameOrEmail, password);
    if (data.success) {
      setCurrentUser(data.data);
    }
    return data;
  };

  const register = async (username, email, password, role) => {
    const data = await authRegister(username, email, password, role);
    if (data.success) {
      setCurrentUser(data.data);
    }
    return data;
  };

  const logout = () => {
    authLogout();
    setCurrentUser(null);
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateCurrentUser,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { initSocketClient, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuscare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campuscare_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.data) {
            const freshUser = res.data.data;
            setUser(freshUser);
            localStorage.setItem('campuscare_user', JSON.stringify(freshUser));
            initSocketClient(freshUser);
          }
        } catch (err) {
          console.warn('Session restoration note:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data && res.data.data) {
      const { user: userData, token: jwtToken } = res.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('campuscare_token', jwtToken);
      localStorage.setItem('campuscare_user', JSON.stringify(userData));
      initSocketClient(userData);
      return userData;
    }
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data && res.data.data) {
      const { user: newUser, token: jwtToken } = res.data.data;
      setUser(newUser);
      setToken(jwtToken);
      localStorage.setItem('campuscare_token', jwtToken);
      localStorage.setItem('campuscare_user', JSON.stringify(newUser));
      initSocketClient(newUser);
      return newUser;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campuscare_token');
    localStorage.removeItem('campuscare_user');
    disconnectSocket();
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('campuscare_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('User refresh error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

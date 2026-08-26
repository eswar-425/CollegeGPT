import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('collegegpt_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local token
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('collegegpt_token');
      const savedUser = localStorage.getItem('collegegpt_user');

      if (savedToken) {
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {}
        }

        try {
          const res = await authApi.getMe();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('collegegpt_user', JSON.stringify(res.user));
          }
        } catch (err) {
          // If token expired
          localStorage.removeItem('collegegpt_token');
          localStorage.removeItem('collegegpt_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('collegegpt_token', res.token);
      localStorage.setItem('collegegpt_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('collegegpt_token', res.token);
      localStorage.setItem('collegegpt_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('collegegpt_token');
    localStorage.removeItem('collegegpt_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
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

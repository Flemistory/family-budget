/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token: newToken, user: userData, familyId, role } = response.data.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ ...userData, familyId, role });
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    }
    return { success: false, error: response.data.error };
  };

  const register = async (email, password, name, familyName) => {
    const response = await api.post('/auth/register', { email, password, name, familyName });
    if (response.data.success) {
      const { token: newToken, user: userData, familyId, role } = response.data.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ ...userData, familyId, role });
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    }
    return { success: false, error: response.data.error };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
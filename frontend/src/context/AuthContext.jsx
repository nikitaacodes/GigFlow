import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Load user data
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data);
        return { success: true };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data);
        return { success: true };
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    loadUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

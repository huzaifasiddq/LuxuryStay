import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try {
      const t = localStorage.getItem('token');
      return (t && t !== 'undefined' && t !== 'null') ? t : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (token && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Safe parse error:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const resData = response.data?.data || response.data;

    const receivedToken = resData.token;

    // Destructure token out, remaining fields are user data
    const { token: _, ...userData } = resData;

    if (!receivedToken) {
      throw new Error('No authentication token received from server');
    }

    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(receivedToken);
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
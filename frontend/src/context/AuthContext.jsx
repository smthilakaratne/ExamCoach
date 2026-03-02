import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await getMe();
      setUser(res.body.user);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    localStorage.setItem('token', res.body.token);
    setUser(res.body.user);
    toast.success(res.body.message);
    return res;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out');
    }
  };

  const value = { user, loading, login, logout, fetchUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
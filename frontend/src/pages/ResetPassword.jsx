// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  if (!resetToken) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ resetToken, password });
      toast.success('Password reset successfully. Please login.');
      navigate('/login');
    } catch (error) {
      // toast handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
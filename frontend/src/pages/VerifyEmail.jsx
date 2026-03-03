//src/pages/VerifyEmail.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail, verifyForgotOTP, resendOTP } from '../services/authService';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const purpose = location.state?.purpose || 'verify'; // 'verify' or 'reset'

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (purpose === 'reset') {
        const res = await verifyForgotOTP({ email, otp });
        toast.success(res.body.message);
        navigate('/reset-password', { state: { resetToken: res.body.resetToken } });
      } else {
        const res = await verifyEmail({ email, otp });
        localStorage.setItem('token', res.body.token);
        toast.success(res.body.message);
        navigate('/');
      }
    } catch (error) {
      // toast handled
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      if (purpose === 'reset') {
        await forgotPassword(email);
      } else {
        await resendOTP(email);
      }
      toast.success('New OTP sent');
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-500 mt-1">We sent a 6-digit code to {email}</p>
        </div>
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="label">OTP Code</label>
            <input
              type="text"
              className="input-field text-center text-2xl tracking-widest"
              placeholder="••••••"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <div className="text-center">
            <button type="button" onClick={handleResend} className="text-sm text-indigo-600 hover:underline">
              Didn't receive? Resend OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const verifyEmail = (data) => api.post('/auth/verify-email', data);
export const resendOTP = (email) => api.post('/auth/resend-otp', { email });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const verifyForgotOTP = (data) => api.post('/auth/forgot-password/verify', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
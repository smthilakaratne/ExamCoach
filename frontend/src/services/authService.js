import api from "./api"

export const register = (data) => api.post("/auth/register", data)
export const verifyEmail = (data) => api.post("/auth/verify-email", data)
export const resendOTP = (email) => api.post("/auth/resend-otp", { email })
export const login = (data) => api.post("/auth/login", data)
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email })
export const resetPassword = (token, data) => api.post(`/auth/reset-password/${token}`, data)
export const getMe = () => api.get("/auth/me")
export const logout = () => api.post("/auth/logout")
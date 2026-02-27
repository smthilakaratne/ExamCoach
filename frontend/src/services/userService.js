import api from "./api"

export const getProfile = () => api.get("/user/profile")
export const updateProfile = (data) => api.put("/user/profile", data)
export const changePassword = (data) => api.put("/user/change-password", data)
export const deleteAccount = () => api.delete("/user/profile")
export const getUserStats = () => api.get("/user/stats")
export const getAllUsers = (params) => api.get("/user", { params })
export const getUserById = (id) => api.get(`/user/${id}`)
export const updateUserByAdmin = (id, data) => api.put(`/user/${id}`, data)
export const deleteUserByAdmin = (id) => api.delete(`/user/${id}`)
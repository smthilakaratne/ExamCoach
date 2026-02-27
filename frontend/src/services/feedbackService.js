import api from './api';

export const createFeedback = (data) => api.post('/feedback', data);
export const getAllFeedback = (params) => api.get('/feedback', { params });
export const getMyFeedback = (params) => api.get('/feedback/my', { params });
export const getFeedbackStats = () => api.get('/feedback/stats');
export const getFeedbackById = (id) => api.get(`/feedback/${id}`);
export const updateFeedback = (id, data) => api.put(`/feedback/${id}`, data);
export const deleteFeedback = (id) => api.delete(`/feedback/${id}`);
export const addReply = (id, data) => api.post(`/feedback/${id}/reply`, data);
export const deleteReply = (id, replyId) => api.delete(`/feedback/${id}/reply/${replyId}`);
export const reactToFeedback = (id, type) => api.post(`/feedback/${id}/react`, { type });
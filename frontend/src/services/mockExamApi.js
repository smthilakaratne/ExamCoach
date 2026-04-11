import axios from "axios"
import api from './api';

//const API = "http://localhost:8888/api/mock-exams"
/*
export const startExam = (level) => axios.post(`${API}/start`, { level })

export const submitExam = (data) => axios.post(`${API}/submit`, data)

export const getProgress = (userId, subject) =>
  axios.get(`${API}/progress/${userId}?subject=${subject}`);

export const fetchPreviewQuestions = (level, subject) => {
  return axios.get(`${API}/questions?level=${level}&subject=${subject}`);
};

export const importQuestions = (data) => {
  return axios.post(`${API}/questions/import`, data);
};*/

console.log("service");
export const startExam = (level, subject) => api.post(`/mock-exams/start`, { level, subject });

export const submitExam = (data) => api.post(`/mock-exams/submit`, data);

export const getProgress = (userId, subject) =>
  api.get(`/mock-exams/progress/${userId}?subject=${subject}`);

export const fetchPreviewQuestions = (level, subject) =>
  api.get(`/mock-exams/questions?level=${level}&subject=${subject}`);

export const importQuestions = (data) =>
  api.post(`/mock-exams/questions/import`, data);
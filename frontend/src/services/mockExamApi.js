import axios from "axios"

const API = "http://localhost:8888/api/mock-exams"

export const startExam = (level) => axios.post(`${API}/start`, { level })

export const submitExam = (data) => axios.post(`${API}/submit`, data)

export const getProgress = (userId, subject) =>
  axios.get(`${API}/progress/${userId}?subject=${subject}`);

export const fetchPreviewQuestions = (level, subject) => {
  return axios.get(`${API}/questions?level=${level}&subject=${subject}`);
};

export const importQuestions = (data) => {
  return axios.post(`${API}/questions/import`, data);
};
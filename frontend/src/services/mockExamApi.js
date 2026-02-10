import axios from "axios";

const API = "http://localhost:5000/api/mock-exams";


export const startExam = (level) =>
  axios.post('${API}/start', { level });

export const submitExam = (data) =>
  axios.post('${API}/submit', data);

export const getProgress = () =>
  axios.get('${API}/progress');

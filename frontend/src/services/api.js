import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8888/api",
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle responses & errors properly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.log("API Error:", error.response); // for debugging

    const msg =
      error.response?.data?.message ||              // { message: "" }
      error.response?.data?.body?.message ||       // { body: { message: "" } }
      error.response?.data?.statusMessage ||       // { statusMessage: "" }
      error.message ||                             // axios error
      "Something went wrong";

    toast.error(msg);

    return Promise.reject(error);
  }
);

export default api;
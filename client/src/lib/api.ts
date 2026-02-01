import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Alamat server backend kita
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk otomatis masukin token kalau user sudah login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

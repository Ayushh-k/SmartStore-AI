// frontend/src/utils/api.js

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: false,
});

/**
  Request interceptor to attach JWT from localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smartstoretoken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
  Response interceptor to handle unauthorized errors globally.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("smartstoretoken");
    }
    return Promise.reject(error);
  }
);

export default api;

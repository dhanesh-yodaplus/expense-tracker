import axios from "axios";
import { refreshAccessToken } from "./auth";

// Base URL for API requests
const BASE_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach access token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  //   console.log('[AXIOS DEBUG] Access Token:', token);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    // console.log('[AXIOS DEBUG] Authorization Header Set:', config.headers);
  }

  return config;
});

// Response interceptor to handle token expiration and refresh logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }

      // Refresh token is invalid: force logout
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/"; // or navigate("/login")
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

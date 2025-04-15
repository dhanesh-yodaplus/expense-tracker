// frontend/src/services/axios.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api'; // or use import.meta.env.VITE_API_URL for env support

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;

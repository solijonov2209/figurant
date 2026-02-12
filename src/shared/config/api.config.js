import axios from 'axios';

// API konfiguratsiyasi
// Real API tayyor bo'lganda faqat BASE_URL ni o'zgartirish kifoya

// Environment o'zgaruvchilardan qiymatlarni olish
// Development: .env faylida sozlang
// Production: hosting platformasida environment variables da sozlang
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Debug: konsolga chiqarish
console.log('🔍 API Config Debug:');
console.log('VITE_USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);
console.log('USE_MOCK_DATA:', USE_MOCK_DATA);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

// API base URL - environment dan olish
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Axios instance yaratish
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 soniya
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Ngrok warning page ni o'tkazib yuborish
  }
});

// Request interceptor - har bir so'rovga token qo'shish
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xatolarni boshqarish
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server xatosi
      if (error.response.status === 401) {
        // Token muddati tugagan yoki noto'g'ri
        clearAuthToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/users/login',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password'
  },

  // Users (Admins)
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    STATISTICS: {
      ADMIN_OFFENDER_STATS: '/users/statistics/admin-offender-stats',
      ADMIN_AND_OFFENDERS_COUNT: '/users/statistics/admin-and-offenders-count'
    }
  },

  // Offenders (Persons)
  OFFENDERS: {
    BASE: '/users/offenders',
    BY_ID: (id) => `/users/offenders/${id}`,
    SEARCH: '/users/offenders/search',
    ADD_TO_PROCESS: (id) => `/users/offenders/${id}/add_to_process`,
    REMOVE_FROM_PROCESS: (id) => `/users/offenders/${id}/remove_from_process`
  },

  // Crime Categories
  CRIME_CATEGORIES: {
    BASE: '/crimes/categories',
    BY_ID: (id) => `/crimes/categories/${id}`
  },

  // Crime Types
  CRIME_TYPES: {
    BASE: '/crimes',
    BY_ID: (id) => `/crimes/${id}`
  },

  // Files
  FILES: {
    BASE: '/common/files',
    BY_ID: (id) => `/common/files/${id}`
  }
};

// Tokenni localStorage dan olish
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Tokenni localStorage ga saqlash
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Tokenni o'chirish
export const clearAuthToken = () => {
  localStorage.removeItem('token');
};

// Authorization header qo'shish
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Full URL yaratish
export const getFullUrl = (endpoint) => {
  return `${BASE_URL}${endpoint}`;
};

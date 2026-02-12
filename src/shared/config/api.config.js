import axios from 'axios';

// API konfiguratsiyasi
// Real API tayyor bo'lganda faqat BASE_URL ni o'zgartirish kifoya

// Development uchun mock data
export const USE_MOCK_DATA = true;

// Production API base URL
// API tayyor bo'lganda bu URL ni real server manziliga o'zgartiring
export const BASE_URL = 'http://localhost:8080/api';

// Axios instance yaratish
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 soniya
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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

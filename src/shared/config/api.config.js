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
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me'
  },

  // Persons
  PERSONS: {
    BASE: '/persons',
    SEARCH: '/persons/search',
    IN_PROCESS: '/persons/in-process',
    ADD_TO_PROCESS: (id) => `/persons/${id}/add-to-process`,
    REMOVE_FROM_PROCESS: (id) => `/persons/${id}/remove-from-process`,
    BY_ID: (id) => `/persons/${id}`,
    STATS: '/persons/stats',
    STATS_BY_DISTRICT: (districtId) => `/persons/stats/district/${districtId}`
  },

  // Admins
  ADMINS: {
    BASE: '/admins',
    BY_ID: (id) => `/admins/${id}`,
    MAHALLA_INSPECTORS: '/admins/mahalla-inspectors',
    STATS: '/admins/stats'
  },

  // Districts
  DISTRICTS: {
    BASE: '/districts',
    MAHALLAS: (districtId) => `/districts/${districtId}/mahallas`
  },

  // Crime Categories
  CRIME_CATEGORIES: {
    BASE: '/crime-categories'
  },

  // Crime Types
  CRIME_TYPES: {
    BASE: '/crime-types'
  },

  // Reports
  REPORTS: {
    GENERATE: '/reports/generate'
  }
};

// HTTP konfiguratsiya
export const HTTP_CONFIG = {
  TIMEOUT: 30000, // 30 soniya
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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

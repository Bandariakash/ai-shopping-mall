import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ==================
// Store APIs
// ==================
export const fetchStores = (params = {}) =>
  api.get('/api/stores', { params }).then((r) => r.data);

export const fetchStoreById = (storeId) =>
  api.get(`/api/stores/${storeId}`).then((r) => r.data);

// ==================
// Product APIs
// ==================
export const fetchProducts = (params = {}) =>
  api.get('/api/products', { params }).then((r) => r.data);

export const fetchProductById = (productId) =>
  api.get(`/api/products/${productId}`).then((r) => r.data);

export const fetchProductsByIds = (ids) =>
  api.get('/api/products/by-ids', { params: { ids: ids.join(',') } }).then((r) => r.data);

// ==================
// Chat API
// ==================
export const sendChatMessage = (message, sessionId) =>
  api.post('/api/chat', { message, sessionId }).then((r) => r.data);

export const fetchChatHistory = () =>
  api.get('/api/chat/history').then((r) => r.data);

// ==================
// Order APIs
// ==================
export const processCheckout = (checkoutData) =>
  api.post('/api/orders/checkout', checkoutData).then((r) => r.data);

export const fetchOrders = (email) =>
  api.get('/api/orders', { params: email ? { email } : {} }).then((r) => r.data);

export const fetchOrderById = (orderId) =>
  api.get(`/api/orders/${orderId}`).then((r) => r.data);

// ==================
// Auth APIs
// ==================
export const registerUser = (data) =>
  api.post('/api/auth/register', data).then((r) => r.data);

export const loginUser = (data) =>
  api.post('/api/auth/login', data).then((r) => r.data);

export const fetchCurrentUser = () =>
  api.get('/api/auth/me').then((r) => r.data);

export default api;


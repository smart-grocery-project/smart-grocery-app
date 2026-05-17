// ─────────────────────────────────────────────────────────────────────────────
// api.js  —  Axios instance + all API calls
//
// HOW TO UPDATE WHEN BACKEND IS DEPLOYED:
//   Change BASE_URL below to the deployed server URL
//   e.g. 'https://smart-grocery-api.com'
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

// Your laptop's local IP — backend must be running on port 3000
export const BASE_URL = 'http://192.168.100.4:3000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach token to every request if available
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser  = (name, email, password) =>
  api.post('/users', { name, email, password });

export const loginUser = (email, password) =>
  api.post('/users/login', { email, password });

// ─── Inventory ────────────────────────────────────────────────────────────────
export const getInventory   = ()             => api.get('/inventory');
export const addInventoryItem = (product, quantity) =>
  api.post('/inventory/items', { product, quantity });
export const removeInventoryItem = (itemId) =>
  api.delete(`/inventory/items/${itemId}`);
export const getExpiringItems = ()           => api.get('/inventory/items/expired');

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts    = ()             => api.get('/products');
export const compareProduct = (id)           => api.post(`/products/${id}/compare`);

// ─── History ──────────────────────────────────────────────────────────────────
export const getHistory     = ()             => api.get('/history');
export const addHistoryItem = (productId)    =>
  api.post('/history/items', { productId });

// ─── Weekly Plan ──────────────────────────────────────────────────────────────
export const getWeeklyPlan  = ()             => api.get('/weekly-plan');
export const saveWeeklyPlan = (data)         => api.post('/weekly-plan', data);

export default api;

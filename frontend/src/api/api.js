// ─────────────────────────────────────────────────────────────────────────────
// api.js  —  Axios instance + all API calls
//
// HOW TO UPDATE WHEN BACKEND IS DEPLOYED:
//   Change BASE_URL below to the deployed server URL
//   e.g. 'https://smart-grocery-api.com'
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

// Deployed backend on Render (cloud) — works anywhere, no laptop needed
export const BASE_URL = 'https://smart-grocery-app-f00u.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Render's free tier sleeps after inactivity and takes ~50s to wake.
  // 60s lets the first request through instead of timing out.
  timeout: 60000,
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

export const changePassword = (currentPassword, newPassword) =>
  api.put('/users/password', { currentPassword, newPassword });

// ─── Inventory ────────────────────────────────────────────────────────────────
export const getInventory    = ()             => api.get('/inventory');
export const createInventory = ()             => api.post('/inventory');
export const addInventoryItem = (product, quantity, expirationDate) =>
  api.post('/inventory/items', { product, quantity, expirationDate });
export const removeInventoryItem = (itemId) =>
  api.delete(`/inventory/items/${itemId}`);
export const updateInventoryItem = (itemId, quantity) =>
  api.put(`/inventory/items/${itemId}`, { quantity });
export const getExpiringItems = ()           => api.get('/inventory/items/expired');

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts    = ()             => api.get('/products');
export const createProduct  = (data)         => api.post('/products', data);
export const updateProduct  = (id, data)     => api.put(`/products/${id}`, data);
export const compareProduct = (id)           => api.post(`/products/${id}/compare`);

// ─── History ──────────────────────────────────────────────────────────────────
export const getHistory     = ()             => api.get('/history');
export const createHistory  = ()             => api.post('/history');
export const addHistoryItem = (productId)    =>
  api.post('/history/items', { productId });

// ─── Weekly Plan ──────────────────────────────────────────────────────────────
export const getWeeklyPlan  = ()             => api.get('/weekly-plan');
export const saveWeeklyPlan = (data)         => api.post('/weekly-plan', data);

// ─── Scanner ──────────────────────────────────────────────────────────────────
// Uploads an image to the backend so it can detect the barcode and return the product.
export const scanBarcodeImage = (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri:  imageUri,
    type: 'image/jpeg',
    name: 'scan.jpg',
  });
  return api.post('/scanner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Sends just a barcode number to the backend — used by the live barcode scanner.
export const lookupBarcode = (barcode) =>
  api.post('/scanner/barcode', { barcode });

// ─── AI ───────────────────────────────────────────────────────────────────────
// Takes a photo of a nutrition label and uses Llama Vision to extract nutrition.
export const scanNutritionLabel = (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri:  imageUri,
    type: 'image/jpeg',
    name: 'label.jpg',
  });
  return api.post('/ai/scan-label', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000, // AI processing + possible cold-start wake (~50s)
  });
};

export default api;

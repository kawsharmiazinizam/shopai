import axios from 'axios';

// Production-এ Render URL, local-এ localhost
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const API = axios.create({ baseURL: BASE_URL });

// Auth token inject
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Products ──────────────────────────────────────────────
export const getProducts = async (params = {}) => {
  const { data } = await API.get('/api/products/', { params });
  return data;
};
export const getProduct = async (id) => {
  const { data } = await API.get(`/api/products/${id}`);
  return data;
};
export const searchProducts = async (q) => {
  const { data } = await API.get('/api/products/', { params: { search: q } });
  return data;
};
export const getRecommendations = async (productId) => {
  try {
    const { data } = await API.get('/api/products/', { params: { limit: 8 } });
    return data.filter(p => p.id !== parseInt(productId)).slice(0, 4);
  } catch { return []; }
};

// ── Categories ────────────────────────────────────────────
export const getCategories = async () => {
  const { data } = await API.get('/api/categories/');
  return data;
};

// ── Cart ──────────────────────────────────────────────────
export const getCart = async () => {
  const { data } = await API.get('/api/cart/');
  return data;
};
export const addToCart = async (product_id, quantity = 1) => {
  const { data } = await API.post('/api/cart/', { product_id, quantity });
  return data;
};
export const removeCartItem = async (item_id) => {
  await API.delete(`/api/cart/${item_id}`);
};
export const clearBackendCart = async () => {
  try { await API.delete('/api/cart/'); } catch {}
};

// ── AI Features ───────────────────────────────────────────
export const generateDescription = async (product_name, category, brand = '', key_features = '') => {
  const { data } = await API.post('/api/ai/generate-description', { product_name, category, brand, key_features });
  return data.description;
};
export const aiChat = async (message, history = []) => {
  const { data } = await API.post('/api/ai/chat', { message, history });
  return data;
};
export const getSearchSuggestions = async (query) => {
  const { data } = await API.get('/api/ai/search-suggestions', { params: { query } });
  return data.suggestions;
};

// ── Reviews ───────────────────────────────────────────────
export const getReviews = async (product_id) => {
  const { data } = await API.get(`/api/reviews/product/${product_id}`);
  return data;
};
export const createReview = async (reviewData) => {
  const { data } = await API.post('/api/reviews/', reviewData);
  return data;
};

// ── Wishlist ──────────────────────────────────────────────
export const getWishlist = async () => {
  const { data } = await API.get('/api/wishlist/');
  return data;
};
export const addToWishlist = async (product_id) => {
  const { data } = await API.post(`/api/wishlist/${product_id}`);
  return data;
};
export const removeFromWishlist = async (product_id) => {
  await API.delete(`/api/wishlist/${product_id}`);
};

// ── Orders ────────────────────────────────────────────────
export const placeOrder = async (orderData) => {
  const { data } = await API.post('/api/orders/', orderData);
  return data;
};
export const getMyOrders = async () => {
  const { data } = await API.get('/api/orders/my');
  return data;
};
export const getAllOrders = async () => {
  const { data } = await API.get('/api/orders/all');
  return data;
};
export const updateOrderStatus = async (order_id, status) => {
  const { data } = await API.put(`/api/orders/${order_id}/status`, null, { params: { status } });
  return data;
};

// ── Admin Products ────────────────────────────────────────
export const adminGetProducts = async () => {
  const { data } = await API.get('/api/products/', { params: { limit: 100 } });
  return data;
};
export const adminAddProduct = async (product) => {
  const { data } = await API.post('/api/products/', product);
  return data;
};
export const adminUpdateProduct = async (id, product) => {
  const { data } = await API.put(`/api/products/${id}`, product);
  return data;
};
export const adminDeleteProduct = async (id) => {
  await API.delete(`/api/products/${id}`);
};
export const adminCreateCategory = async (categoryData) => {
  const { data } = await API.post('/api/categories/', categoryData);
  return data;
};

// ── Auth ──────────────────────────────────────────────────
export const login = async (email, password) => {
  const { data } = await API.post('/api/auth/login', { email, password });
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};
export const register = async (name, email, password) => {
  const { data } = await API.post('/api/auth/register', { name, email, password });
  return data;
};
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
export const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
};

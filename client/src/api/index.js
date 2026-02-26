import axios from 'axios';

// Use environment variable for API URL, fallback to local proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error - API server not reachable
      console.error('API Server Error:', error.message);
      error.message = 'Tidak dapat terhubung ke server. Pastikan backend server berjalan atau URL API sudah benar.';
    } else if (error.response.status === 404) {
      console.error('API 404 Error:', error.config.url);
      error.message = `Endpoint tidak ditemukan: ${error.config.url}. Pastikan backend server sudah di-deploy dan URL API sudah benar.`;
    }
    return Promise.reject(error);
  }
);


// Categories API
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Materials API
export const materialApi = {
  getAll: () => api.get('/materials'),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
};

// Products API
export const productApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  duplicate: (id) => api.post(`/products/${id}/duplicate`),
};

export default api;

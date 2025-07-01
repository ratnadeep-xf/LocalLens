// API base URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  userLogin: `${API_BASE_URL}/auth/user-login`,
  userRegister: `${API_BASE_URL}/auth/user-register`,
  publisherLogin: `${API_BASE_URL}/auth/publisher-login`,
  publisherRegister: `${API_BASE_URL}/auth/publisher-register`,
  verify: `${API_BASE_URL}/auth/verify`,
};

// Article endpoints
export const ARTICLE_ENDPOINTS = {
  getAll: `${API_BASE_URL}/articles`,
  create: `${API_BASE_URL}/articles`,
  delete: (id) => `${API_BASE_URL}/articles/${id}`,
  vote: (id) => `${API_BASE_URL}/articles/${id}/vote`,
  comment: (id) => `${API_BASE_URL}/articles/${id}/comment`,
}; 
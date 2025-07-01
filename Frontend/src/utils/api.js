// API base URL from environment variable
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = `${apiUrl}/api`;

// Default fetch options for all API calls
export const defaultFetchOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  }
};

// Helper function to make API calls
export const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }
  
  return response.json();
};

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
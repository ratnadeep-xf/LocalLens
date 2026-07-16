// API base URL from environment variable
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_ROOT_URL = apiUrl;
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
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Prepare headers with token if available
    const headers = {
      ...defaultFetchOptions.headers,
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...defaultFetchOptions,
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      // If the server returned an error message, use it
      if (data.message) {
        throw new Error(data.message);
      }
      // If there are validation errors, combine them
      if (data.errors && Array.isArray(data.errors)) {
        throw new Error(data.errors.join(', '));
      }
      // Generic error based on status
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // If it's already an Error object (from above), just rethrow it
    if (error instanceof Error) {
      throw error;
    }
    // For network errors or other issues
    throw new Error('Network error or invalid JSON response');
  }
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
  getById: (id) => `${API_BASE_URL}/articles/${id}`,
  create: `${API_BASE_URL}/articles`,
  delete: (id) => `${API_BASE_URL}/articles/${id}`,
  vote: (id) => `${API_BASE_URL}/articles/${id}/vote`,
  comment: (id) => `${API_BASE_URL}/articles/${id}/comment`,
  search: (query, region) => {
    const params = new URLSearchParams({
      q: query,
      ...(region && region !== 'all' ? { region } : {}),
    });
    return `${API_BASE_URL}/articles/search?${params.toString()}`;
  },
}; 
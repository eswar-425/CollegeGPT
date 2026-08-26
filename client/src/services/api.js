import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('collegegpt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred.';

    const errorCode = error.response?.data?.errorCode || 'UNKNOWN_ERROR';

    if (error.response?.status === 401) {
      // If token expired, clear local storage
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('collegegpt_token');
        localStorage.removeItem('collegegpt_user');
      }
    }

    return Promise.reject({
      status: error.response?.status,
      errorCode,
      message,
      data: error.response?.data,
    });
  }
);

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Conversation endpoints
export const conversationApi = {
  getConversations: () => api.get('/conversations'),
  getConversation: (id) => api.get(`/conversations/${id}`),
  createConversation: (title) => api.post('/conversations', { title }),
  updateConversation: (id, title) => api.put(`/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
};

// Chat endpoints
export const chatApi = {
  sendMessage: ({ conversationId, message, departmentFilter, categoryFilter }) =>
    api.post('/chat', { conversationId, message, departmentFilter, categoryFilter }),
  getMessages: (conversationId) => api.get(`/chat/${conversationId}/messages`),
  submitFeedback: (messageId, { rating, comment }) =>
    api.post(`/chat/${messageId}/feedback`, { rating, comment }),
};

// Document endpoints
export const documentApi = {
  getDocuments: (params) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData) =>
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  reprocessDocument: (id) => api.post(`/documents/${id}/reprocess`),
  getStatus: (id) => api.get(`/documents/${id}/status`),
};

// Admin endpoints
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getFeedback: (params) => api.get('/admin/feedback', { params }),
  getUsers: () => api.get('/admin/users'),
};

// Health endpoint
export const healthApi = {
  getHealth: () => api.get('/health'),
};

export default api;

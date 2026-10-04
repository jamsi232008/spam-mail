import axios from 'axios';

// Use direct backend port 5000 with fallback to relative /api
const API_BASE = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration or errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear invalid token if not already on login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', jsonSafe(res.data.user));
    }
    return res.data;
  },
  register: async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      confirm_password: confirmPassword,
    });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', jsonSafe(res.data.user));
    }
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },
  getStoredUser: () => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const emailService = {
  getEmails: async (folder = '', search = '') => {
    const params = {};
    if (folder) params.folder = folder;
    if (search) params.search = search;
    const res = await api.get('/emails', { params });
    return res.data;
  },
  getEmailById: async (id) => {
    const res = await api.get(`/emails/${id}`);
    return res.data.email;
  },
  createEmail: async (emailData) => {
    // Backend automatically runs ML model and places in INBOX or BIN
    const res = await api.post('/emails', emailData);
    return res.data;
  },
  markRead: async (id, isRead = true) => {
    const res = await api.put(`/emails/${id}/read`, { is_read: isRead });
    return res.data;
  },
  restoreEmail: async (id) => {
    const res = await api.put(`/emails/${id}/restore`);
    return res.data;
  },
  moveToBin: async (id) => {
    const res = await api.put(`/emails/${id}/move-to-bin`);
    return res.data;
  },
  deleteEmail: async (id) => {
    const res = await api.delete(`/emails/${id}`);
    return res.data;
  },
};

export const mlService = {
  predictText: async (subject, body) => {
    const res = await api.post('/predict', { subject, body });
    return res.data;
  },
  getDetections: async (filter = 'all') => {
    const res = await api.get('/detections', { params: { filter } });
    return res.data;
  },
  getModelInfo: async () => {
    const res = await api.get('/model/info');
    return res.data.model_info;
  },
  retrainModel: async () => {
    const res = await api.post('/model/retrain');
    return res.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
  loadDemoEmails: async () => {
    const res = await api.post('/demo/load');
    return res.data;
  },
};

function jsonSafe(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}

export default api;

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuscare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 unauth (e.g. expired session)
      if (localStorage.getItem('campuscare_token')) {
        localStorage.removeItem('campuscare_token');
        localStorage.removeItem('campuscare_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Complaint Endpoints
export const complaintAPI = {
  submit: (formData) =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyComplaints: (params) => api.get('/complaints/my', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  submitFeedback: (id, data) => api.post(`/complaints/${id}/feedback`, data),
};

// Admin Endpoints
export const adminAPI = {
  getComplaints: (params) => api.get('/admin/complaints', { params }),
  getComplaintById: (id) => api.get(`/admin/complaints/${id}`),
  updateComplaint: (id, data) => api.put(`/admin/complaints/${id}`, data),
  addComment: (id, data) => api.post(`/admin/complaints/${id}/update`, data),
  resolveComplaint: (id, data) => api.post(`/admin/complaints/${id}/resolve`, data),
  toggleEscalate: (id, data) => api.post(`/admin/complaints/${id}/escalate`, data),
  getStatistics: () => api.get('/admin/statistics'),
  getDepartmentStats: () => api.get('/admin/statistics/departments'),
  getCategoryStats: () => api.get('/admin/statistics/categories'),
  getStatusStats: () => api.get('/admin/statistics/status'),
};

// Notification Endpoints
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// AI & Duplicate Check Endpoints
export const aiAPI = {
  categorize: (data) => api.post('/ai/categorize', data),
  summarize: (data) => api.post('/ai/summarize', data),
  checkDuplicate: (data) => api.post('/ai/check-duplicate', data),
  imageClassify: (data) => api.post('/ai/image-classify', data),
};

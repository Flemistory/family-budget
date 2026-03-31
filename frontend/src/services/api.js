import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API для транзакций
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getStats: () => api.get('/transactions/stats/summary'),
  
  // Аналитика расходов
  getSpendingByCategory: () => api.get('/transactions/analytics/spending-by-category'),
  getSpendingByMonth: () => api.get('/transactions/analytics/spending-by-month'),
  getTopExpenses: () => api.get('/transactions/analytics/top-expenses'),

  // Аналитика доходов
  getIncomeByCategory: () => api.get('/transactions/analytics/income-by-category'),
  getIncomeByMonth: () => api.get('/transactions/analytics/income-by-month'),
  getMonthlyComparison: () => api.get('/transactions/analytics/monthly-comparison'),

  // Экспорт
  exportCSV: (params) => api.get('/transactions/export', { params, responseType: 'blob' }),
};

// API для категорий
export const categoryAPI = {
  getAll: (type) => api.get('/categories', { params: type ? { type } : {} }),
};

// API для целей
export const goalAPI = {
  getAll: () => api.get('/goals'),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  contribute: (id, amount) => api.patch(`/goals/${id}/contribute`, { amount }),
  delete: (id) => api.delete(`/goals/${id}`),
};

// API для семьи
export const familyAPI = {
  createFamily: (name) => api.post('/family', { name }),
  getMembers: () => api.get('/family/members'),
  inviteMember: (email, role) => api.post('/family/members', { email, role }),
  updateRole: (userId, role) => api.patch(`/family/members/${userId}/role`, { role }),
  removeMember: (userId) => api.delete(`/family/members/${userId}`),
};

export default api;
import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.endsWith('/api')) {
  API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout for all requests
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getCurrentAdmin: () => api.get('/auth/me'),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  uploadResume: (file) => {
    // Validate file before upload
    if (!file) {
      throw new Error('No file selected');
    }
    
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      throw new Error('Only PDF, Word, and text files are allowed');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      throw new Error('File size must be less than 10MB');
    }
    
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const skillService = {
  getSkills: () => api.get('/skills'),
  createSkill: (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('level', data.level);
    formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    return api.post('/skills', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateSkill: (id, data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('level', data.level);
    formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);
    return api.put(`/skills/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteSkill: (id) => api.delete(`/skills/${id}`),
};

export const projectService = {
  getProjects: () => api.get('/projects'),
  createProject: (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('shortDescription', data.shortDescription);
    formData.append('category', data.category);
    formData.append('tags', data.tags);
    formData.append('liveLink', data.liveLink);
    formData.append('githubLink', data.githubLink);
    formData.append('featured', data.featured);
    formData.append('status', data.status);
    if (data.image) formData.append('image', data.image);
    return api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateProject: (id, data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('shortDescription', data.shortDescription);
    formData.append('category', data.category);
    formData.append('tags', data.tags);
    formData.append('liveLink', data.liveLink);
    formData.append('githubLink', data.githubLink);
    formData.append('featured', data.featured);
    formData.append('status', data.status);
    if (data.image) formData.append('image', data.image);
    return api.put(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

export const messageService = {
  submitMessage: (data) => api.post('/messages', data),
  getMessages: () => api.get('/messages'),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

export const leetcodeService = {
  getStats: (username) => api.get(`/leetcode?username=${username}`),
};

export const portfolioService = {
  getPortfolio: () => api.get('/portfolio'),
  updatePortfolio: (data) => api.put('/portfolio', data),
};

export default api;

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Send cookies with requests for session
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      
      // Redirect to login if unauthorized
      if (error.response.status === 401) {
        window.location.href = '/signup';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============= AUTH API =============
export const authAPI = {
  // Sign up
  signup: (data) => api.post('/auth/signup', data),
  
  // Login
  login: (data) => api.post('/auth/login', data),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Check auth status
  checkAuth: () => api.get('/auth/check'),
};

// ============= TEAMS API =============
export const teamsAPI = {
  // Get all teams
  getAll: () => api.get('/teams'),
  
  // Get single team
  getById: (id) => api.get(`/teams/${id}`),
  
  // Create team
  create: (data) => api.post('/teams', data),
  
  // Update team
  update: (id, data) => api.put(`/teams/${id}`, data),
  
  // Delete team
  delete: (id) => api.delete(`/teams/${id}`),
  
  // Export teams
  export: () => api.get('/teams/export/all'),
  
  // Clear all teams
  clearAll: () => api.delete('/teams/clear/all'),
};

// ============= PLAYERS API =============
export const playersAPI = {
  // Get players by team
  getByTeam: (teamId) => api.get(`/players/team/${teamId}`),
  
  // Get single player
  getById: (id) => api.get(`/players/${id}`),
  
  // Create player
  create: (data) => api.post('/players', data),
  
  // Update player
  update: (id, data) => api.put(`/players/${id}`, data),
  
  // Delete player
  delete: (id) => api.delete(`/players/${id}`),
  
  // Export players
  export: (teamId) => api.get(`/players/export/${teamId}`),
  
  // Clear team players
  clearTeam: (teamId) => api.delete(`/players/clear/${teamId}`),
};

// ============= MATCHES API =============
export const matchesAPI = {
  // Get all matches
  getAll: () => api.get('/matches'),
  
  // Get single match
  getById: (id) => api.get(`/matches/${id}`),
  
  // Create match
  create: (data) => api.post('/matches', data),
  
  // Select player
  selectPlayer: (matchId, data) => api.post(`/matches/${matchId}/select-player`, data),
  
  // Score runs
  scoreRuns: (matchId, data) => api.post(`/matches/${matchId}/score-runs`, data),
  
  // Score extra
  scoreExtra: (matchId, data) => api.post(`/matches/${matchId}/score-extra`, data),
  
  // Player out
  playerOut: (matchId, data) => api.post(`/matches/${matchId}/player-out`, data),
  
  // End innings
  endInnings: (matchId, data) => api.post(`/matches/${matchId}/end-innings`, data),
};

// ============= HELPER FUNCTIONS =============

// Show success message
export const showSuccess = (message) => {
  // You can use a toast library here
  console.log('Success:', message);
  alert(message); // Temporary - replace with toast
};

// Show error message
export const showError = (error) => {
  const message = error.response?.data?.message || error.message || 'Something went wrong';
  console.error('Error:', message);
  alert(message); // Temporary - replace with toast
};

// Convert image to base64
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate overs
export const calculateOvers = (balls) => {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls}`;
};

// Calculate strike rate
export const calculateStrikeRate = (runs, balls) => {
  if (balls === 0) return '0.00';
  return ((runs / balls) * 100).toFixed(2);
};

// Calculate run rate
export const calculateRunRate = (runs, balls) => {
  if (balls === 0) return '0.00';
  return ((runs / balls) * 6).toFixed(2);
};

export default api;
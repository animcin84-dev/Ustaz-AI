import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  // No token needed in no-auth mode
  return config;
});

// We can't use useNotification here directly as it's not a component
// But we can export a function to set the notification handler
let notificationHandler = null;

export const setNotificationHandler = (handler) => {
  notificationHandler = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Произошла ошибка';
    
    if (notificationHandler) {
      notificationHandler(message, 'error');
    }

    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In a real application, replace this with environment variables using react-native-dotenv or expo config.
// Use your local IP mapped to your backend port for physical device testing.
// e.g., 'http://192.168.1.55:8080' instead of localhost for testing on physical phone
const BASE_URL = 'http://192.168.1.107:8080/api/v1'; // Default placeholder, replace with actual IP if testing on real phone. Or http://10.0.2.2:8080 for android emu, http://localhost:8080 for iOS sim.

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Logic to handle unauthorized access, e.g., clear Storage and navigate to Login
      console.warn('Unauthorized! Token expired or invalid.');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId'); 
      // You can implement custom navigation dispatch here or context trigger
    }
    return Promise.reject(error);
  }
);

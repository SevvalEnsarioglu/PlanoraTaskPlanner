import { apiClient } from '../api/client';
import { 
  LoginRequestDTO, 
  LoginResponseDTO, 
  RegisterRequestDTO, 
  UserResponseDTO 
} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthService = {
  login: async (data: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const response = await apiClient.post<LoginResponseDTO>('/auth/login', data);
    
    // Auto-save the token on successful response (optional, can also be done in the hook)
    if (response.data && response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
    }
    return response.data;
  },

  register: async (data: RegisterRequestDTO): Promise<UserResponseDTO> => {
    // Backend returns UserResponseDTO upon successful registration
    const response = await apiClient.post<UserResponseDTO>('/auth/register', data);
    return response.data;
  },

  me: async (): Promise<UserResponseDTO> => {
    const response = await apiClient.get<UserResponseDTO>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Only local clearing since JWT is stateless on backend
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
  }
};

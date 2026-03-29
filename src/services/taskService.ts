import { apiClient } from '../api/client';
import { 
  TaskRequestDTO, 
  TaskResponseDTO 
} from '../types';

export const TaskService = {
  getAll: async (userId: number): Promise<TaskResponseDTO[]> => {
    const response = await apiClient.get<TaskResponseDTO[]>(`/users/${userId}/tasks`);
    return response.data;
  },

  getById: async (userId: number, taskId: number): Promise<TaskResponseDTO> => {
    const response = await apiClient.get<TaskResponseDTO>(`/users/${userId}/tasks/${taskId}`);
    return response.data;
  },

  create: async (userId: number, data: TaskRequestDTO): Promise<TaskResponseDTO> => {
    const response = await apiClient.post<TaskResponseDTO>(`/users/${userId}/tasks`, data);
    return response.data;
  },

  update: async (userId: number, taskId: number, data: TaskRequestDTO): Promise<TaskResponseDTO> => {
    const response = await apiClient.put<TaskResponseDTO>(`/users/${userId}/tasks/${taskId}`, data);
    return response.data;
  },

  complete: async (userId: number, taskId: number): Promise<TaskResponseDTO> => {
    const response = await apiClient.patch<TaskResponseDTO>(`/users/${userId}/tasks/${taskId}/complete`);
    return response.data;
  },

  delete: async (userId: number, taskId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}/tasks/${taskId}`);
  }
};

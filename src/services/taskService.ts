import { apiClient } from '../api/client';
import { 
  TaskRequestDTO, 
  TaskResponseDTO 
} from '../types';

export interface TaskFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
}

export const TaskService = {
  getAll: async (userId: number, filters?: TaskFilters): Promise<TaskResponseDTO[]> => {
    const response = await apiClient.get<TaskResponseDTO[]>(`/users/${userId}/tasks`, { params: filters });
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

  complete: async (userId: number, taskId: number, completed: boolean): Promise<TaskResponseDTO> => {
    const response = await apiClient.patch<TaskResponseDTO>(`/users/${userId}/tasks/${taskId}/complete?completed=${completed}`);
    return response.data;
  },

  delete: async (userId: number, taskId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}/tasks/${taskId}`);
  }
};

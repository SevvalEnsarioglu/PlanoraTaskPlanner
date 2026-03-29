import { apiClient } from '../api/client';
import { 
  PriorityRequestDTO, 
  PriorityResponseDTO 
} from '../types';

export const PriorityService = {
  getAll: async (userId: number): Promise<PriorityResponseDTO[]> => {
    const response = await apiClient.get<PriorityResponseDTO[]>(`/users/${userId}/priorities`);
    return response.data;
  },

  getById: async (userId: number, priorityId: number): Promise<PriorityResponseDTO> => {
    const response = await apiClient.get<PriorityResponseDTO>(`/users/${userId}/priorities/${priorityId}`);
    return response.data;
  },

  create: async (userId: number, data: PriorityRequestDTO): Promise<PriorityResponseDTO> => {
    const response = await apiClient.post<PriorityResponseDTO>(`/users/${userId}/priorities`, data);
    return response.data;
  },

  update: async (userId: number, priorityId: number, data: PriorityRequestDTO): Promise<PriorityResponseDTO> => {
    const response = await apiClient.put<PriorityResponseDTO>(`/users/${userId}/priorities/${priorityId}`, data);
    return response.data;
  },

  delete: async (userId: number, priorityId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}/priorities/${priorityId}`);
  }
};

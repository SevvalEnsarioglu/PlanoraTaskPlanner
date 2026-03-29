import { apiClient } from '../api/client';
import { 
  TagRequestDTO, 
  TagResponseDTO 
} from '../types';

export const TagService = {
  getAll: async (userId: number): Promise<TagResponseDTO[]> => {
    const response = await apiClient.get<TagResponseDTO[]>(`/users/${userId}/tags`);
    return response.data;
  },

  getById: async (userId: number, tagId: number): Promise<TagResponseDTO> => {
    const response = await apiClient.get<TagResponseDTO>(`/users/${userId}/tags/${tagId}`);
    return response.data;
  },

  create: async (userId: number, data: TagRequestDTO): Promise<TagResponseDTO> => {
    const response = await apiClient.post<TagResponseDTO>(`/users/${userId}/tags`, data);
    return response.data;
  },

  update: async (userId: number, tagId: number, data: TagRequestDTO): Promise<TagResponseDTO> => {
    const response = await apiClient.put<TagResponseDTO>(`/users/${userId}/tags/${tagId}`, data);
    return response.data;
  },

  delete: async (userId: number, tagId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}/tags/${tagId}`);
  }
};

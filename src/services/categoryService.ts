import { apiClient } from '../api/client';
import { 
  CategoryRequestDTO, 
  CategoryResponseDTO 
} from '../types';

export const CategoryService = {
  getAll: async (userId: number): Promise<CategoryResponseDTO[]> => {
    const response = await apiClient.get<CategoryResponseDTO[]>(`/users/${userId}/categories`);
    return response.data;
  },

  getById: async (userId: number, categoryId: number): Promise<CategoryResponseDTO> => {
    const response = await apiClient.get<CategoryResponseDTO>(`/users/${userId}/categories/${categoryId}`);
    return response.data;
  },

  create: async (userId: number, data: CategoryRequestDTO): Promise<CategoryResponseDTO> => {
    const response = await apiClient.post<CategoryResponseDTO>(`/users/${userId}/categories`, data);
    return response.data;
  },

  update: async (userId: number, categoryId: number, data: CategoryRequestDTO): Promise<CategoryResponseDTO> => {
    const response = await apiClient.put<CategoryResponseDTO>(`/users/${userId}/categories/${categoryId}`, data);
    return response.data;
  },

  delete: async (userId: number, categoryId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}/categories/${categoryId}`);
  }
};

import { apiClient } from '../api/client';
import { StatisticsResponseDTO } from '../types';

export const StatisticsService = {
  getStatistics: async (userId: number): Promise<StatisticsResponseDTO> => {
    const response = await apiClient.get<StatisticsResponseDTO>(`/users/${userId}/statistics`);
    return response.data;
  }
};

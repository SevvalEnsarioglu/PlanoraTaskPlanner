import { apiClient } from '../api/client';
import { 
  PomodoroRequestDTO, 
  PomodoroResponseDTO 
} from '../types';

export const PomodoroService = {
  getAll: async (userId: number): Promise<PomodoroResponseDTO[]> => {
    const response = await apiClient.get<PomodoroResponseDTO[]>(`/users/${userId}/pomodoros`);
    return response.data;
  },

  create: async (userId: number, data: PomodoroRequestDTO): Promise<PomodoroResponseDTO> => {
    const response = await apiClient.post<PomodoroResponseDTO>(`/users/${userId}/pomodoros`, data);
    return response.data;
  },

  delete: async (userId: number, pomodoroId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}/pomodoros/${pomodoroId}`);
  }
};

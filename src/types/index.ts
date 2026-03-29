// ==========================================
// REQUEST DTOs
// ==========================================

export interface CategoryRequestDTO {
  name: string;
  colorCode?: string;
}

export interface LoginRequestDTO {
  email: string;
  password?: string;
}

export interface PomodoroRequestDTO {
  durationInMinutes: number;
  startTime?: string; // LocalDateTime as ISO string
  endTime?: string;   // LocalDateTime as ISO string
  taskId: number;
}

export interface PriorityRequestDTO {
  name: string;
  colorCode?: string;
  level: number;
}

export interface RegisterRequestDTO {
  username: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  password?: string;
}

export interface TagRequestDTO {
  name: string;
  colorCode?: string;
}

export interface TaskRequestDTO {
  title: string;
  description?: string;
  dueDate?: string; // LocalDateTime as ISO string
  isCompleted?: boolean;
  categoryId?: number;
  tagIds?: number[];
  priorityId?: number;
}

export interface UserRequestDTO {
  name?: string;
  surname?: string;
  phoneNumber?: string;
}

// ==========================================
// RESPONSE DTOs
// ==========================================

export interface CategoryResponseDTO {
  id: number;
  createdAt: string; // Instant as ISO string
  updatedAt: string; // Instant as ISO string
  name: string;
  colorCode?: string;
}

export interface LoginResponseDTO {
  token: string;
}

export interface PomodoroResponseDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  durationInMinutes: number;
  startTime?: string;
  endTime?: string;
  taskId: number;
}

export interface PriorityResponseDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  colorCode?: string;
  level: number;
}

export interface TagResponseDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  colorCode?: string;
}

export interface TaskResponseDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  category?: CategoryResponseDTO;
  tags?: TagResponseDTO[];
  priority?: PriorityResponseDTO;
  pomodoroCount?: number;
}

export interface UserResponseDTO {
  id: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber?: string;
}

export interface StatisticsResponseDTO {
  totalCompletedTasks: number;
  weeklyCompletedTasks: number;
  categoryDistribution: Record<string, number>; // Map<String, Long> -> Record<string, number>
  totalPomodoroMinutes: number;
}

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import type { AxiosResponse } from 'axios';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  recentActivity: Array<{
    id: string;
    title: string;
    type: string;
    timestamp: string;
  }>;
}

export function useDashboardData() {
  const { user } = useAuth();
  
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      const response: AxiosResponse<DashboardStats> = await apiClient.get('/api/dashboard');
      return response.data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

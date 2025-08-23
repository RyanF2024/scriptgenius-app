import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useApiErrorHandler } from '@/lib/api-error-handler';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { handleError } = useApiErrorHandler();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/login');
        return null;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile);
    },
    onError: (error) => {
      handleError(error, 'Failed to update profile');
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutateAsync,
    isUpdating: updateProfile.isPending,
  };
}

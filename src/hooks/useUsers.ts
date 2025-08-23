import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import usersApi, { ListUsersParams, CreateUserData, UpdateUserData } from '@/lib/api/users';
import { User, UserRole, UserStatus } from '@prisma/client';

export const userQueryKeys = {
  all: ['users'],
  lists: () => [...userQueryKeys.all, 'list'],
  list: (filters: ListUsersParams) => [...userQueryKeys.lists(), { filters }],
  details: () => [...userQueryKeys.all, 'detail'],
  detail: (id: string) => [...userQueryKeys.details(), id],
};

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => usersApi.listUsers(params),
    keepPreviousData: true,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => usersApi.getUser(userId),
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateUserData) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      toast({
        title: 'User created',
        description: 'The user has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserData) => usersApi.updateUser({ id, ...data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(data.id) });
      toast({
        title: 'User updated',
        description: 'The user has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: userQueryKeys.detail(id) });
      toast({
        title: 'User deleted',
        description: 'The user has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ ids, ...data }: { ids: string[] } & Partial<UpdateUserData>) => 
      usersApi.bulkUpdateUsers(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      toast({
        title: 'Users updated',
        description: 'The selected users have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating users',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (ids: string[]) => usersApi.bulkDeleteUsers(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: userQueryKeys.detail(id) });
      });
      toast({
        title: 'Users deleted',
        description: 'The selected users have been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting users',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useExportUsers() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (params: Omit<ListUsersParams, 'page' | 'limit'>) => 
      usersApi.exportUsers(params),
    onSuccess: (blob) => {
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: 'Export successful',
        description: 'Users have been exported successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useImportUsers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (file: File) => usersApi.importUsers(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
      
      if (result.failed > 0) {
        toast({
          title: 'Partial import completed',
          description: `Successfully imported ${result.success} users, ${result.failed} failed.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Import successful',
          description: `Successfully imported ${result.success} users.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

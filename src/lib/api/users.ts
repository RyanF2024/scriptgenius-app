import { User, UserRole, UserStatus } from '@prisma/client';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roles?: UserRole[];
  statuses?: UserStatus[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface ListUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

// Mock API client - replace with actual API calls
const API_BASE_URL = '/api/admin/users';

const api = {
  // List users with pagination and filters
  listUsers: async (params: ListUsersParams = {}): Promise<ListUsersResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.roles?.length) queryParams.set('roles', params.roles.join(','));
    if (params.statuses?.length) queryParams.set('statuses', params.statuses.join(','));
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch users');
    }
    
    return response.json();
  },

  // Get single user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch user');
    }
    
    return response.json();
  },

  // Create a new user
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create user');
    }
    
    return response.json();
  },

  // Update an existing user
  updateUser: async ({ id, ...data }: UpdateUserData): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update user');
    }
    
    return response.json();
  },

  // Delete a user
  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  // Bulk update users
  bulkUpdateUsers: async (ids: string[], data: Partial<UpdateUserData>): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/bulk-update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, ...data }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update users');
    }
  },

  // Bulk delete users
  bulkDeleteUsers: async (ids: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete users');
    }
  },

  // Export users to CSV
  exportUsers: async (params: Omit<ListUsersParams, 'page' | 'limit'> = {}): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.set('search', params.search);
    if (params.roles?.length) queryParams.set('roles', params.roles.join(','));
    if (params.statuses?.length) queryParams.set('statuses', params.statuses.join(','));
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/export?${queryParams.toString()}`, {
      headers: {
        'Accept': 'text/csv',
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to export users');
    }
    
    return response.blob();
  },

  // Import users from CSV
  importUsers: async (file: File): Promise<{ success: number; failed: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/import`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to import users');
    }
    
    return response.json();
  },
};

export default api;

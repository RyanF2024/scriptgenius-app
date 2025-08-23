// Base API response type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Pagination type for paginated responses
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Common query parameters for API requests
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any; // For additional filters
}

// Common error response
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, string[]>;
}

// Common success response
export interface SuccessResponse {
  success: boolean;
  message: string;
}

// Type for API client configuration
export interface ApiClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
}

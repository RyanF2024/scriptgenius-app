import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosRequestHeaders,
} from 'axios';
import type { ApiClientConfig } from '@/types/api';

// Helper to check if running in browser
const isClient = () => typeof window !== 'undefined';

// Extend AxiosRequestConfig with our custom config
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// Extend the Error interface to include Axios error details
declare global {
  interface Error {
    config?: AxiosRequestConfig;
    code?: string;
    isAxiosError?: boolean;
    response?: AxiosResponse;
  }
}

export class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  private authToken: string | null = null;
  private refreshTokenRequest: Promise<string> | null = null;

  private constructor(config?: ApiClientConfig) {
    const baseURL = config?.baseURL || (process.env['NEXT_PUBLIC_API_URL'] as string) || '/api';
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {}),
      },
      withCredentials: config?.withCredentials ?? true,
      timeout: config?.timeout || 30000, // 30 seconds default timeout
    });

    // Initialize auth token from localStorage if available
    if (isClient()) {
      this.authToken = localStorage.getItem('access_token') || null;
      if (this.authToken) {
        this.setAuthToken(this.authToken);
      }
    }

    this.setupInterceptors();
  }

  /**
   * Get the singleton instance of the API client
   */
  public static getInstance(config?: ApiClientConfig): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  /**
   * Set the authentication token for API requests
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
    
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (isClient()) {
        localStorage.setItem('access_token', token);
      }
    } else {
      delete this.client.defaults.headers.common['Authorization'];
      if (isClient()) {
        localStorage.removeItem('access_token');
      }
    }
  }

  /**
   * Clear the authentication token
   */
  public clearAuthToken(): void {
    this.setAuthToken(null);
  }

  /**
   * Get the current authentication token
   */
  public getAuthToken(): string | null {
    return this.authToken;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Create a new headers object to avoid mutating the original
        const headers = { ...config.headers };
        
        // Add auth token if available
        if (this.authToken) {
          headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        // Add request timestamp for caching
        headers['X-Request-Timestamp'] = Date.now().toString();
        
        return {
          ...config,
          headers: headers as AxiosRequestHeaders,
        };
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Handle successful responses
        if (response.data && typeof response.data === 'object') {
          // You can transform the response data here if needed
          return response;
        }
        return response;
      },
      async (error: AxiosError<{ message?: string; code?: string; details?: any }>) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors (token expired)
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // If we don't have a refresh request in progress, create one
            if (!this.refreshTokenRequest) {
              this.refreshTokenRequest = this.refreshAccessToken();
            }
            
            // Wait for the refresh token request to complete
            const newToken = await this.refreshTokenRequest;
            this.refreshTokenRequest = null;
            
            // Update the auth header and retry the original request
            this.setAuthToken(newToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            return this.client(originalRequest);
          } catch (refreshError) {
            // If refresh token fails, clear auth and redirect to login
            this.clearAuthToken();
            
            // Only redirect if we're in the browser
            if (isClient() && window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          }
        }
        
        // Handle other errors
        const errorMessage = this.getErrorMessage(error);
        const statusCode = error.response?.status;
        
        // Log the error for debugging
        console.error(`API Error [${statusCode}]: ${errorMessage}`, {
          config: error.config,
          response: error.response?.data,
        });
        
        // Create a proper error object with more context
        const apiError = new Error(errorMessage) as Error & { 
          status?: number; 
          code?: string; 
          details?: any;
          isApiError: boolean;
        };
        
        apiError.status = statusCode;
        apiError.code = error.response?.data?.code || error.code;
        apiError.details = error.response?.data?.details;
        apiError.isApiError = true;
        
        return Promise.reject(apiError);
      }
    );
  }

  private getErrorMessage(error: AxiosError<{ message?: string }>): string {
    return error.response?.data?.message || error.message || 'An error occurred';
  }

  private async refreshAccessToken(): Promise<string> {
    // Implement your refresh token logic here
    // For example, you can make a POST request to your token endpoint
    // with the refresh token to obtain a new access token
    throw new Error('Not implemented');
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = ApiClient.getInstance();

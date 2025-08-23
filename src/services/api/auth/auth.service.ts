import { apiClient } from '@/lib/api-client';
import {
  SignInCredentials,
  SignUpData,
  AuthResponse,
  OAuthProvider,
  OAuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  UpdateProfileData,
  UserProfile,
} from './types';

class AuthService {
  private static instance: AuthService;
  private basePath = '/auth';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign in with email and password
  public async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      `${this.basePath}/signin`,
      credentials
    );
  }

  // Sign up a new user
  public async signUp(userData: SignUpData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(
      `${this.basePath}/signup`,
      userData
    );
  }

  // Initiate OAuth sign in
  public async signInWithOAuth(
    provider: OAuthProvider,
    redirectTo?: string
  ): Promise<OAuthResponse> {
    return apiClient.get<OAuthResponse>(
      `${this.basePath}/oauth/${provider}`,
      {
        params: { redirectTo },
      }
    );
  }

  // Request password reset
  public async requestPasswordReset(
    data: PasswordResetRequest
  ): Promise<void> {
    return apiClient.post<void>(
      `${this.basePath}/password/reset-request`,
      data
    );
  }

  // Reset password with token
  public async resetPassword(
    data: PasswordResetConfirm
  ): Promise<void> {
    return apiClient.post<void>(
      `${this.basePath}/password/reset`,
      data
    );
  }

  // Get current user profile
  public async getCurrentUser(): Promise<UserProfile> {
    return apiClient.get<UserProfile>(
      `${this.basePath}/me`
    );
  }

  // Update user profile
  public async updateProfile(
    userId: string,
    updates: UpdateProfileData
  ): Promise<UserProfile> {
    return apiClient.patch<UserProfile>(
      `${this.basePath}/profile/${userId}`,
      updates
    );
  }

  // Sign out
  public async signOut(): Promise<void> {
    return apiClient.post(`${this.basePath}/signout`);
  }

  // Refresh access token
  public async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return apiClient.post<{ accessToken: string }>(
      `${this.basePath}/refresh-token`,
      { refreshToken }
    );
  }
}

export const authService = AuthService.getInstance();

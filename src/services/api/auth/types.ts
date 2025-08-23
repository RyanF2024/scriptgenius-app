export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends SignInCredentials {
  fullName: string;
  metadata?: Record<string, any>;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type OAuthProvider = 'google' | 'github' | 'gitlab' | 'discord';

export interface OAuthResponse {
  url: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface UpdateProfileData {
  fullName?: string;
  avatarUrl?: string;
  // Add other profile fields as needed
}

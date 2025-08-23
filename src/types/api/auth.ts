import { ApiResponse } from './index';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  onboarding_completed: boolean;
  role: 'user' | 'admin' | 'superadmin';
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused';
  current_period_end?: string | null;
}

export interface UpdateProfileRequest {
  username?: string;
  full_name?: string;
  website?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UpdateProfileResponse extends ApiResponse<UserProfile> {}

export interface UploadAvatarResponse extends ApiResponse<{ url: string }> {}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse extends ApiResponse<{
  user: UserProfile;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  username: string;
  invite_code?: string;
}

export interface RegisterResponse extends LoginResponse {}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

// OAuth related types
export interface OAuthProvider {
  id: string;
  name: string;
  type: 'oauth' | 'oidc';
  clientId: string;
  authorizationUrl: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scope: string;
  style?: {
    logo: string;
    bgColor: string;
    textColor: string;
  };
}

export interface OAuthProvidersResponse extends ApiResponse<{
  providers: OAuthProvider[];
}> {}

export interface OAuthCallbackRequest {
  code: string;
  state?: string;
  error?: string;
  error_description?: string;
}

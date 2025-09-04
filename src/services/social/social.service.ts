import { supabase } from '@/lib/supabase/client';
import type { Provider, UserIdentity } from '@supabase/supabase-js';

// Define the supported providers
type SocialProvider = 'google' | 'github' | 'azure';

// Map our provider type to Supabase's Provider type
const getSupabaseProvider = (provider: SocialProvider): Provider => {
  switch (provider) {
    case 'google':
      return 'google';
    case 'github':
      return 'github';
    case 'azure':
      return 'azure';
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

export const socialService = {
  // Connect a social account
  async connectSocialAccount(provider: SocialProvider) {
    const supabaseProvider = getSupabaseProvider(provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/social/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Disconnect a social account
  async disconnectSocialAccount(providerId: string) {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    // Get user's identities
    const { data: { user: userWithIdentities }, error: fetchError } = await supabase.auth.getUser();
    
    if (fetchError || !userWithIdentities) {
      console.error('Error fetching user:', fetchError);
      throw new Error('Failed to fetch user data');
    }

    const userIdentities = userWithIdentities.identities || [];
    
    // Find the identity to remove
    const identityToRemove = userIdentities.find((id: UserIdentity) => id.provider === providerId);
    if (!identityToRemove) {
      throw new Error('Social account not found');
    }

    // If this is the last identity, check if user has a password set
    if (userIdentities.length === 1) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if user has a password set by attempting to reauthenticate with an empty password
      // If this fails with 'Invalid login credentials', it means a password is set
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: ''
      });
      
      // If there's no error or the error is not 'Invalid login credentials',
      // it means the user doesn't have a password set
      if (!signInError || signInError.message !== 'Invalid login credentials') {
        throw new Error('Cannot remove the last authentication method. Please set a password first.');
      }
    }

    // Unlink the identity using Supabase Auth API
    const { error: unlinkError } = await supabase.auth.unlinkIdentity(identityToRemove);

    if (unlinkError) {
      console.error('Error unlinking identity:', unlinkError);
      throw new Error('Failed to unlink the social account. Please try again.');
    }
    return { success: true };
  },

  // Get connected social accounts
  async getConnectedAccounts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user identities using Supabase Auth API
    const { data: { identities }, error } = await supabase.auth.getUserIdentities();

    if (error) {
      console.error('Error fetching connected accounts:', error);
      return [];
    }

    // Map the identities to match the expected format
    return (identities || []).map(identity => ({
      provider: identity.provider,
      identity_data: identity.identity_data
    }));
  },
};

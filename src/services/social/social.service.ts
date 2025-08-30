import { supabase } from '@/lib/supabase/client';
import type { Provider } from '@supabase/supabase-js';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current user's identities
    const { data: identities, error: fetchError } = await supabase
      .from('identities')
      .select('*')
      .eq('user_id', user.id);

    if (fetchError) throw fetchError;

    // Find the identity to remove
    const identityToRemove = identities?.find(id => id.provider === providerId);
    if (!identityToRemove) {
      throw new Error('Social account not found');
    }

    // If this is the last identity and no password is set, prevent removal
    if (identities?.length === 1) {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user?.email) {
        throw new Error('Cannot remove the last authentication method. Please set a password first.');
      }
    }

    // Remove the identity
    const { error: deleteError } = await supabase
      .from('identities')
      .delete()
      .eq('id', identityToRemove.id);

    if (deleteError) throw deleteError;
    return { success: true };
  },

  // Get connected social accounts
  async getConnectedAccounts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: identities, error } = await supabase
      .from('identities')
      .select('provider, identity_data')
      .eq('user_id', user.id);

    if (error) throw error;
    return identities || [];
  },
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useApiErrorHandler } from '@/lib/api-error-handler';
import { optimizeImage, validateFile, blobToFile } from '@/lib/utils/image';

export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const { handleError } = useApiErrorHandler();

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Optimize image
      const optimizedImage = await optimizeImage(file);
      const optimizedFile = await blobToFile(optimizedImage, file.name, file.type);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimizedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      handleError(error, 'Failed to upload avatar');
    },
  });

  return {
    uploadAvatar: uploadAvatar.mutateAsync,
    isUploading: uploadAvatar.isPending,
  };
}

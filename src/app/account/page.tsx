'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useAvatarUpload } from '@/features/profile/hooks/useAvatarUpload';
import { validateFile } from '@/lib/utils/image';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Form } from '@/components/forms/Form';
import { FormInput } from '@/components/forms/FormInput';
import { FormButton } from '@/components/forms/FormButton';
import { profileSchema, type ProfileFormValues } from '@/lib/validations/schemas';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';

export default function AccountPage() {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      website: profile?.website || '',
      bio: profile?.bio || '',
    },
    mode: 'onChange',
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || '',
        full_name: profile.full_name || '',
        website: profile.website || '',
        bio: profile.bio || '',
      });
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile, form]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return;

      const file = e.target.files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      try {
        await uploadAvatar(file);
        toast.success('Profile picture updated successfully');
      } catch (error) {
        // Revert preview on error
        setAvatarPreview(profile?.avatar_url || null);
        toast.error('Failed to upload profile picture');
      }
    },
    [uploadAvatar, profile?.avatar_url]
  );

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        ...data,
        updated_at: new Date().toISOString(),
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <Form<typeof profileSchema> 
        schema={profileSchema} 
        onSubmit={onSubmit}
        defaultValues={{
          username: profile?.username || '',
          full_name: profile?.full_name || '',
          website: profile?.website || '',
          bio: profile?.bio || '',
        }}
      >
        {({ formState: { isSubmitting, errors } }) => (
          <div className="flex flex-col md:flex-row gap-8 bg-card p-6 rounded-lg shadow-sm border">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-muted">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt={profile?.full_name || 'Profile picture'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                    quality={85}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground">
                      {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <label className={cn(
                "mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90",
                "cursor-pointer w-full text-center",
                (isUploading || isSubmitting) && "opacity-50 cursor-not-allowed"
              )}>
                <Upload className="w-4 h-4 mr-2" />
                Change Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading || isSubmitting}
                />
              </label>
              <p className="mt-2 text-xs text-muted-foreground text-center">
                JPG, PNG, WebP, or AVIF. Max 2MB.
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <FormInput
                label="Username"
                placeholder="Enter your username"
                registration={{
                  ...form.register('username'),
                  name: 'username',
                }}
                error={errors.username}
                autoComplete="username"
              />

              <FormInput
                label="Full Name"
                placeholder="Enter your full name"
                registration={{
                  ...form.register('full_name'),
                  name: 'full_name',
                }}
                error={errors.full_name}
                autoComplete="name"
              />

              <FormInput
                label="Website"
                placeholder="https://example.com"
                type="url"
                registration={{
                  ...form.register('website'),
                  name: 'website',
                }}
                error={errors.website}
                autoComplete="url"
              />

              <div className="space-y-2">
                <label 
                  htmlFor="bio" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  {...form.register('bio')}
                  rows={4}
                  className={cn(
                    "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    errors.bio && "border-red-500"
                  )}
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <FormButton 
                  isLoading={isSubmitting || isUpdating}
                  loadingText="Saving..."
                >
                  Save Changes
                </FormButton>
              </div>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}

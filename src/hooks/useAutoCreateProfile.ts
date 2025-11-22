// Create this file: src/hooks/useAutoCreateProfile.ts
// Add this to BOTH client and provider sites

import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAutoCreateProfile() {
  const { user, isLoaded } = useUser();
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    async function createProfileIfNeeded() {
      if (!isLoaded || !user || profileCreated) return;

      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, user_type')
          .eq('clerk_user_id', user.id)
          .single();

        if (existingProfile) {
          setProfileCreated(true);
          return;
        }

        // Get user_type from Clerk metadata
        const userType = user.unsafeMetadata?.user_type as string || 'customer';

        // Create profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            full_name: user.fullName || user.firstName || 'User',
            phone_number: user.primaryPhoneNumber?.phoneNumber || null,
            user_type: userType,
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // Create type-specific profile
        if (userType === 'provider' && newProfile) {
          await supabase.from('provider_profiles').insert({
            profile_id: newProfile.id,
            service_radius_km: 25,
            verification_level: 0,
          });
        } else if (userType === 'customer' && newProfile) {
          await supabase.from('customer_profiles').insert({
            profile_id: newProfile.id,
          });
        }

        setProfileCreated(true);
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    }

    createProfileIfNeeded();
  }, [user, isLoaded, profileCreated]);

  return { profileCreated };
}
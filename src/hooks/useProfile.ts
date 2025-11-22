import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { supabase, type Profile } from '@/lib/supabase';

export function useProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        // Check if profile exists
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          console.error('Error loading profile:', error);
          return;
        }

        if (data) {
          setProfile(data);
        } else {
          // Create profile if doesn't exist
          const newProfile = {
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            full_name: user.fullName || '',
            phone_number: user.primaryPhoneNumber?.phoneNumber || null,
            user_type: user.publicMetadata.userType || 'customer',
            avatar_url: user.imageUrl || null,
          };

          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }

          setProfile(created);

          // Create customer/provider profile based on user type
          if (newProfile.user_type === 'customer') {
            await supabase.from('customer_profiles').insert([
              {
                profile_id: created.id,
              },
            ]);
          } else {
            await supabase.from('provider_profiles').insert([
              {
                profile_id: created.id,
                is_available: true,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Profile error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  return { profile, loading };
}
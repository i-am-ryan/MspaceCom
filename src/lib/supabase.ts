// src/lib/supabase.ts - Replace your current file with this

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Simple Supabase client - no Clerk integration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type Profile = {
  id: string;
  clerk_user_id: string; // Will store Supabase user ID now
  email: string;
  full_name: string;
  phone_number: string | null;
  user_type: 'customer' | 'provider';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerProfile = {
  id: string;
  profile_id: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  formatted_address: string | null;
  latitude: number | null;
  longitude: number | null;
  location: any;
  preferred_payment_method: string | null;
};

export type ProviderProfile = {
  id: string;
  profile_id: string;
  business_name: string | null;
  bio: string | null;
  years_of_experience: number | null;
  address: string | null;
  city: string | null;
  province: string | null;
  service_radius_km: number;
  is_verified: boolean;
  is_available: boolean;
  average_rating: number;
  total_reviews: number;
  total_jobs_completed: number;
};
// src/lib/api.ts - CLIENT SITE with Supabase Auth

import { supabase } from './supabase';

// ==================================
// USER PROFILE - Updated for Supabase Auth
// ==================================

export async function getUserProfile(userId: string) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    // Get customer profile
    const { data: customerProfiles } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('profile_id', profile.id);

    return {
      ...profile,
      customer_profiles: customerProfiles || [],
    };
  } catch (error) {
    console.error('getUserProfile error:', error);
    throw error;
  }
}

export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return getUserProfile(user.id);
}

export async function updateCustomerLocation(profileId: string, location: {
  latitude: number;
  longitude: number;
  formatted_address: string;
  city?: string;
  province?: string;
}) {
  const { data, error } = await supabase
    .from('customer_profiles')
    .update({
      latitude: location.latitude,
      longitude: location.longitude,
      formatted_address: location.formatted_address,
      city: location.city,
      province: location.province,
    })
    .eq('profile_id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================================
// SERVICE CATEGORIES
// ==================================

export async function getServiceCategories() {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
}

export async function searchServices(query: string) {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
}

// ==================================
// FIND NEARBY PROVIDERS
// ==================================

export async function findNearbyProviders(params: {
  latitude: number;
  longitude: number;
  categoryId: string;
  maxDistanceKm?: number;
}) {
  const { data, error } = await supabase.rpc('find_nearby_providers', {
    request_lat: params.latitude,
    request_lon: params.longitude,
    category_uuid: params.categoryId,
    max_distance_km: params.maxDistanceKm || 50,
  });

  if (error) throw error;
  return data;
}

// ==================================
// SERVICE REQUESTS
// ==================================

export async function createServiceRequest(request: {
  customer_id: string;
  category_id: string;
  title: string;
  description: string;
  address: string;
  city?: string;
  province?: string;
  latitude: number;
  longitude: number;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  budget_min?: number;
  budget_max?: number;
  images?: string[];
}) {
  const { data, error } = await supabase
    .from('service_requests')
    .insert([
      {
        ...request,
        location: `POINT(${request.longitude} ${request.latitude})`,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyServiceRequests(customerId: string) {
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      service_categories(name, icon, color)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ==================================
// BOOKINGS
// ==================================

export async function createBooking(booking: {
  request_id: string;
  customer_id: string;
  provider_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  total_amount: number;
  call_out_fee?: number;
}) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyBookings(userId: string, userType: 'customer' | 'provider') {
  const column = userType === 'customer' ? 'customer_id' : 'provider_id';
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service_requests(title, category_id),
      customer:customer_profiles(profile_id(full_name, phone_number)),
      provider:provider_profiles(profile_id(full_name, phone_number), business_name)
    `)
    .eq(column, userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ==================================
// REVIEWS
// ==================================

export async function createReview(review: {
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  title?: string;
  comment?: string;
  would_recommend?: boolean;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProviderReviews(providerId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:customer_profiles(profile_id(full_name, avatar_url))
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ==================================
// MESSAGES
// ==================================

export async function getConversation(bookingId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (error && error.code === 'PGRST116') {
    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id, provider_id')
      .eq('id', bookingId)
      .single();

    if (booking) {
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert([
          {
            booking_id: bookingId,
            customer_id: booking.customer_id,
            provider_id: booking.provider_id,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;
      return newConv;
    }
  }

  if (error) throw error;
  return data;
}

export async function sendMessage(message: {
  conversation_id: string;
  sender_profile_id: string;
  content: string;
}) {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(full_name, avatar_url, user_type)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true});

  if (error) throw error;
  return data;
}

// ==================================
// REALTIME SUBSCRIPTIONS
// ==================================

export function subscribeToMessages(
  conversationId: string,
  callback: (message: any) => void
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToNotifications(
  profileId: string,
  callback: (notification: any) => void
) {
  return supabase
    .channel(`notifications:${profileId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `profile_id=eq.${profileId}`,
      },
      callback
    )
    .subscribe();
}
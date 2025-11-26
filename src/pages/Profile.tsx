// LOCATION: /src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { ArrowLeft, MapPin, Phone, Mail, Edit2, Save, X, Home, Search, CalendarClock, MessageSquare, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<any>(null);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/signin");
    } else if (isLoaded && isSignedIn && user) {
      loadProfile();
    }
  }, [isLoaded, isSignedIn, user]);

  const loadProfile = async () => {
    if (!user) return;

    console.log("=== LOADING PROFILE ===");
    console.log("Clerk user ID:", user.id);
    console.log("Email:", user.primaryEmailAddress?.emailAddress);
    console.log("Full name:", user.fullName);

    try {
      // Try to load profile with a direct query first (bypassing potential RLS)
      console.log("Querying Supabase for profile...");
      
      // First attempt: Try with maybeSingle
      let profileData = null;
      let profileError = null;
      
      const query1 = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .maybeSingle();
      
      profileData = query1.data;
      profileError = query1.error;

      console.log("Query result:", { profileData, profileError });

      // If not found, try querying by email as fallback
      if (!profileData && user.primaryEmailAddress?.emailAddress) {
        console.log("Trying to find by email...");
        const query2 = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.primaryEmailAddress.emailAddress)
          .maybeSingle();
        
        if (query2.data) {
          console.log("Found profile by email, updating clerk_user_id...");
          // Update the clerk_user_id to match current user
          const { data: updated } = await supabase
            .from('profiles')
            .update({ clerk_user_id: user.id })
            .eq('id', query2.data.id)
            .select()
            .single();
          
          profileData = updated || query2.data;
        }
      }

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile query error:", profileError);
        throw profileError;
      }

      if (!profileData) {
        // Profile doesn't exist - create it
        console.log("=== PROFILE NOT FOUND - CREATING NEW ===");
        const newProfileData = {
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          full_name: user.fullName || user.firstName || '',
          phone_number: user.primaryPhoneNumber?.phoneNumber || null,
          user_type: 'customer' as const,
        };
        
        console.log("Inserting profile:", newProfileData);

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfileData)
          .select()
          .single();

        console.log("Insert result:", { newProfile, createError });

        if (createError) {
          console.error("=== CREATE ERROR DETAILS ===");
          console.error("Full error object:", createError);
          
          // If duplicate key error, fetch the existing profile
          if (createError.code === '23505' || createError.message?.includes('duplicate') || createError.message?.includes('unique')) {
            console.log("Duplicate detected - fetching existing profile...");
            
            // Wait a bit for DB to settle
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('clerk_user_id', user.id)
              .single();
            
            if (existingProfile) {
              console.log("Found existing profile after conflict:", existingProfile);
              profileData = existingProfile;
            } else {
              // Try by email
              const { data: byEmail } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', user.primaryEmailAddress?.emailAddress || '')
                .single();
              
              if (byEmail) {
                console.log("Found by email:", byEmail);
                profileData = byEmail;
              } else {
                throw new Error("Profile exists but cannot be retrieved. Please contact support.");
              }
            }
          } else {
            throw createError;
          }
        } else {
          profileData = newProfile;
        }

        // If we still don't have profile data, something is wrong
        if (!profileData) {
          throw new Error("Failed to create or retrieve profile");
        }

        console.log("Using profile:", profileData);
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setPhoneNumber(profileData.phone_number || "");

        // Create empty customer profile
        const { error: customerCreateError } = await supabase
          .from('customer_profiles')
          .insert({
            profile_id: profileData.id,
          });

        if (customerCreateError && customerCreateError.code !== '23505') {
          console.error("Error creating customer profile:", customerCreateError);
        }

        setLoading(false);
        return;
      }

      // Profile exists, load it
      console.log("=== PROFILE FOUND ===");
      console.log("Profile data:", profileData);
      setProfile(profileData);
      setFullName(profileData.full_name || "");
      setPhoneNumber(profileData.phone_number || "");

      // Load customer profile
      const { data: customerData, error: customerError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('profile_id', profileData.id)
        .maybeSingle();

      if (customerError && customerError.code !== 'PGRST116') {
        console.error("Customer profile query error:", customerError);
      }

      console.log("Customer profile data:", customerData);

      if (customerData) {
        setCustomerProfile(customerData);
        setAddress(customerData.formatted_address || customerData.address || "");
        setCity(customerData.city || "");
        setProvince(customerData.province || "");
        setPostalCode(customerData.postal_code || "");
      } else {
        // Create customer profile if it doesn't exist
        console.log("Creating customer profile for profile_id:", profileData.id);
        const { error: createCustomerError } = await supabase
          .from('customer_profiles')
          .insert({
            profile_id: profileData.id,
          });
        
        if (createCustomerError && createCustomerError.code !== '23505') {
          console.error("Error creating customer profile:", createCustomerError);
        }
      }

    } catch (error: any) {
      console.error("=== FATAL ERROR ===");
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load profile data. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!profile?.id || !user) {
        throw new Error("Profile not loaded");
      }

      // Update main profile - use profile.id instead of clerk_user_id
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw new Error(profileError.message || "Failed to update profile");
      }

      // Update customer profile - check if exists first
      if (customerProfile?.id) {
        // Update existing customer profile
        const { error: customerError } = await supabase
          .from('customer_profiles')
          .update({
            formatted_address: address.trim() || null,
            address: address.trim() || null,
            city: city.trim() || null,
            province: province.trim() || null,
            postal_code: postalCode.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customerProfile.id);

        if (customerError) {
          console.error("Customer profile update error:", customerError);
          throw new Error(customerError.message || "Failed to update location");
        }
      } else {
        // Create new customer profile
        const { error: customerError } = await supabase
          .from('customer_profiles')
          .insert({
            profile_id: profile.id,
            formatted_address: address.trim() || null,
            address: address.trim() || null,
            city: city.trim() || null,
            province: province.trim() || null,
            postal_code: postalCode.trim() || null,
          })
          .select()
          .single();

        if (customerError) {
          console.error("Customer profile creation error:", customerError);
          throw new Error(customerError.message || "Failed to create customer profile");
        }
      }

      setEditing(false);
      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });

      // Reload profile to get fresh data
      await loadProfile();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || "");
    setPhoneNumber(profile?.phone_number || "");
    setAddress(customerProfile?.formatted_address || customerProfile?.address || "");
    setCity(customerProfile?.city || "");
    setProvince(customerProfile?.province || "");
    setPostalCode(customerProfile?.postal_code || "");
    setEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/welcome");
  };

  const getInitials = () => {
    if (!user?.fullName && !profile?.full_name) return "U";
    const name = user?.fullName || profile?.full_name || "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/home" className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="p-2 hover:bg-muted rounded-full"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-muted rounded-full"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                className="p-2 hover:bg-muted rounded-full text-primary"
                disabled={saving}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mb-4">
            {getInitials()}
          </div>
          <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!editing}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="h-12 pl-10 bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!editing}
                className="h-12 pl-10"
                placeholder="+27 81 234 5678"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h2>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!editing}
              className="h-12"
              placeholder="123 Main Street, Sandton"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!editing}
                className="h-12"
                placeholder="Johannesburg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                disabled={!editing}
                className="h-12"
                placeholder="Gauteng"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              disabled={!editing}
              className="h-12"
              placeholder="2196"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Account Type</h2>
          <div className="p-4 bg-muted rounded-xl">
            <p className="font-semibold capitalize">{profile?.user_type || "Customer"}</p>
            <p className="text-sm text-muted-foreground">
              You can book services from providers
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button variant="outline" className="w-full h-12" asChild>
            <Link to="/bookings">My Bookings</Link>
          </Button>
          <Button variant="outline" className="w-full h-12" asChild>
            <Link to="/service-history">Service History</Link>
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around h-16">
          <Link to="/home" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/services" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </Link>
          <Link to="/book" className="flex flex-col items-center gap-1 -mt-6">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <CalendarClock className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary">Book</span>
          </Link>
          <Link to="/messages" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-primary">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Profile;
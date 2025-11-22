// src/pages/Profile.tsx - CLIENT SITE with Supabase Auth

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Edit2, Save, X, Home, Search, CalendarClock, MessageSquare, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/signin");
        return;
      }

      setUser(user);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setFullName(profileData?.full_name || "");
      setPhoneNumber(profileData?.phone_number || "");

      // Load customer profile
      if (profileData) {
        const { data: customerData } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('profile_id', profileData.id)
          .single();

        if (customerData) {
          setAddress(customerData.formatted_address || customerData.address || "");
          setCity(customerData.city || "");
          setProvince(customerData.province || "");
          setPostalCode(customerData.postal_code || "");
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!profile?.id || !user) return;

      // Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
        })
        .eq('clerk_user_id', user.id);

      if (profileError) throw profileError;

      // Update customer profile
      const { error: customerError } = await supabase
        .from('customer_profiles')
        .update({
          formatted_address: address.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          province: province.trim() || null,
          postal_code: postalCode.trim() || null,
        })
        .eq('profile_id', profile.id);

      if (customerError) throw customerError;

      setEditing(false);
      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });

      // Reload profile
      await loadUser();
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
    setEditing(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/welcome");
  };

  const getInitials = () => {
    if (!profile?.full_name) return "U";
    return profile.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
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
          <p className="text-sm text-muted-foreground">{user?.email}</p>
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
                value={user?.email || ""}
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
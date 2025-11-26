// LOCATION: /src/pages/SignUp.tsx
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Home as HomeIcon } from "lucide-react";
import { SignUp as ClerkSignUp, useUser } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import plumberImg from "@/assets/signup-plumber.jpg";
import electricianImg from "@/assets/signup-electrician.jpg";
import painterImg from "@/assets/signup-painter.jpg";
import handymanImg from "@/assets/signup-handyman.jpg";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoaded, isSignedIn, user } = useUser();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLocationStep, setShowLocationStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasCheckedProfile = useRef(false);
  
  // Location fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const images = [
    plumberImg,
    electricianImg,
    painterImg,
    handymanImg
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Check if user just signed up - only run once
  useEffect(() => {
    const checkSignupComplete = async () => {
      if (isLoaded && isSignedIn && user && !hasCheckedProfile.current) {
        hasCheckedProfile.current = true;

        try {
          // Check if profile exists in Supabase
          const { data: profile, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('clerk_user_id', user.id)
            .maybeSingle();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error("Error checking profile:", checkError);
            throw checkError;
          }

          if (!profile) {
            // Profile doesn't exist, create it first then show location step
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                clerk_user_id: user.id,
                email: user.primaryEmailAddress?.emailAddress || '',
                full_name: user.fullName || user.firstName || '',
                phone_number: user.primaryPhoneNumber?.phoneNumber || null,
                user_type: 'customer',
              })
              .select('id')
              .single();

            if (createError) {
              console.error("Error creating profile:", createError);
              throw createError;
            }

            console.log("Profile created successfully:", newProfile);
            
            // Show location step
            setShowLocationStep(true);
          } else {
            // Profile exists, go to home
            navigate('/home', { replace: true });
          }
        } catch (error) {
          console.error("Error in signup flow:", error);
          // Even on error, try to show location step so user can proceed
          setShowLocationStep(true);
        }
      }
    };

    checkSignupComplete();
  }, [isLoaded, isSignedIn, user, navigate]);

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Get the profile that was already created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (profileError) {
        console.error("Profile not found:", profileError);
        throw new Error("Profile not found. Please try signing in again.");
      }

      // Create customer profile with location
      const { error: customerError } = await supabase
        .from('customer_profiles')
        .insert({
          profile_id: profile.id,
          address: address.trim() || null,
          formatted_address: address.trim() || null,
          city: city.trim() || null,
          province: province.trim() || null,
          postal_code: postalCode.trim() || null,
        });

      if (customerError) throw customerError;

      toast({
        title: "Welcome to Mspaces! 🎉",
        description: "Your profile has been set up successfully.",
      });

      // Redirect to home
      navigate('/home', { replace: true });

    } catch (error: any) {
      console.error("Location save error:", error);
      toast({
        variant: "destructive",
        title: "Failed to save location",
        description: error.message || "Please try again.",
      });
      setLoading(false);
    }
  };

  const handleSkipLocation = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Get the profile that was already created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user.id)
        .single();

      if (profileError) {
        console.error("Profile not found:", profileError);
        // Try to navigate anyway
        navigate('/home', { replace: true });
        return;
      }

      // Create empty customer profile
      await supabase.from('customer_profiles').insert({
        profile_id: profile.id,
      });

      toast({
        title: "Welcome to Mspaces! 🎉",
        description: "You can add your location later in settings.",
      });

      navigate('/home', { replace: true });
    } catch (error) {
      console.error("Skip location error:", error);
      navigate('/home', { replace: true });
    }
  };

  // Show location step after Clerk signup
  if (showLocationStep) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={images[currentImageIndex]}
              alt="Service professional"
              className="w-full h-full object-cover opacity-20 transition-opacity duration-1000"
            />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
            <div className="text-center text-white">
              <h1 className="text-5xl font-bold mb-4">Almost Done!</h1>
              <p className="text-xl text-white/90">
                Help us find the best service providers near you
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-background overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center z-10">
            <span className="ml-3 font-semibold text-lg">Set Your Location</span>
          </div>

          <div className="p-6 max-w-md mx-auto flex items-center justify-center min-h-[calc(100vh-73px)]">
            <div className="w-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Where are you located?</h2>
                <p className="text-muted-foreground">
                  This helps us connect you with nearby service providers
                </p>
              </div>

              <form onSubmit={handleLocationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main Street, Sandton"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Johannesburg"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      type="text"
                      placeholder="Gauteng"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="2196"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !city}
                  className="w-full h-12 bg-primary hover:bg-primary/90"
                >
                  {loading ? "Saving..." : "Complete Setup"}
                </Button>

                <button
                  type="button"
                  onClick={handleSkipLocation}
                  disabled={loading}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Skip for now (you can add this later)
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Clerk signup form
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt="Service provider at work"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primary/60" />
          </div>
        ))}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Join Mspaces</h1>
            <p className="text-xl text-white/90">
              Find trusted service providers near you
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-background overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center z-10">
          <Link to="/welcome" className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <span className="ml-3 font-semibold text-lg">Sign Up</span>
        </div>

        <div className="p-6 max-w-md mx-auto flex items-center justify-center min-h-[calc(100vh-73px)]">
          <ClerkSignUp
            routing="path"
            path="/signup"
            signInUrl="/signin"
            afterSignUpUrl="/signup"
            unsafeMetadata={{
              user_type: "customer"
            }}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none w-full border-0",
                footer: "hidden",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
                socialButtonsBlockButton: "border-primary/20 hover:bg-primary/5",
                formFieldInput: "border-primary/20 focus:border-primary focus:ring-primary",
                footerActionLink: "text-primary hover:text-primary/80",
              },
              variables: {
                colorPrimary: "#5EBFB3",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
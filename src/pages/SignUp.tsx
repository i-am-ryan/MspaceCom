// SUPABASE BUILT-IN EMAIL CONFIRMATION - Works immediately!

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, MapPin, Home as HomeIcon, AlertCircle, CheckCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import plumberImg from "@/assets/signup-plumber.jpg";
import electricianImg from "@/assets/signup-electrician.jpg";
import painterImg from "@/assets/signup-painter.jpg";
import handymanImg from "@/assets/signup-handyman.jpg";

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football'
];

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    isWeak: false,
    isCommon: false,
  });

  const images = [plumberImg, electricianImg, painterImg, handymanImg];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength({ score: 0, feedback: "", isWeak: false, isCommon: false });
      return;
    }

    let score = 0;
    let feedback = "";
    let isWeak = false;
    let isCommon = false;

    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      isCommon = true;
      feedback = "This password is too common and easily guessed";
      setPasswordStrength({ score: 0, feedback, isWeak: true, isCommon: true });
      return;
    }

    if (password.length < 6) {
      feedback = "Password is too short (minimum 6 characters)";
      isWeak = true;
    } else if (password.length < 8) {
      score += 1;
      feedback = "Weak password - add more characters";
      isWeak = true;
    } else if (password.length >= 8) {
      score += 2;
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLowerCase) score += 1;
    if (hasUpperCase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSpecialChars) score += 1;

    const hasSequential = /abc|bcd|cde|123|234|345|456|567|678|789/i.test(password);
    if (hasSequential) {
      score -= 1;
      feedback = "Avoid sequential characters";
      isWeak = true;
    }

    const hasRepeated = /(.)\1{2,}/.test(password);
    if (hasRepeated) {
      score -= 1;
      feedback = "Avoid repeated characters";
      isWeak = true;
    }

    if (!isWeak) {
      if (score < 3) {
        feedback = "Weak password";
        isWeak = true;
      } else if (score < 5) {
        feedback = "Medium strength password";
      } else {
        feedback = "Strong password!";
      }
    }

    setPasswordStrength({ score, feedback, isWeak, isCommon });
  }, [password]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !phoneNumber) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    if (passwordStrength.isCommon) {
      toast({
        variant: "destructive",
        title: "Password too common",
        description: "Please choose a more unique password.",
      });
      return;
    }

    setStep(2);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use Supabase's built-in email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: 'customer',
          },
          emailRedirectTo: 'https://mspace-com.vercel.app/confirm-email',
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        await supabase.from('profiles').insert({
          clerk_user_id: authData.user.id,
          email: email,
          full_name: fullName,
          phone_number: phoneNumber,
          user_type: 'customer',
        });

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('clerk_user_id', authData.user.id)
          .single();

        if (profile) {
          await supabase.from('customer_profiles').insert({
            profile_id: profile.id,
            address: address.trim() || null,
            formatted_address: address.trim() || null,
            city: city.trim() || null,
            province: province.trim() || null,
            postal_code: postalCode.trim() || null,
          });
        }

        setUserEmail(email);
        setUserName(fullName);
        setShowSuccessBanner(true);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "Please try again.",
      });
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.isCommon || passwordStrength.isWeak) return "text-red-500";
    if (passwordStrength.score < 3) return "text-orange-500";
    if (passwordStrength.score < 5) return "text-yellow-500";
    return "text-green-500";
  };

  if (showSuccessBanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-primary">
            Welcome to the Mspaces Family! 🎉
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6">
            Thank you for joining us, <span className="font-semibold text-foreground">{userName}</span>!
          </p>
          
          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 mb-6">
            <Mail className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Check Your Email</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We've sent a confirmation email to:
            </p>
            <p className="font-mono text-sm bg-white px-4 py-2 rounded-lg border">
              {userEmail}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Please click the confirmation link in the email to activate your account.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder.
            </p>
            
            <Button
              onClick={() => navigate("/signin", { replace: true, state: { fromSignup: true } })}
              className="w-full h-12 bg-primary hover:bg-primary/90"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <img src={img} alt="Service provider" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/60" />
          </div>
        ))}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Join Mspaces</h1>
            <p className="text-xl text-white/90">
              South Africa's trusted handyman platform
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-background overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center z-10">
          {step === 2 ? (
            <button onClick={() => setStep(1)} className="p-2 -ml-2 hover:bg-muted rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <Link to="/welcome" className="p-2 -ml-2 hover:bg-muted rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Link>
          )}
          <span className="ml-3 font-semibold text-lg">
            Sign Up {step === 2 && "- Location"}
          </span>
        </div>

        <div className="p-6 max-w-md mx-auto flex items-center justify-center min-h-[calc(100vh-73px)]">
          <div className="w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {step === 1 ? "Create your account" : "Where are you located?"}
              </h2>
              <p className="text-muted-foreground">
                {step === 1 ? "Get started with Mspaces today" : "Help us find the best service providers near you"}
              </p>
            </div>

            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+27 81 234 5678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 pr-10 h-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {password.length > 0 && (
                    <div className="flex items-start gap-2 mt-2">
                      {passwordStrength.isCommon || passwordStrength.isWeak ? (
                        <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getPasswordStrengthColor()}`} />
                      ) : (
                        <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getPasswordStrengthColor()}`} />
                      )}
                      <p className={`text-xs ${getPasswordStrengthColor()}`}>
                        {passwordStrength.feedback}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters. Avoid common passwords.
                  </p>
                </div>

                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90">
                  Continue
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSignUp} className="space-y-4">
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
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Johannesburg"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
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

                <p className="text-sm text-muted-foreground">
                  You can skip this step and update your location and other details later in your profile.
                </p>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary/90"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}

            {step === 1 && (
              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
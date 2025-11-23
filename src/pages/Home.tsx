// src/pages/Home.tsx - FIXED VERSION
// The issue was checking auth before Supabase processed the URL hash tokens

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  MapPin,
  Search,
  Mic,
  Droplets,
  Zap,
  DoorOpen,
  Wind,
  Home as HomeIcon,
  MessageSquare,
  User,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { searchServices } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import handymanBg from "@/assets/signup-handyman.jpg";
import mspacesLogo from "@/assets/mspaces-logo.jpg";
import airconImg from "@/assets/aircon.jpg";

const featuredServices = [
  { 
    name: "Plumbing & Leaks", 
    icon: Droplets, 
    color: "from-blue-500 to-blue-600",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop"
  },
  { 
    name: "Electrical Services", 
    icon: Zap, 
    color: "from-yellow-500 to-orange-500",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop"
  },
  { 
    name: "Gates & Automation", 
    icon: DoorOpen, 
    color: "from-gray-600 to-gray-700",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
  },
  { 
    name: "HVAC & Aircon", 
    icon: Wind, 
    color: "from-cyan-500 to-blue-500",
    image: airconImg
  },
];

const quickActions = [
  { label: "Book Service", href: "/book", variant: "default" as const },
  { label: "Track Booking", href: "/bookings", variant: "secondary" as const },
  { label: "My History", href: "/service-history", variant: "secondary" as const },
];

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (location.pathname === '/home') {
      loadUser();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadUser = async () => {
    try {
      // CRITICAL FIX: Wait for Supabase to process any hash tokens first
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Only redirect to signin if we're really not authenticated
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

      if (profileError) {
        console.error("Profile error:", profileError);
        // If profile doesn't exist yet, that's okay - show basic view
        setLoading(false);
        return;
      }
      
      setProfile(profileData);

      // Load customer profile (for location)
      if (profileData) {
        const { data: customerData } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('profile_id', profileData.id)
          .single();

        setCustomerProfile(customerData);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const results = await searchServices(query);
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const getDisplayName = () => {
    if (loading) return "Loading...";
    if (!profile?.full_name) return "User";
    
    const firstName = profile.full_name.split(' ')[0];
    return firstName;
  };

  const getDisplayLocation = () => {
    if (loading) return "Loading location...";
    
    if (!customerProfile) {
      return "Set your location";
    }

    if (customerProfile.formatted_address) {
      return customerProfile.formatted_address;
    }
    
    if (customerProfile.city && customerProfile.province) {
      return `${customerProfile.city}, ${customerProfile.province}`;
    }
    
    if (customerProfile.city) {
      return customerProfile.city;
    }
    
    if (customerProfile.address) {
      return customerProfile.address;
    }
    
    return "Set your location";
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-card/95 backdrop-blur-md border-b border-border shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className={`flex items-center justify-between p-4 max-w-7xl mx-auto ${
          isScrolled ? '' : 'text-white drop-shadow-lg'
        }`}>
          <div className="flex items-center gap-3">
            <img 
              src={mspacesLogo} 
              alt="Mspaces" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <h1 className="text-xl font-bold">Mspaces</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="p-2 hover:bg-white/10 rounded-full relative">
              <Bell className="w-6 h-6" />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              )}
            </Link>
            <Link to="/profile" className={`w-8 h-8 rounded-full ${isScrolled ? 'bg-primary' : 'bg-white/20 backdrop-blur-md'} text-primary-foreground font-semibold text-sm flex items-center justify-center`}>
              {getDisplayName().charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat -mt-[73px] pt-[73px]"
        style={{ 
          backgroundImage: `url(${handymanBg})`,
          backgroundPosition: 'center 30%',
          minHeight: '300px',
        }}
      >
        <div className="absolute inset-0 bg-primary/50 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-6 text-white max-w-7xl mx-auto">
          <div className="mb-4 pt-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-lg">
              Hi {getDisplayName()} 👋
            </h2>
            <Link 
              to="/profile" 
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity bg-white/20 backdrop-blur-md rounded-full px-4 py-2"
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{getDisplayLocation()}</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                asChild
                variant={action.variant}
                className="rounded-full px-3 sm:px-6 shadow-lg text-xs sm:text-sm h-10 sm:h-11 whitespace-nowrap"
              >
                <Link to={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-4 mb-6 relative z-20 max-w-7xl mx-auto">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
          <Input
            placeholder="What do you need help with?"
            className="h-14 pl-12 pr-12 text-base rounded-xl bg-white shadow-lg"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground z-10">
            <Mic className="w-5 h-5" />
          </button>

          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-border max-h-80 overflow-y-auto z-50">
              {searchResults.map((service) => (
                <Link
                  key={service.id}
                  to={`/book?service=${encodeURIComponent(service.name)}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b border-border last:border-0"
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery("");
                  }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color || 'from-primary to-primary/80'} flex items-center justify-center`}>
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      <section className="px-4 sm:px-6 lg:px-8 mb-6 max-w-7xl mx-auto">
        <h3 className="text-xl font-bold mb-4">Browse Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl">
          {featuredServices.map((service) => (
            <Link
              key={service.name}
              to={`/book?service=${encodeURIComponent(service.name)}`}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-80 group-hover:opacity-70 transition-opacity`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <service.icon className="w-8 h-8 sm:w-10 sm:h-10 mb-2 drop-shadow-lg" />
                  <p className="text-xs sm:text-sm font-semibold text-center leading-tight drop-shadow-md">
                    {service.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link 
          to="/services" 
          className="flex items-center justify-center gap-2 mt-6 text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          <span>View all services</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around h-16 max-w-7xl mx-auto">
          <Link to="/home" className="flex flex-col items-center gap-1 text-primary">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/services"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </Link>
          <Link
            to="/book"
            className="flex flex-col items-center gap-1 -mt-6"
          >
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <CalendarClock className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary">Book</span>
          </Link>
          <Link
            to="/messages"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground relative"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Home;
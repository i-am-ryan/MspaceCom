import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Menu,
  Bell,
  MapPin,
  Search,
  Mic,
  Droplets,
  Zap,
  DoorOpen,
  Wind,
  Hammer,
  Paintbrush,
  Sprout,
  Shield,
  Home as HomeIcon,
  Wrench,
  Car,
  MessageSquare,
  User,
  CalendarClock,
  AlertCircle,
} from "lucide-react";

const services = [
  { name: "Plumbing & Leaks", icon: Droplets, color: "from-blue-500 to-blue-600" },
  { name: "Electrical Services", icon: Zap, color: "from-yellow-500 to-orange-500" },
  { name: "Gates & Automation", icon: DoorOpen, color: "from-gray-600 to-gray-700" },
  { name: "HVAC & Aircon", icon: Wind, color: "from-cyan-500 to-blue-500" },
  { name: "Handyman Services", icon: Hammer, color: "from-orange-500 to-red-500" },
  { name: "Painting & Decor", icon: Paintbrush, color: "from-purple-500 to-pink-500" },
  { name: "Garden & Landscaping", icon: Sprout, color: "from-green-500 to-emerald-500" },
  { name: "Security Systems", icon: Shield, color: "from-red-600 to-red-700" },
  { name: "Home Cleaning", icon: HomeIcon, color: "from-teal-500 to-cyan-500" },
  { name: "Appliance Repair", icon: Wrench, color: "from-indigo-500 to-purple-500" },
  { name: "Car Wash & Valet", icon: Car, color: "from-slate-600 to-gray-700" },
  { name: "General Maintenance", icon: Wrench, color: "from-emerald-500 to-green-600" },
];

const quickActions = [
  { label: "Book Service", href: "/book", variant: "default" as const },
  { label: "Track Booking", href: "/bookings", variant: "secondary" as const },
  { label: "Emergency Help", href: "/emergency", variant: "destructive" as const },
  { label: "My History", href: "/history", variant: "secondary" as const },
];

const trustFeatures = [
  { title: "Verified Providers", icon: Shield, description: "Background checked" },
  { title: "Real Reviews", icon: MessageSquare, description: "From real customers" },
  { title: "Fast Response", icon: CalendarClock, description: "Quick turnaround" },
  { title: "Secure Payment", icon: Shield, description: "Safe transactions" },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button className="p-2 hover:bg-muted rounded-full">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Mspaces</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <button className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              JD
            </button>
          </div>
        </div>
      </header>

      {/* Greeting Section */}
      <section className="p-6">
        <h2 className="text-2xl font-bold mb-1">Hi John 👋</h2>
        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Sandton, Johannesburg</span>
        </button>
      </section>

      {/* Quick Actions */}
      <section className="px-6 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              asChild
              variant={action.variant}
              className="flex-shrink-0 rounded-full px-6"
            >
              <Link to={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="What do you need help with?"
            className="h-14 pl-12 pr-12 text-base rounded-xl"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Service Categories */}
      <section className="px-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Browse Services</h3>
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => (
            <Link
              key={service.name}
              to={`/service/${service.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group"
            >
              <div
                className={`bg-gradient-to-br ${service.color} rounded-2xl p-6 aspect-square flex flex-col items-center justify-center text-white transition-transform hover:scale-105 active:scale-95`}
              >
                <service.icon className="w-10 h-10 mb-3" />
                <p className="text-sm font-semibold text-center leading-tight">
                  {service.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Features */}
      <section className="px-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Why Choose Mspaces</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {trustFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex-shrink-0 w-40 bg-card border border-border rounded-xl p-4"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around h-16">
          <Link to="/home" className="flex flex-col items-center gap-1 text-primary">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/search"
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
            <span className="absolute top-0 right-2 w-2 h-2 bg-destructive rounded-full"></span>
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

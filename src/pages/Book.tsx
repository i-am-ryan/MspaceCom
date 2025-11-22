import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, MapPin, Calendar, Clock, Loader, CheckCircle, RepeatIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getServiceCategories, getUserProfile, createServiceRequest } from "@/lib/api";

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const Book = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');

  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [findingProviders, setFindingProviders] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  const [selectedService, setSelectedService] = useState("");
  const [selectedServiceData, setSelectedServiceData] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [serviceType, setServiceType] = useState<"one-time" | "recurring">("one-time");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (selectedService && services.length > 0) {
      const service = services.find(s => s.id === selectedService);
      setSelectedServiceData(service);
      if (service && !title) {
        setTitle(`${service.name} Service Request`);
      }
    }
  }, [selectedService, services]);

  useEffect(() => {
    if (selectedService && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 300);
    }
  }, [selectedService]);

  useEffect(() => {
    if (title && currentStep === 2) {
      setTimeout(() => setCurrentStep(3), 300);
    }
  }, [title]);

  useEffect(() => {
    if (description && currentStep === 3) {
      setTimeout(() => setCurrentStep(4), 300);
    }
  }, [description]);

  useEffect(() => {
    if (currentStep === 4 && profile) {
      setTimeout(() => setCurrentStep(5), 500);
    }
  }, [currentStep === 4, profile]);

  useEffect(() => {
    if (preferredDate && preferredTime && currentStep === 5) {
      setTimeout(() => setCurrentStep(6), 300);
    }
  }, [preferredDate, preferredTime]);

  const loadData = async () => {
    try {
      const [servicesData, profileData] = await Promise.all([
        getServiceCategories(),
        user?.id ? getUserProfile(user.id, user) : null,
      ]);
      
      setServices(servicesData);
      setProfile(profileData);

      if (preselectedService && servicesData) {
        const decodedService = decodeURIComponent(preselectedService);
        const matchedService = servicesData.find(
          (s: any) => 
            s.id === preselectedService || 
            s.name.toLowerCase() === decodedService.toLowerCase() ||
            s.name.toLowerCase().replace(/\s+/g, "-") === decodedService.toLowerCase() ||
            s.name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "") === decodedService.toLowerCase().replace(/&/g, "")
        );
        
        if (matchedService) {
          setSelectedService(matchedService.id);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !title || !description || !profile) {
      alert("Please fill in all required fields");
      return;
    }

    if (serviceType === 'recurring' && selectedDays.length === 0) {
      alert("Please select at least one day for recurring service");
      return;
    }

    setSubmitting(true);
    setFindingProviders(true);

    try {
      const customerProfile = profile.customer_profiles?.[0];
      
      const request = await createServiceRequest({
        customer_id: profile.id,
        category_id: selectedService,
        title,
        description,
        address: customerProfile?.formatted_address || customerProfile?.address || "Address not set",
        city: customerProfile?.city,
        province: customerProfile?.province,
        latitude: customerProfile?.latitude || -26.2041,
        longitude: customerProfile?.longitude || 28.0473,
        urgency: 'medium',
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate(`/find-providers?request=${request.id}`);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
      setFindingProviders(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getLocationDisplay = () => {
    const customerProfile = profile?.customer_profiles?.[0];
    
    if (customerProfile?.formatted_address) {
      return customerProfile.formatted_address;
    }
    
    if (customerProfile?.city && customerProfile?.province) {
      return `${customerProfile.city}, ${customerProfile.province}`;
    }
    
    if (customerProfile?.address) {
      return customerProfile.address;
    }
    
    return "Johannesburg, Gauteng";
  };

  const calculateEstimate = () => {
    let basePrice = 150;
    
    if (selectedServiceData?.name?.toLowerCase().includes('electrical')) {
      basePrice = 250;
    } else if (selectedServiceData?.name?.toLowerCase().includes('plumbing')) {
      basePrice = 200;
    } else if (selectedServiceData?.name?.toLowerCase().includes('hvac') || selectedServiceData?.name?.toLowerCase().includes('aircon')) {
      basePrice = 300;
    }

    const callOutFee = 100;
    const distanceFee = 50;

    let timeMultiplier = 1;
    if (preferredDate) {
      const selectedDate = new Date(preferredDate);
      const today = new Date();
      const daysUntil = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 1) {
        timeMultiplier = 1.5;
      }
    }

    const subtotal = (basePrice + callOutFee + distanceFee) * timeMultiplier;

    if (serviceType === 'recurring' && selectedDays.length > 0) {
      const weeklyOccurrences = selectedDays.length;
      const monthlyTotal = subtotal * weeklyOccurrences * 4.33;
      const discountedMonthlyTotal = monthlyTotal * 0.85;
      
      return {
        perVisit: subtotal.toFixed(2),
        weeklyTotal: (subtotal * weeklyOccurrences).toFixed(2),
        monthlyTotal: discountedMonthlyTotal.toFixed(2),
        isRecurring: true,
        weeksCount: weeklyOccurrences
      };
    }

    return {
      perVisit: subtotal.toFixed(2),
      total: subtotal.toFixed(2),
      isRecurring: false
    };
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const canSubmit = () => {
    if (serviceType === 'recurring') {
      return selectedDays.length > 0;
    }
    return true;
  };

  if (findingProviders) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center text-white p-6">
        <div className="text-center mb-8">
          <Loader className="w-16 h-16 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Finding your match</h2>
          <p className="text-white/90">
            We're finding service providers that match your requirements.
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md animate-pulse flex items-center justify-center text-2xl font-bold"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              ðŸ‘·
            </div>
          ))}
        </div>

        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-[loading_2s_ease-in-out_infinite]" />
        </div>

        <style>{`
          @keyframes loading {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const estimate = calculateEstimate();

  const BookingSummary = () => (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h3 className="font-bold text-lg">Booking Summary</h3>

      {selectedServiceData && (
        <div className="pb-4 border-b">
          <p className="text-sm text-muted-foreground mb-1">Service</p>
          <p className="font-semibold">{selectedServiceData.name}</p>
        </div>
      )}

      {title && (
        <div className="pb-4 border-b">
          <p className="text-sm text-muted-foreground mb-1">Title</p>
          <p className="text-sm">{title}</p>
        </div>
      )}

      {currentStep >= 4 && (
        <div className="pb-4 border-b">
          <p className="text-sm text-muted-foreground mb-1">Location</p>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
            <p className="text-sm">{getLocationDisplay()}</p>
          </div>
        </div>
      )}

      {(preferredDate || preferredTime) && (
        <div className="pb-4 border-b">
          <p className="text-sm text-muted-foreground mb-2">When</p>
          {preferredDate && (
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm">{new Date(preferredDate).toLocaleDateString()}</p>
            </div>
          )}
          {preferredTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm">{preferredTime}</p>
            </div>
          )}
        </div>
      )}

      {serviceType && (
        <div className="pb-4 border-b">
          <p className="text-sm text-muted-foreground mb-1">Service Type</p>
          <p className="font-medium capitalize">{serviceType === 'one-time' ? 'One-Time Service' : 'Recurring Service'}</p>
        </div>
      )}

      {serviceType === 'recurring' && selectedDays.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Recurring Schedule</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedDays.map(day => (
              <span key={day} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedDays.length} visit{selectedDays.length > 1 ? 's' : ''} per week
          </p>
        </div>
      )}

      <div className="bg-primary/10 rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
        {estimate.isRecurring ? (
          <>
            <p className="text-lg font-bold text-primary">
              R{estimate.perVisit} <span className="text-sm font-normal">per visit</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly: R{estimate.weeklyTotal}
            </p>
            <p className="text-sm font-semibold text-primary mt-1">
              Monthly: R{estimate.monthlyTotal}
            </p>
            <p className="text-xs text-green-600 mt-1">
              ðŸ’° Saving 15% with recurring service
            </p>
          </>
        ) : (
          <p className="text-2xl font-bold text-primary">
            R{estimate.total}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Includes: Service + Call-out fee + Travel
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Final price confirmed by provider
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link to="/home" className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Book a Service</h1>
        </div>
      </header>

      <div className="lg:flex lg:gap-6 p-6 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="flex-1 space-y-6 max-w-2xl">
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep > step 
                    ? 'bg-primary text-primary-foreground' 
                    : currentStep === step 
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 7 && (
                  <div className={`h-1 w-6 sm:w-8 mx-1 transition-all ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {currentStep >= 1 && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="service">Service Type *</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {currentStep >= 2 && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title && currentStep === 2) {
                    setCurrentStep(3);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && title) {
                    e.preventDefault();
                    setCurrentStep(3);
                  }
                }}
                placeholder="e.g., Fix leaking kitchen tap"
                className="h-12"
                required
              />
            </div>
          )}

          {currentStep >= 3 && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description && currentStep === 3) {
                    setCurrentStep(4);
                  }
                }}
                placeholder="Describe the issue in detail..."
                className="min-h-32"
                required
              />
            </div>
          )}

          {currentStep >= 4 && (
            <div className="space-y-2 animate-fade-in">
              <Label>Service Location</Label>
              <div className="flex items-center gap-2 p-4 bg-muted rounded-xl">
                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{getLocationDisplay()}</p>
                  <Link to="/profile" className="text-xs text-primary hover:underline">
                    Change location
                  </Link>
                </div>
              </div>
            </div>
          )}

          {currentStep >= 5 && (
            <div className="space-y-2 animate-fade-in">
              <Label>Preferred Date & Time *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="h-12 pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="h-12 pl-10"
                    min="07:00"
                    max="17:00"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep >= 6 && (
            <div className="space-y-4 animate-fade-in">
              <Label>How often do you need this service? *</Label>
              <RadioGroup value={serviceType} onValueChange={(value: any) => setServiceType(value)}>
                <div className="flex items-center space-x-2 p-4 border-2 rounded-xl cursor-pointer hover:border-primary transition-colors" onClick={() => setServiceType('one-time')}>
                  <RadioGroupItem value="one-time" id="one-time" />
                  <div className="flex-1">
                    <label htmlFor="one-time" className="text-sm font-medium cursor-pointer">
                      One-Time Service
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Single visit on selected date
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 rounded-xl cursor-pointer hover:border-primary transition-colors" onClick={() => setServiceType('recurring')}>
                  <RadioGroupItem value="recurring" id="recurring" />
                  <div className="flex-1">
                    <label htmlFor="recurring" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <RepeatIcon className="w-4 h-4" />
                      Recurring Service
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Save 15% with weekly recurring visits
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {currentStep >= 6 && serviceType === 'recurring' && (
            <div className="space-y-4 pl-4 border-l-2 border-primary animate-fade-in">
              <div>
                <Label className="mb-2 block">Select Days for Weekly Service *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedDays.includes(day.value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Service will repeat weekly on selected days starting from {preferredDate ? new Date(preferredDate).toLocaleDateString() : 'your selected date'}
                </p>
              </div>
            </div>
          )}

          <div className="lg:hidden">
            {currentStep >= 6 && <BookingSummary />}
          </div>

          {currentStep >= 6 && canSubmit() && (
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-xl"
              disabled={submitting}
            >
              {submitting ? "Finding Providers..." : "Find a Provider"}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            By submitting, you agree to our Terms of Service
          </p>
        </form>

        <div className="hidden lg:block lg:w-80 mt-6 lg:mt-0">
          <div className="sticky top-24">
            {currentStep >= 6 && <BookingSummary />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
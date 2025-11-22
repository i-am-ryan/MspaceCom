import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Calendar, Star, Home, Search, CalendarClock, MessageSquare, User, CheckCircle, Phone, Mail, MapPin, Award, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

const ServiceHistory = () => {
  const { user } = useUser();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', user?.id)
        .single();

      if (!profile) return;

      // Load completed bookings with reviews
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service_requests (
            title,
            description,
            address,
            service_categories (name, icon, color)
          ),
          provider:provider_profiles (
            id,
            business_name,
            bio,
            average_rating,
            verification_level,
            total_jobs_completed,
            years_of_experience,
            address,
            city,
            province,
            profile_id (
              full_name, 
              phone_number,
              email,
              avatar_url
            )
          ),
          reviews (
            id,
            rating,
            title,
            comment,
            would_recommend,
            created_at
          )
        `)
        .eq('customer_id', profile.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link to="/profile" className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Service History</h1>
        </div>
      </header>

      {/* History List */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No completed services yet</h3>
            <p className="text-muted-foreground mb-6">
              Your completed service history will appear here.
            </p>
            
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                {/* Service Title */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {item.service_requests?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.service_requests?.service_categories?.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    R{item.total_amount.toFixed(2)}
                  </span>
                </div>

                {/* Provider Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {item.provider?.business_name?.charAt(0).toUpperCase() || 
                     item.provider?.profile_id?.full_name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {item.provider?.business_name || item.provider?.profile_id?.full_name}
                      </p>
                      {item.provider?.verification_level >= 3 && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    {item.provider?.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(item.provider.average_rating))}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({item.provider.average_rating.toFixed(1)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Completed on {new Date(item.completed_at || item.scheduled_date).toLocaleDateString()}
                  </span>
                </div>

                {/* Review Section */}
                {item.reviews && item.reviews.length > 0 ? (
                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Your Review:</span>
                      {renderStars(item.reviews[0].rating)}
                    </div>
                    {item.reviews[0].comment && (
                      <p className="text-sm text-muted-foreground">
                        "{item.reviews[0].comment}"
                      </p>
                    )}
                  </div>
                ) : (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={`/review/${item.id}`}>
                      <Star className="w-4 h-4 mr-2" />
                      Leave a Review
                    </Link>
                  </Button>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = `tel:${item.provider?.profile_id?.phone_number}`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Provider
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedProvider(item.provider)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Provider Details</DialogTitle>
                      </DialogHeader>
                      
                      {selectedProvider && (
                        <div className="space-y-4">
                          {/* Provider Header */}
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                              {selectedProvider.business_name?.charAt(0).toUpperCase() || 
                               selectedProvider.profile_id?.full_name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">
                                {selectedProvider.business_name || selectedProvider.profile_id?.full_name}
                              </h3>
                              <div className="flex items-center gap-2">
                                {renderStars(Math.round(selectedProvider.average_rating || 0))}
                                <span className="text-sm text-muted-foreground">
                                  ({selectedProvider.average_rating?.toFixed(1) || '0.0'})
                                </span>
                                {selectedProvider.verification_level >= 3 && (
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          {selectedProvider.bio && (
                            <div>
                              <p className="text-sm text-muted-foreground">{selectedProvider.bio}</p>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-primary" />
                                <span className="text-xs text-muted-foreground">Jobs Completed</span>
                              </div>
                              <p className="text-lg font-bold">{selectedProvider.total_jobs_completed || 0}</p>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Award className="w-4 h-4 text-primary" />
                                <span className="text-xs text-muted-foreground">Experience</span>
                              </div>
                              <p className="text-lg font-bold">
                                {selectedProvider.years_of_experience || 0} years
                              </p>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-3 pt-2 border-t">
                            <div className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <a 
                                  href={`tel:${selectedProvider.profile_id?.phone_number}`}
                                  className="font-medium text-primary hover:underline"
                                >
                                  {selectedProvider.profile_id?.phone_number || 'Not provided'}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <a 
                                  href={`mailto:${selectedProvider.profile_id?.email}`}
                                  className="font-medium text-primary hover:underline break-all"
                                >
                                  {selectedProvider.profile_id?.email || 'Not provided'}
                                </a>
                              </div>
                            </div>
                            {(selectedProvider.city || selectedProvider.province) && (
                              <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Location</p>
                                  <p className="font-medium">
                                    {selectedProvider.city}, {selectedProvider.province}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              className="flex-1"
                              onClick={() => window.location.href = `tel:${selectedProvider.profile_id?.phone_number}`}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call Now
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1"
                              asChild
                            >
                              <Link to={`/book?provider=${selectedProvider.id}`}>
                                Book Again
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
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
          <Link to="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default ServiceHistory;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getServiceCategories } from "@/lib/api";
import * as Icons from "lucide-react";

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [searchQuery, services]);

  const loadServices = async () => {
    try {
      const data = await getServiceCategories();
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Wrench;
  };

  // Default service images
  const getServiceImage = (serviceName: string) => {
    const imageMap: { [key: string]: string } = {
      'plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop',
      'electrical': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop',
      'gates': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      'hvac': 'https://images.unsplash.com/photo-1631545806609-7e7d4b06f3b4?w=400&h=400&fit=crop',
      'handyman': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
      'painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop',
      'garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
      'security': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=400&fit=crop',
      'cleaning': 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?w=400&h=400&fit=crop',
      'appliance': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      'car': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=400&fit=crop',
      'roofing': 'https://images.unsplash.com/photo-1632214147604-8f588525eedc?w=400&h=400&fit=crop',
    };

    const key = serviceName.toLowerCase().split(' ')[0];
    return imageMap[key] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Link to="/home" className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">All Services</h1>
        </div>
      </header>

      {/* Search Bar */}
      <section className="p-6 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="h-12 pl-12 text-base rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredServices.map((service) => {
              const IconComponent = getIconComponent(service.icon);
              return (
                <Link
                  key={service.id}
                  to={`/book?service=${encodeURIComponent(service.name)}`}
                  className="group"
                >
                  <div className="relative rounded-2xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                    {/* Service Image */}
                    <img 
                      src={getServiceImage(service.name)} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color || 'from-gray-600 to-gray-700'} opacity-80 group-hover:opacity-70 transition-opacity`}></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3 sm:p-4">
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-2 drop-shadow-lg" />
                      <p className="text-xs sm:text-sm lg:text-base font-semibold text-center leading-tight drop-shadow-md">
                        {service.name}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Service Count */}
        {!loading && filteredServices.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
          </div>
        )}
      </section>
    </div>
  );
};

export default Services;
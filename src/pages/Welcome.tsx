import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import plumberImg from "@/assets/signup-plumber.jpg";
import electricianImg from "@/assets/signup-electrician.jpg";
import painterImg from "@/assets/signup-painter.jpg";
import handymanImg from "@/assets/signup-handyman.jpg";



const Welcome = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [plumberImg, electricianImg, painterImg, handymanImg];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Rotating Images (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12 z-10">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4 animate-fade-in">Mspaces</h1>
            <p className="text-2xl text-white/90 animate-fade-in">
              Community Maintenance Made Simple
            </p>
          </div>
        </div>
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
            <div className="absolute inset-0 bg-primary/70" />
          </div>
        ))}
      </div>

      {/* Right Side - Desktop Form */}
      <div className="hidden lg:flex lg:w-1/2 bg-background">
        <div className="flex flex-col items-center justify-center w-full px-12 py-16">
          <div className="w-full max-w-md space-y-8">
            {/* Desktop Heading */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Get Started Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of South Africans finding trusted service providers
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                asChild
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold h-14 rounded-xl"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-2 border-primary text-primary hover:bg-primary/10 text-lg font-semibold h-14 rounded-xl"
              >
                <Link to="/signin">Sign In</Link>
              </Button>
              <Link
                to="/home"
                className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4"
              >
                Skip for now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Full Screen with Rotating Images */}
      <div className="lg:hidden relative min-h-screen w-full overflow-hidden">
        {/* Rotating Background Images */}
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
          </div>
        ))}

        {/* Green Overlay */}
        <div className="absolute inset-0 bg-primary/85" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 text-white">
          {/* Centered Content */}
          <div className="w-full max-w-md space-y-12">
            {/* Branding */}
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 animate-fade-in">Mspaces</h1>
              <p className="text-lg text-white/95 animate-fade-in">
                Community Maintenance Made Simple
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <Button
                asChild
                size="lg"
                className="w-full bg-white text-primary hover:bg-white/90 text-xl font-semibold h-16 rounded-xl shadow-lg"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="w-full bg-white/20 border-2 border-white text-white hover:bg-white/30 text-xl font-semibold h-16 rounded-xl backdrop-blur-sm"
              >
                <Link to="/signin">Sign In</Link>
              </Button>
              <Link
                to="/home"
                className="block text-center text-base text-white/90 hover:text-white mt-6 font-medium"
              >
                Skip for now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
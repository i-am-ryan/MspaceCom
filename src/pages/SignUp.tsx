import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import plumberImg from "@/assets/signup-plumber.jpg";
import electricianImg from "@/assets/signup-electrician.jpg";
import painterImg from "@/assets/signup-painter.jpg";
import handymanImg from "@/assets/signup-handyman.jpg";

const SignUp = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [plumberImg, electricianImg, painterImg, handymanImg];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Carousel (Hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white z-10">
            <h1 className="text-5xl font-bold mb-4">Join Mspaces</h1>
            <p className="text-xl text-white/90">
              South Africa's trusted handyman platform
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
            <div className="absolute inset-0 bg-primary/60" />
          </div>
        ))}
      </div>

      {/* Right Side - Clerk Sign Up Form */}
      <div className="w-full lg:w-1/2 bg-background overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center z-10">
          <Link to="/welcome" className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>

        <div className="p-6 max-w-md mx-auto flex items-center justify-center min-h-[calc(100vh-73px)]">
          <ClerkSignUp 
            routing="path"
            path="/signup"
            signInUrl="/signin"
            afterSignUpUrl="/home"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
// LOCATION: /src/pages/SignIn.tsx
import { SignIn as ClerkSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

import plumberImg from "@/assets/signup-plumber.jpg";
import electricianImg from "@/assets/signup-electrician.jpg";
import painterImg from "@/assets/signup-painter.jpg";
import handymanImg from "@/assets/signup-handyman.jpg";

const SignIn = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [plumberImg, electricianImg, painterImg, handymanImg];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Images */}
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
            <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-white/90">
              Find trusted service providers near you
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 bg-background overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center z-10">
          <Link to="/welcome" className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <span className="ml-3 font-semibold text-lg">Sign In</span>
        </div>

        <div className="p-6 max-w-md mx-auto flex items-center justify-center min-h-[calc(100vh-73px)]">
          <div className="w-full">
            <ClerkSignIn
              signUpUrl="/signup"
              redirectUrl="/home"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none w-full border-0 bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "border-input hover:bg-accent",
                  formButtonPrimary: "bg-primary hover:bg-primary/90 normal-case h-12",
                  footerActionLink: "text-primary hover:text-primary/80",
                  formFieldInput: "border-input h-12",
                  identityPreviewEditButton: "text-primary",
                },
                variables: {
                  colorPrimary: "#5EBFB3",
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  socialButtonsVariant: "iconButton",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
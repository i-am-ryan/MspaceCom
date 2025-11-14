import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading user session
    const timer = setTimeout(() => {
      navigate("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-[hsl(160,84%,30%)] flex flex-col items-center justify-center text-white">
      {/* Logo with Animation */}
      <div className="animate-scale-in mb-8">
        <h1 className="text-6xl font-bold mb-3">Mspaces</h1>
      </div>

      {/* Tagline */}
      <p className="text-lg text-white/90 mb-12 animate-fade-in">
        Community Maintenance Made Simple
      </p>

      {/* Loading Indicator */}
      <div className="flex gap-2 animate-fade-in">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-pulse [animation-delay:0.4s]"></div>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-sm text-white/60">
        Version 1.0.0
      </div>
    </div>
  );
};

export default Splash;

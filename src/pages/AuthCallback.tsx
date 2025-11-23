// LOCATION: /src/pages/AuthCallback.tsx
// BULLETPROOF VERSION - Handles all Supabase auth callback formats

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("AuthCallback started");
        console.log("Full URL:", window.location.href);
        console.log("Hash:", window.location.hash);
        console.log("Search:", window.location.search);

        // Give Supabase a moment to automatically process the hash
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("Session check:", { hasSession: !!session, error });

        if (error) {
          console.error("Session error:", error);
          setMessage("Something went wrong. Redirecting to sign in...");
          setTimeout(() => navigate('/signin', { replace: true }), 2000);
          return;
        }

        if (session) {
          console.log("✅ User authenticated:", session.user.email);
          setMessage("Success! Redirecting to home...");
          setTimeout(() => navigate('/home', { replace: true }), 1000);
        } else {
          console.log("❌ No session found");
          setMessage("Confirmation link may have expired. Redirecting to sign in...");
          setTimeout(() => navigate('/signin', { replace: true }), 2000);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setMessage("An error occurred. Redirecting to sign in...");
        setTimeout(() => navigate('/signin', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #5EBFB3 0%, #4AA89D 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '48px 32px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '90%'
      }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '24px',
          animation: 'spin 2s linear infinite' 
        }}>
          ⚡
        </div>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '12px',
          color: '#1a1a1a'
        }}>
          {message}
        </h2>
        <p style={{ 
          color: '#666',
          fontSize: '14px'
        }}>
          Please wait a moment
        </p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;
// LOCATION: /src/pages/AuthCallback.tsx
// SIMPLE AND WORKING VERSION

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically handles the hash tokens when we call getSession
    // We just need to wait a moment for it to process
    const handleCallback = async () => {
      // Wait for Supabase to process the hash
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user is now authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated, go to home
        navigate('/home', { replace: true });
      } else {
        // Something went wrong, go to signin
        navigate('/signin', { replace: true });
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
      background: 'linear-gradient(to bottom right, #5EBFB3, #4AA89D)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          animation: 'spin 1s linear infinite' 
        }}>
          ⚡
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Confirming your email...
        </h2>
        <p style={{ opacity: 0.9 }}>Please wait a moment</p>
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
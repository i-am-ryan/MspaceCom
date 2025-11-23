// LOCATION: /src/pages/AuthCallback.tsx
// This page handles the email confirmation callback from Supabase

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically handles the token exchange when the user lands on this page
        // We just need to check if the user is now authenticated
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(error.message || 'Failed to confirm email. The link may have expired.');
          
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
          return;
        }

        if (session && session.user) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to home...');
          
          // Redirect to home after 1.5 seconds
          setTimeout(() => {
            navigate('/home');
          }, 1500);
        } else {
          // No session found, might be an expired link
          setStatus('error');
          setMessage('Email confirmation failed. The link may have expired. Please try signing up again.');
          
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Confirming Your Email</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Email Confirmed! 🎉</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">Confirmation Failed</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <button
              onClick={() => navigate('/signin')}
              className="text-primary hover:underline font-medium"
            >
              Go to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
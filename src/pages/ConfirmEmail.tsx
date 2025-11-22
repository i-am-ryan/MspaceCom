import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try signing up again.');
          return;
        }

        // Exchange the token for a session
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type === 'email' ? 'email' : 'signup',
        });

        if (error) {
          console.error('Confirmation error:', error);
          setStatus('error');
          setMessage(error.message || 'Failed to confirm email. The link may have expired.');
          
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
          return;
        }

        if (data.user) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to home...');
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            navigate('/home');
          }, 2000);
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

    handleEmailConfirmation();
  }, [navigate, searchParams]);

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

export default ConfirmEmail;
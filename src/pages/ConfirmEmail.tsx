import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("");

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage("Invalid verification link. Please check your email and try again.");
      return;
    }

    try {
      const { data: verification, error: fetchError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('token', token)
        .single();

      if (fetchError || !verification) {
        throw new Error("Verification link not found or expired.");
      }

      if (verification.verified) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setStatus('success');
          setMessage("Your email is already verified! Taking you to your dashboard...");
          setTimeout(() => navigate("/home"), 1500);
        } else {
          setStatus('success');
          setMessage("Your email is already verified! Please sign in.");
          setTimeout(() => navigate("/signin"), 2000);
        }
        return;
      }

      const expiresAt = new Date(verification.expires_at);
      if (expiresAt < new Date()) {
        setStatus('error');
        setMessage("This verification link has expired. Please sign up again.");
        return;
      }

      const { error: updateError } = await supabase
        .from('email_verifications')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('token', token);

      if (updateError) throw updateError;

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('clerk_user_id', verification.user_id)
        .single();

      if (profile?.email) {
        const tempPassword = searchParams.get('pwd');
        
        if (tempPassword) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password: tempPassword,
          });

          if (!signInError && signInData.session) {
            setStatus('success');
            setMessage("Email verified! Signing you in...");
            setTimeout(() => navigate("/home"), 1500);
            return;
          }
        }
      }

      setStatus('success');
      setMessage("Email verified successfully! Taking you to sign in...");
      setTimeout(() => navigate("/signin"), 2000);

    } catch (error: any) {
      console.error("Verification error:", error);
      setStatus('error');
      setMessage(error.message || "Failed to verify email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Verifying your email...</h2>
            <p className="text-muted-foreground">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Email Verified!</h2>
            <p className="text-muted-foreground mb-4">{message}</p>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/signup")}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
              >
                Sign Up Again
              </button>
              <button
                onClick={() => navigate("/signin")}
                className="w-full h-12 border border-border hover:bg-muted rounded-lg font-medium"
              >
                Try to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmail;
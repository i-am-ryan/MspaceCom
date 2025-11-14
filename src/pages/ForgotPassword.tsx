import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center">
        <Link to="/signin" className="p-2 -ml-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {!emailSent ? (
          <>
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
              <p className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 text-base"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-xl"
              >
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/signin"
                className="text-sm text-primary hover:underline font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Check Your Email</h2>
            <p className="text-muted-foreground mb-8">
              We've sent a password reset link to your email address. Please check your inbox
              and follow the instructions.
            </p>
            <Button
              asChild
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-xl"
            >
              <Link to="/signin">Back to Sign In</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

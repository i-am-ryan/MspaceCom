import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignIn as ClerkSignIn } from "@clerk/clerk-react";

const SignIn = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center">
        <Link to="/welcome" className="p-2 -ml-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="p-6 max-w-md mx-auto flex items-center justify-center min-h-[calc(100vh-73px)]">
        <ClerkSignIn 
          routing="path"
          path="/signin"
          signUpUrl="/signup"
          afterSignInUrl="/home"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none",
            },
          }}
        />
      </div>
    </div>
  );
};

export default SignIn;
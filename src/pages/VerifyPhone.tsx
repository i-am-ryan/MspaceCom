import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const VerifyPhone = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock verification success
    navigate("/splash");
  };

  const handleResend = () => {
    setTimer(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center">
        <Link to="/signup" className="p-2 -ml-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Verify Your Phone</h1>
        <p className="text-muted-foreground mb-8">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-foreground">+27 81 234 5678</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* OTP Input */}
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            ))}
          </div>

          {/* Resend Code */}
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in{" "}
                <span className="font-semibold text-foreground">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Resend Code
              </button>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-lg font-semibold rounded-xl"
            disabled={otp.some((d) => !d)}
          >
            Verify
          </Button>
        </form>

        {/* Change Phone Number */}
        <div className="mt-6 text-center">
          <Link
            to="/signup"
            className="text-sm text-primary hover:underline font-medium"
          >
            Change Phone Number
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;

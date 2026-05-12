import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axiosConfig";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState(location.state?.email || "");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Check for verification token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const emailParam = params.get('email');

    if (token && emailParam) {
      verifyEmailToken(token, emailParam);
    }
  }, []);

  const verifyEmailToken = async (token, emailParam) => {
    setLoading(true);
    try {
      await API.post("verify-email/", { token, email: emailParam });
      setVerified(true);
      toast.success("Email verified successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Invalid or expired verification link");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setResending(true);
    try {
      await API.post("resend-verification/", { email });
      toast.success("Verification email sent successfully!");
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="text-center mb-8">
            {loading ? (
              <Loader2 className="w-16 h-16 mx-auto text-[#D4A017] animate-spin mb-4" />
            ) : verified ? (
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            ) : (
              <Mail className="w-16 h-16 mx-auto text-[#D4A017] mb-4" />
            )}
            
            <h1 className="text-3xl font-bold mb-2">
              {loading ? "Verifying..." : verified ? "Email Verified!" : "Verify Your Email"}
            </h1>
            <p className="text-gray-600">
              {loading
                ? "Please wait while we verify your email..."
                : verified
                ? "Your email has been verified successfully. Redirecting to login..."
                : "Please check your email and click the verification link to complete your registration."}
            </p>
          </div>

          {!loading && !verified && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full"
                />
              </div>

              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Resend Verification Email</span>
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#D4A017] hover:underline font-medium"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

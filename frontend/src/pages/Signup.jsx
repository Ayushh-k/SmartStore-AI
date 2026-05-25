// frontend/src/pages/Signup.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../utils/api.js";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(location.state?.step || 1);
  const [unverifiedEmail, setUnverifiedEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [timer, setTimer] = useState(120); // 2-minute countdown timer
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Ticks down the 2-minute resend countdown timer when step 2 is active
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Handle registration submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendSuccess("");

    try {
      await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      
      // Navigate to OTP step
      setUnverifiedEmail(form.email);
      setStep(2);
      setTimer(120); // Initialize timer to 120s
    } catch (err) {
      console.error("Auth registration error:", err);
      setError(
        err?.response?.data?.message || "Registration failed. Please check your inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP verification submit
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResendSuccess("");

    try {
      const res = await api.post("/api/auth/verify", {
        email: unverifiedEmail,
        otp: otpCode,
      });

      // Store token and user details on verification success
      localStorage.setItem("smartstoretoken", res.data.token);
      localStorage.setItem("smartstoreuser", JSON.stringify(res.data.user));

      // Redirect based on role
      const role = res.data.role || (res.data.user && res.data.user.role);
      if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "superadmin") {
        navigate("/developer");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Auth verification error:", err);
      setError(
        err?.response?.data?.message || "Verification failed. Please check the code."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle resending OTP code
  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setResendSuccess("");

    try {
      const res = await api.post("/api/auth/resend-otp", {
        email: unverifiedEmail,
      });
      setResendSuccess(res.data.message || "A new code has been sent.");
      setTimer(120); // Reset timer to 120s
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(
        err?.response?.data?.message || "Failed to resend verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white transition-colors duration-300">
      {/* Editorial Split-Screen Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        
        {/* Left Side: Striking Fashion Editorial Image */}
        <div className="relative hidden md:block h-full w-full overflow-hidden bg-neutral-900">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80" 
            alt="Editorial Fashion" 
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/60" />
          <div className="absolute bottom-12 left-12 z-10 max-w-md">
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold font-bold">
              SmartStore Atelier
            </span>
            <h2 className="text-3xl font-serif font-light text-white tracking-widest leading-tight uppercase mt-2">
              CREATING NEW DIMENSIONS / DESIGN
            </h2>
          </div>
        </div>

        {/* Right Side: Dynamic Form Area */}
        <div className="flex flex-col justify-center items-center px-8 sm:px-16 md:px-24 py-12 bg-white dark:bg-black transition-colors duration-300">
          <div className="w-full max-w-md space-y-8 text-left">
            
            {step === 1 ? (
              // Step 1: Standard Sign Up Form
              <>
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-wide uppercase">
                    Create Account
                  </h2>
                  <p className="text-xs text-neutral-550 dark:text-neutral-400 font-sans tracking-widest uppercase">
                    Register to explore the editorial collection.
                  </p>
                </div>

                {error && (
                  <div className="border-l border-rose-500 bg-rose-950/10 px-4 py-3 text-xs text-rose-450 font-sans">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-sans font-medium">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="input border-b border-black/15 dark:border-white/20 text-black dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-sans font-medium">
                      Register As
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="input cursor-pointer border-b border-black/15 dark:border-white/20 bg-transparent text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white select-luxury text-sm py-2.5 w-full rounded-none"
                    >
                      <option value="user" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Customer (Storefront)</option>
                      <option value="admin" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Administrator (Dashboard)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-sans font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="input border-b border-black/15 dark:border-white/20 text-black dark:text-white"
                      placeholder="name@domain.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-sans font-medium">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={handleChange}
                      className="input border-b border-black/15 dark:border-white/20 text-black dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-[0.2em] font-semibold text-xs rounded-none hover:bg-neutral-900 dark:hover:bg-neutral-200 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Register"
                      )}
                    </button>
                  </div>
                </form>

                <div className="border-t border-black/10 dark:border-white/5 pt-6 space-y-4">
                  <p className="text-xs text-neutral-500 font-sans tracking-wider">
                    Already have an account?{" "}
                    <Link to="/login" className="text-black dark:text-white hover:text-gold transition-colors font-medium">
                      Sign In
                    </Link>
                  </p>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-450 font-sans tracking-widest uppercase">
                    <Link to="/" className="text-neutral-550 hover:text-black dark:hover:text-white transition-colors">
                      Browse as Guest / Back to Home
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              // Step 2: OTP Verification UI
              <>
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-wide uppercase">
                    VERIFY YOUR IDENTITY
                  </h2>
                  <p className="text-xs text-neutral-550 dark:text-neutral-400 font-sans tracking-widest uppercase leading-relaxed">
                    A 6-digit authorization code has been dispatched to <strong className="text-black dark:text-white font-medium">{unverifiedEmail}</strong>.
                  </p>
                </div>

                {error && (
                  <div className="border-l border-rose-500 bg-rose-950/10 px-4 py-3 text-xs text-rose-450 font-sans">
                    {error}
                  </div>
                )}

                {resendSuccess && (
                  <div className="border-l border-emerald-500 bg-emerald-950/10 px-4 py-3 text-xs text-emerald-450 font-sans">
                    {resendSuccess}
                  </div>
                )}

                <form onSubmit={handleVerifySubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-sans font-medium">
                      Authorization Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="border-b border-gray-300 dark:border-white/20 bg-transparent text-center text-2xl tracking-[1em] focus:outline-none w-full py-4 text-black dark:text-white font-sans font-light pl-[0.5em]"
                      placeholder="000000"
                    />
                  </div>

                  {/* Elegant Minimalist Advisory Note */}
                  <div className="pt-2 pb-1 border-t border-black/5 dark:border-white/5 space-y-1">
                    <p className="text-[10px] text-neutral-500 font-sans tracking-widest uppercase font-semibold">
                      Advisory Notice
                    </p>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-serif italic leading-relaxed">
                      If the email does not arrive in your primary inbox, please review your junk or spam folders. The verification token remains active for exactly 5 minutes from issuance.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || otpCode.length !== 6}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-[0.2em] font-semibold text-xs rounded-none hover:bg-neutral-900 dark:hover:bg-neutral-200 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Verify Account"
                      )}
                    </button>
                  </div>
                </form>

                <div className="border-t border-black/10 dark:border-white/5 pt-6 flex justify-between items-center text-xs font-sans tracking-wider">
                  <button
                    type="button"
                    disabled={loading || timer > 0}
                    onClick={handleResendOtp}
                    className="text-black dark:text-white hover:text-gold transition-colors underline font-medium cursor-pointer disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {timer > 0 ? `Resend Code (${formatTime(timer)})` : "Resend Code"}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setResendSuccess("");
                    }}
                    className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Back to Signup
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;

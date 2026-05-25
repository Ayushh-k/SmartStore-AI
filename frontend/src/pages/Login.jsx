// frontend/src/pages/Login.jsx

import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../utils/api.js";

const Login = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!captchaToken) {
      setError("Please complete the human verification.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
        captchaToken,
      });

      // Store token and user info
      localStorage.setItem("smartstoretoken", res.data.token);
      localStorage.setItem("smartstoreuser", JSON.stringify(res.data.user));

      // Redirect based on role
      const role = res.data.role || (res.data.user && res.data.user.role);
      if (role === "superadmin") {
        navigate("/developer");
      } else if (role === "admin") {
        navigate("/dashboard");
      } else if (role === "user") {
        navigate("/");
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const importCart = urlParams.get("importCart");
        if (importCart) {
          navigate(`/?importCart=${importCart}`);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      // Reset reCAPTCHA on failure
      recaptchaRef.current?.reset();
      setCaptchaToken(null);

      if (err?.response?.status === 403) {
        if (err.response.data?.message === "Account Suspended") {
          navigate("/suspended", { state: { reason: err.response.data.banReason } });
        } else if (err.response.data?.message === "Account not verified.") {
          const email = err.response.data.unverifiedEmail;
          setError(
            <span>
              Account not verified.{" "}
              <button
                type="button"
                onClick={() => navigate("/signup", { state: { email, step: 2 } })}
                className="underline font-bold text-black dark:text-white hover:text-gold transition-colors focus:outline-none ml-1 cursor-pointer"
              >
                Click here to verify your account
              </button>
            </span>
          );
        } else {
          setError(err.response.data?.message || "Access denied.");
        }
      } else {
        setError(
          err?.response?.data?.message || "Authentication failed. Please check your credentials."
        );
      }
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
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80"
            alt="Editorial Fashion"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/60" />
          <div className="absolute bottom-12 left-12 z-10 max-w-md">
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold font-bold">
              SmartStore Atelier
            </span>
            <h2 className="text-3xl font-serif font-light text-white tracking-widest leading-tight uppercase mt-2">
              EXQUISITE FORMS / MINIMAL DESIGN
            </h2>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="flex flex-col justify-center items-center px-8 sm:px-16 md:px-24 py-12 bg-white dark:bg-black transition-colors duration-300">
          <div className="w-full max-w-md space-y-10 text-left">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-wide uppercase">
                Sign In
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans tracking-widest uppercase">
                Welcome back to your luxury experience.
              </p>
            </div>

            {error && (
              <div className="border-l border-rose-500 bg-rose-950/10 px-4 py-3 text-xs text-rose-400 font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* reCAPTCHA Widget */}
              <div className="flex justify-center w-full my-6">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                  theme="light"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4 uppercase tracking-[0.2em] font-semibold text-xs rounded-none hover:bg-neutral-900 dark:hover:bg-neutral-200 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            <div className="border-t border-black/10 dark:border-white/5 pt-6 space-y-4">
              <p className="text-xs text-neutral-500 font-sans tracking-wider">
                Don't have an account?{" "}
                <Link to="/signup" className="text-black dark:text-white hover:text-gold transition-colors font-medium">
                  Create Account
                </Link>
              </p>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-450 font-sans tracking-widest uppercase">
                <Link to="/" className="text-neutral-550 hover:text-black dark:hover:text-white transition-colors">
                  Browse as Guest / Back to Home
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

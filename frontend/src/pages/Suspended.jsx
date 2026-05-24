// frontend/src/pages/Suspended.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const Suspended = () => {
  const location = useLocation();
  const banReason = location.state?.reason || "Violation of platform terms and policies.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white px-6 transition-colors duration-300">
      
      {/* Absolute Header Branding */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="font-serif tracking-widest text-xs uppercase font-light border-b border-transparent hover:border-black dark:hover:border-white transition-all">
          SmartStore AI
        </Link>
      </div>

      <div className="w-full max-w-xl text-center space-y-10 py-12">
        {/* Stark Warning Icon */}
        <div className="flex justify-center">
          <div className="border border-rose-500/30 bg-rose-50 dark:bg-rose-950/10 p-5 rounded-none">
            <ShieldAlert className="h-8 w-8 text-rose-600 dark:text-rose-500 stroke-[1.2]" />
          </div>
        </div>

        {/* Text Headers */}
        <div className="space-y-4">
          <h1 className="font-serif text-3xl sm:text-4xl tracking-[0.15em] uppercase font-light">
            Account Suspended
          </h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-450 font-sans tracking-[0.25em] uppercase font-medium">
            Your access to SmartStore has been revoked.
          </p>
        </div>

        {/* Thin Divider */}
        <div className="w-12 h-[1px] bg-neutral-250 dark:bg-neutral-800 mx-auto" />

        {/* Reason Box */}
        <div className="border border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/5 p-8 text-left rounded-none space-y-3 shadow-sm max-w-lg mx-auto">
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-rose-500 block">
            Official Reason for Suspension
          </span>
          <p className="text-xs sm:text-sm font-sans text-neutral-700 dark:text-neutral-350 leading-relaxed font-serif">
            {banReason}
          </p>
        </div>

        {/* Footer/Back Navigation */}
        <div className="pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 hover:text-black dark:hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>

      {/* Absolute Footer Detail */}
      <div className="absolute bottom-8 text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
        Platform Operations &copy; {new Date().getFullYear()}
      </div>

    </div>
  );
};

export default Suspended;

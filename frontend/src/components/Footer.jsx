// frontend/src/components/Footer.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Check } from "lucide-react";
import api from "../utils/api.js";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !message) return;
    
    try {
      await api.post("/api/contact", { email, message });
      setIsSent(true);
      setTimeout(() => {
        setEmail("");
        setMessage("");
        setIsSent(false);
      }, 3000);
    } catch (err) {
      console.error("Send message error:", err);
      alert(err?.response?.data?.message || "Failed to send your message. Please try again.");
    }
  };

  return (
    <footer className="border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] text-black dark:text-white py-16 px-6 md:px-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl tracking-[0.25em] uppercase font-semibold">
              SMARTSTORE
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans tracking-wide leading-relaxed max-w-xs uppercase">
              Elevating everyday essentials through curated design, minimalist architectural forms, and intelligent engineering.
            </p>
          </div>

          {/* Column 2: Legal Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] font-bold uppercase text-neutral-450 dark:text-neutral-500">
              Legal Info
            </h4>
            <ul className="space-y-3 font-sans">
              <li>
                <Link
                  to="/terms"
                  className="text-xs tracking-widest uppercase hover:underline text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-xs tracking-widest uppercase hover:underline text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Developer Profile */}
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] font-bold uppercase text-neutral-450 dark:text-neutral-500">
              BUILT BY
            </h4>
            <div className="space-y-3 text-xs tracking-wider">
              <p className="font-serif text-sm font-semibold uppercase">Ayush Kamboj</p>
              <p className="text-neutral-500 dark:text-neutral-450 font-sans text-xs">
                ayushkamboj9690@gmail.com
              </p>
              <div>
                <a
                  href="#"
                  className="text-xs tracking-widest uppercase hover:underline text-gold font-semibold block mt-1"
                >
                  Ayush Kamboj - Full Stack Developer Portfolio
                </a>
              </div>
              <div className="flex gap-4 pt-1 font-sans text-[10px] uppercase tracking-widest">
                <a
                  href="https://github.com/Ayushh-k"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-black dark:hover:text-white hover:underline transition-colors"
                >
                  GitHub
                </a>
                <span className="text-neutral-300 dark:text-neutral-800">|</span>
                <a
                  href="#"
                  className="text-neutral-500 hover:text-black dark:hover:text-white hover:underline transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Contact Form */}
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.2em] font-bold uppercase text-neutral-450 dark:text-neutral-500">
              Quick Contact
            </h4>
            {isSent ? (
              <div className="border border-emerald-500/25 bg-emerald-50 dark:bg-emerald-950/15 p-4 text-xs text-emerald-700 dark:text-emerald-400 font-sans tracking-wider uppercase flex items-center gap-2 animate-fadeIn rounded-none">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Message Sent Successfully</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-b border-black/20 dark:border-white/20 bg-transparent py-2 focus:outline-none focus:border-black dark:focus:border-white w-full text-xs text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-none transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Message"
                    rows={2}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border-b border-black/20 dark:border-white/20 bg-transparent py-2 focus:outline-none focus:border-black dark:focus:border-white w-full text-xs text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-none transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-black text-white dark:bg-white dark:text-black py-3 px-6 text-[10px] uppercase tracking-widest font-semibold hover:bg-neutral-805 dark:hover:bg-neutral-200 transition-colors w-full rounded-none text-center flex items-center justify-center gap-2"
                >
                  <Send className="h-3 w-3 stroke-[1.5]" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Copyright notice */}
        <div className="mt-16 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] uppercase tracking-[0.2em] text-neutral-450 dark:text-neutral-600">
          <span>&copy; {new Date().getFullYear()} SmartStore. All Rights Reserved.</span>
          <span>Designed with high-contrast luxury aesthetics.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

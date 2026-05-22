// frontend/src/pages/Terms.jsx

import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 text-left">
        
        {/* Back Link */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors duration-350"
          >
            <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
            <span>Back to Atelier</span>
          </Link>
        </div>

        {/* Header Block */}
        <div className="border-b border-black/10 dark:border-white/10 pb-8 mb-12">
          <span className="text-[10px] tracking-[0.35em] uppercase text-gold font-bold block mb-3">
            Legal Directory
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-wide uppercase leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-4">
            Last Updated: May 2026
          </p>
        </div>

        {/* Editorial Text Body */}
        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-3xl mx-auto font-sans text-neutral-800 dark:text-neutral-300 leading-relaxed space-y-12">
          
          <section className="space-y-4">
            <h2 className="font-serif text-lg md:text-xl uppercase tracking-wider text-black dark:text-white border-l-2 border-gold pl-4">
              01. The Atelier Agreement
            </h2>
            <p className="text-justify uppercase tracking-wide text-xs">
              Welcome to SmartStore AI. By accessing and browsing our editorial storefront, you enter into a binding agreement to adhere to these terms. We curate items with precision, and your interactions with our catalog, automated copy writers, and stylists represent consent to these guidelines.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-lg md:text-xl uppercase tracking-wider text-black dark:text-white border-l-2 border-gold pl-4">
              02. User Accounts & Responsibilities
            </h2>
            <p className="text-justify uppercase tracking-wide text-xs">
              When creating an account inside our platform, you assume full responsibility for protecting credentials. Our database stores custom styling configurations, size predictive values, and wishlist items. You agree to immediately notify our support team if you notice unauthorized login activity or profile changes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-lg md:text-xl uppercase tracking-wider text-black dark:text-white border-l-2 border-gold pl-4">
              03. Purchase Conditions & Custom Stylist Calculations
            </h2>
            <p className="text-justify uppercase tracking-wide text-xs">
              All sizes, variations, and pricing indices displayed on the storefront are subject to real-time adjustments. Our AI Stylist evaluates database records to present personalized pricing analysis. Placing items in the shopping cart does not reserve stock; inventory reservations are finalized only at checkout.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-lg md:text-xl uppercase tracking-wider text-black dark:text-white border-l-2 border-gold pl-4">
              04. Returns, Exchanges & Refunds
            </h2>
            <p className="text-justify uppercase tracking-wide text-xs">
              Curated luxury items are subject to a strict 14-day return framework. Items must remain in their original unworn state, complete with brand labels and protective tags. Refund amounts will be issued back to the primary payment method upon successful catalog validation.
            </p>
          </section>

        </article>

        {/* Footer CTA */}
        <div className="border-t border-black/10 dark:border-white/10 mt-16 pt-12 text-center">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-6">
            Have questions about our storefront agreements?
          </p>
          <Link
            to="/"
            className="inline-block bg-black text-white dark:bg-white dark:text-black px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-805 dark:hover:bg-neutral-200 transition-colors duration-300"
          >
            Acknowledge & Return
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Terms;

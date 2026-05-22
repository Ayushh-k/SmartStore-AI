// frontend/src/pages/Privacy.jsx

import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const Privacy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-4">
            Last Updated: May 2026
          </p>
        </div>

        {/* Editorial Text Body */}
        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-3xl mx-auto font-sans text-neutral-800 dark:text-neutral-300 leading-relaxed space-y-12">
          
          <section className="space-y-4">
            <h2 className="font-serif text-lg md:text-xl uppercase tracking-wider text-black dark:text-white border-l-2 border-gold pl-4">
              01. Data Collection & Processing
            </h2>
            <p className="text-justify uppercase tracking-wide text-xs">
              We gather user profile parameters, shipping destinations, cart history, and sizing preferences to deliver a tailored shopping experience. When you utilize the AI Sizing Predictor or Ask AI Search queries, inputs are analyzed dynamically to customize output recommendations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-lg md:text-xl uppercase tracking-wider text-black dark:text-white border-l-2 border-gold pl-4">
              02. Information Protection Framework
            </h2>
            <p className="text-justify uppercase tracking-wide text-xs">
              SmartStore AI maintains rigorous security parameters to protect user data from unauthorized access, disclosure, or corruption. Authentication tokens are securely encrypted, and access controls restrict data fields to verified accounts and authorized administrators.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-lg md:text-xl uppercase tracking-wider text-black dark:text-white border-l-2 border-gold pl-4">
              03. Sharing & External Services
            </h2>
            <p className="text-justify uppercase tracking-wide text-xs">
              We do not sell, trade, or transfer your personal metrics to third-party brokers. We share necessary shipping coordinates with logistics partners exclusively to execute order fulfillment, and transaction amounts are processed through secure digital gateways.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-lg md:text-xl uppercase tracking-wider text-black dark:text-white border-l-2 border-gold pl-4">
              04. User Control & Account Erasure
            </h2>
            <p className="text-justify uppercase tracking-wide text-xs">
              You retain full rights to request verification, modification, or complete erasure of your stored database records. Profile configurations, wishlist logs, and order histories can be managed inside the customer settings tab or cleared by contacting support.
            </p>
          </section>

        </article>

        {/* Footer CTA */}
        <div className="border-t border-black/10 dark:border-white/10 mt-16 pt-12 text-center">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-6">
            Concerned about how your digital footprint is managed?
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

export default Privacy;

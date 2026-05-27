// frontend/src/components/SmartStoreLogo.jsx
import React from "react";

const SmartStoreLogo = ({ className = "w-32 h-auto" }) => {
  return (
    <svg viewBox="0 0 230 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Abstract Sharp 'S' Icon */}
      <path d="M10 30L25 10H40L25 30H10Z" fill="currentColor" />
      <path d="M20 30L35 10H50L35 30H20Z" fill="currentColor" fillOpacity="0.3" />
      {/* Clean Luxury Typography */}
      <text x="60" y="26" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="20" letterSpacing="0.25em" fill="currentColor">SMART</text>
      <text x="148" y="26" fontFamily="Inter, sans-serif" fontWeight="300" fontSize="20" letterSpacing="0.1em" fill="currentColor">STORE</text>
    </svg>
  );
};

export default SmartStoreLogo;

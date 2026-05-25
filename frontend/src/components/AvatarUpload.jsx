// frontend/src/components/AvatarUpload.jsx

import React, { useRef } from "react";
import { Camera, User } from "lucide-react";

/**
  A highly minimalist editorial photo upload component.
  Renders a 120x120px square box.
  On hover, displays "EDIT PHOTO".
  Converts image input to base64 and lifts it up.
 */
const AvatarUpload = ({ value, onChange }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        onClick={handleBoxClick}
        className="relative w-[120px] h-[120px] border border-neutral-300 dark:border-neutral-800 bg-gray-50 dark:bg-black overflow-hidden group cursor-pointer transition-colors duration-300 select-none rounded-none"
      >
        {value ? (
          <img
            src={value}
            alt="Avatar Preview"
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-700 transition-opacity duration-300 group-hover:opacity-40">
            <User className="h-8 w-8 stroke-[1]" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 dark:bg-white/5 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
          <Camera className="h-4.5 w-4.5 text-white dark:text-black mb-1 stroke-[1.5]" />
          <span className="text-[8px] font-mono tracking-widest text-white dark:text-black font-semibold">
            EDIT PHOTO
          </span>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;

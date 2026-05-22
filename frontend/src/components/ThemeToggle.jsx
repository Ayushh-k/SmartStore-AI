// frontend/src/components/ThemeToggle.jsx

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const ThemeToggle = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  const defaultClass = "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors duration-300 p-1 bg-transparent border-none flex items-center justify-center cursor-pointer focus:outline-none";

  return (
    <button
      onClick={toggleTheme}
      className={className || defaultClass}
      aria-label="Toggle Theme"
      type="button"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 stroke-[1.5]" />
      ) : (
        <Moon className="h-4 w-4 stroke-[1.5]" />
      )}
    </button>
  );
};

export default ThemeToggle;

// frontend/src/components/UserNavbar.jsx

import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, LogOut, LayoutDashboard, User, Heart, Menu, X } from "lucide-react";
import api from "../utils/api.js";
import ThemeToggle from "./ThemeToggle.jsx";

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Read user profile
  useEffect(() => {
    const rawUser = localStorage.getItem("smartstoreuser");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Poll or retrieve cart count from server periodically
  const fetchCartCount = async () => {
    if (document.visibilityState === "hidden") return;
    const token = localStorage.getItem("smartstoretoken");
    if (!token) return;
    try {
      const res = await api.get("/api/store/cart");
      const items = res.data || [];
      const totalQty = items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
      setCartCount(totalQty);
    } catch (err) {
      console.error("Fetch cart count error:", err);
    }
  };

  useEffect(() => {
    fetchCartCount();
    // Setup a simple poll every 5 seconds to keep cart indicator in sync
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Custom event listener for cart updates from storefront actions
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartstoretoken");
    localStorage.removeItem("smartstoreuser");
    navigate("/login");
  };

  const isWishlistPage = location.pathname === "/profile" && location.search.includes("tab=wishlist");
  const isStorefront = location.pathname === "/";

  // Dynamic colors depending on whether navbar is overlaying storefront dark hero image
  const navContainerClass = `absolute top-0 left-0 w-full z-50 bg-transparent py-8 px-6 sm:px-12 flex items-center justify-between border-b ${
    isStorefront
      ? "text-white border-white/5"
      : "text-black dark:text-white border-black/5 dark:border-white/5"
  }`;

  const getLinkClass = (isActive) => {
    const base = "font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 pb-1";
    if (isStorefront) {
      if (isActive) {
        return `${base} text-white border-b border-white`;
      }
      return `${base} text-neutral-400 hover:text-white`;
    } else {
      if (isActive) {
        return `${base} text-black dark:text-white border-b border-black dark:border-white`;
      }
      return `${base} text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white`;
    }
  };

  const wishlinkClass = () => {
    const base = "font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 pb-1 flex items-center gap-1.5";
    if (isStorefront) {
      if (isWishlistPage) {
        return `${base} text-white border-b border-white`;
      }
      return `${base} text-neutral-400 hover:text-white`;
    } else {
      if (isWishlistPage) {
        return `${base} text-black dark:text-white border-b border-black dark:border-white`;
      }
      return `${base} text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white`;
    }
  };

  const logoClass = `font-serif text-lg sm:text-2xl tracking-[0.35em] uppercase transition-colors duration-300 font-medium whitespace-nowrap ${
    isStorefront ? "text-white hover:text-white/80" : "text-black dark:text-white hover:opacity-80"
  }`;

  const actionClass = isStorefront
    ? "font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
    : "font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white transition-colors duration-300 flex items-center gap-1.5";

  const logoutClass = isStorefront
    ? "font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-rose-400 transition-colors duration-300 flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
    : "font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-500 hover:text-rose-600 dark:text-neutral-450 dark:hover:text-rose-450 transition-colors duration-300 flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0";

  const signInClass = isStorefront
    ? "font-montserrat text-[11px] tracking-[0.2em] uppercase bg-white text-black px-5 py-2 font-semibold hover:bg-neutral-200 transition-colors duration-300"
    : "font-montserrat text-[11px] tracking-[0.2em] uppercase bg-black text-white dark:bg-white dark:text-black px-5 py-2 font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-300";

  const themeToggleClass = isStorefront
    ? "text-neutral-400 hover:text-white transition-colors duration-300 p-1 bg-transparent border-none flex items-center justify-center cursor-pointer focus:outline-none"
    : "text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white transition-colors duration-300 p-1 bg-transparent border-none flex items-center justify-center cursor-pointer focus:outline-none";

  return (
    <nav className={navContainerClass}>
      {/* Mobile Backdrop overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0a0a0a] border-r border-black/10 dark:border-white/10 p-6 z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center pb-6 border-b border-black/5 dark:border-white/5">
          <Link to="/" className="font-serif text-lg tracking-[0.25em] uppercase font-semibold" onClick={() => setIsMenuOpen(false)}>
            SmartStore
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-neutral-500 hover:text-black dark:hover:text-white p-1 focus:outline-none"
          >
            <X className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-6 text-left">
          <NavLink
            to="/"
            end
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => getLinkClass(isActive && !isWishlistPage)}
          >
            Shop
          </NavLink>

          {user && (
            <NavLink
              to="/profile?tab=wishlist"
              onClick={() => setIsMenuOpen(false)}
              className={wishlinkClass}
            >
              <Heart className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>Wishlist</span>
            </NavLink>
          )}

          {user && user.role === "admin" && (
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-gold hover:text-neutral-800 dark:hover:text-white transition-colors duration-300 border border-gold/30 px-3 py-2 flex items-center gap-1.5 w-max"
            >
              <LayoutDashboard className="h-3 w-3 stroke-[1.5]" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          <div className="border-t border-black/5 dark:border-white/5 pt-6 flex flex-col gap-6">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={actionClass}
                >
                  <User className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>My Profile ({user.name.split(" ")[0]})</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className={logoutClass}
                >
                  <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={signInClass}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 w-full items-center">
        {/* Left Side: Hamburger (Mobile) & Navigation Links (Desktop) */}
        <div className="flex items-center justify-start">
          {/* Hamburger button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white p-1 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5 stroke-[1.5]" />
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={({ isActive }) => getLinkClass(isActive && !isWishlistPage)}>
              Shop
            </NavLink>

            {user && (
              <NavLink to="/profile?tab=wishlist" className={wishlinkClass}>
                <Heart className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>Wishlist</span>
              </NavLink>
            )}

            {user && user.role === "admin" && (
              <Link
                to="/dashboard"
                className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-gold hover:text-neutral-800 dark:hover:text-white transition-colors duration-300 border border-gold/30 px-3 py-1 flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-3 w-3 stroke-[1.5]" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Center: Luxury Serif Brand Logo */}
        <div className="flex justify-center">
          <Link to="/" className={logoClass}>
            SmartStore
          </Link>
        </div>

        {/* Right Side: Theme Toggle, Cart, Profile & Actions */}
        <div className="flex items-center gap-4 sm:gap-8 justify-end">
          <ThemeToggle className={themeToggleClass} />

          <NavLink to="/cart" className={({ isActive }) => getLinkClass(isActive)}>
            <ShoppingCart className="h-3.5 w-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="text-[10px] font-montserrat font-medium text-gold ml-0.5">
                ({cartCount})
              </span>
            )}
          </NavLink>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/profile" className={actionClass}>
                  <User className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>{user.name.split(" ")[0]}</span>
                </Link>
                <button onClick={handleLogout} className={logoutClass}>
                  <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className={signInClass}>
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Profile Icon */}
          {user && (
            <Link to="/profile" className="md:hidden text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white p-1">
              <User className="h-4 w-4 stroke-[1.5]" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;

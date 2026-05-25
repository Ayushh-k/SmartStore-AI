// frontend/src/components/UserNavbar.jsx

import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  User,
  Heart,
  Menu,
  X,
  Home,
  Store,
} from "lucide-react";
import api from "../utils/api.js";
import ThemeToggle from "./ThemeToggle.jsx";

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.search]);

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

  // Fetch cart count
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
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartstoretoken");
    localStorage.removeItem("smartstoreuser");
    setIsMenuOpen(false);
    navigate("/login");
  };

  const isWishlistPage =
    location.pathname === "/profile" && location.search.includes("tab=wishlist");
  const isStorefront = location.pathname === "/";

  // ── Desktop nav link styles ──────────────────────────────────────────────
  const getDesktopLinkClass = (isActive) => {
    const base =
      "font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 pb-1";
    if (isStorefront) {
      return isActive
        ? `${base} text-white border-b border-white`
        : `${base} text-neutral-400 hover:text-white`;
    }
    return isActive
      ? `${base} text-black dark:text-white border-b border-black dark:border-white`
      : `${base} text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white`;
  };

  // ── Mobile drawer link styles (always light/dark aware, never storefront colors) ──
  const getMobileLinkClass = (isActive) => {
    const base =
      "font-montserrat text-[13px] tracking-[0.15em] uppercase transition-colors duration-200 flex items-center gap-3 py-1";
    return isActive
      ? `${base} text-black dark:text-white font-semibold`
      : `${base} text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white`;
  };

  const mobileWishlistClass = () => {
    const base =
      "font-montserrat text-[13px] tracking-[0.15em] uppercase transition-colors duration-200 flex items-center gap-3 py-1";
    return isWishlistPage
      ? `${base} text-black dark:text-white font-semibold`
      : `${base} text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white`;
  };

  const logoClass = `font-serif text-lg sm:text-2xl tracking-[0.35em] uppercase transition-colors duration-300 font-medium whitespace-nowrap ${
    isStorefront
      ? "text-white hover:text-white/80"
      : "text-black dark:text-white hover:opacity-80"
  }`;

  const actionClass = isStorefront
    ? "font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
    : "font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors duration-300 flex items-center gap-1.5";

  const logoutClass = isStorefront
    ? "font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-rose-400 transition-colors duration-300 flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
    : "font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors duration-300 flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0";

  const signInClass = isStorefront
    ? "font-montserrat text-[11px] tracking-[0.2em] uppercase bg-white text-black px-5 py-2 font-semibold hover:bg-neutral-200 transition-colors duration-300"
    : "font-montserrat text-[11px] tracking-[0.2em] uppercase bg-black text-white dark:bg-white dark:text-black px-5 py-2 font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-300";

  const themeToggleClass = isStorefront
    ? "text-neutral-400 hover:text-white transition-colors duration-300 p-1 bg-transparent border-none flex items-center justify-center cursor-pointer focus:outline-none"
    : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors duration-300 p-1 bg-transparent border-none flex items-center justify-center cursor-pointer focus:outline-none";

  const navContainerClass = `absolute top-0 left-0 w-full z-50 bg-transparent py-5 sm:py-8 px-5 sm:px-12 flex items-center justify-between border-b ${
    isStorefront
      ? "text-white border-white/5"
      : "text-black dark:text-white border-black/5 dark:border-white/5"
  }`;

  return (
    <nav className={navContainerClass}>

      {/* ── Mobile Backdrop ────────────────────────────────────────────── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Slide-In Drawer ─────────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 w-[280px] sm:w-80 bg-white dark:bg-[#0a0a0a] border-r border-black/10 dark:border-white/10 z-50 flex flex-col transform transition-transform duration-300 ease-out md:hidden ${
          isMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation menu"
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-black/8 dark:border-white/8">
          <Link
            to="/"
            className="font-serif text-base tracking-[0.3em] uppercase font-semibold text-black dark:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            SmartStore
          </Link>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-neutral-500 hover:text-black dark:hover:text-white p-1.5 rounded-sm focus:outline-none transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1">
          {/* Section: Browse */}
          <p className="text-[9px] tracking-[0.3em] uppercase text-neutral-400 dark:text-neutral-600 font-montserrat mb-3">
            Browse
          </p>

          <NavLink
            to="/"
            end
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => getMobileLinkClass(isActive && !isWishlistPage)}
          >
            <Store className="h-4 w-4 stroke-[1.5] shrink-0" />
            Shop
          </NavLink>

          {user && (
            <NavLink
              to="/profile?tab=wishlist"
              onClick={() => setIsMenuOpen(false)}
              className={mobileWishlistClass()}
            >
              <Heart className="h-4 w-4 stroke-[1.5] shrink-0" />
              Wishlist
            </NavLink>
          )}

          <NavLink
            to="/cart"
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) => getMobileLinkClass(isActive)}
          >
            <ShoppingCart className="h-4 w-4 stroke-[1.5] shrink-0" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-auto text-[10px] font-medium bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 font-montserrat">
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* Section: Account */}
          <div className="border-t border-black/8 dark:border-white/8 mt-6 pt-6 flex flex-col gap-1">
            <p className="text-[9px] tracking-[0.3em] uppercase text-neutral-400 dark:text-neutral-600 font-montserrat mb-3">
              Account
            </p>

            {user ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => getMobileLinkClass(isActive && !isWishlistPage)}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="h-4 w-4 object-cover border border-black/10 dark:border-white/10 shrink-0"
                    />
                  ) : (
                    <User className="h-4 w-4 stroke-[1.5] shrink-0" />
                  )}
                  My Profile
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-600 normal-case tracking-normal ml-1">
                    ({user.name.split(" ")[0]})
                  </span>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="font-montserrat text-[13px] tracking-[0.15em] uppercase transition-colors duration-200 flex items-center gap-3 py-1 text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 w-full text-left cursor-pointer bg-transparent border-none"
                >
                  <LogOut className="h-4 w-4 stroke-[1.5] shrink-0" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-montserrat text-[13px] tracking-[0.15em] uppercase transition-colors duration-200 flex items-center gap-3 py-1 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  <User className="h-4 w-4 stroke-[1.5] shrink-0" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-4 w-full bg-black dark:bg-white text-white dark:text-black py-3 text-center font-montserrat text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Section: Portal (admin/superadmin only) */}
          {user && (user.role === "admin" || user.role === "superadmin") && (
            <div className="border-t border-black/8 dark:border-white/8 mt-6 pt-6 flex flex-col gap-1">
              <p className="text-[9px] tracking-[0.3em] uppercase text-neutral-400 dark:text-neutral-600 font-montserrat mb-3">
                Portal
              </p>
              {user.role === "superadmin" && (
                <Link
                  to="/developer"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-montserrat text-[13px] tracking-[0.15em] uppercase flex items-center gap-3 py-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 stroke-[1.5] shrink-0" />
                  Developer Portal
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-montserrat text-[13px] tracking-[0.15em] uppercase flex items-center gap-3 py-1 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 stroke-[1.5] shrink-0" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-black/8 dark:border-white/8 flex items-center justify-between">
          <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-600 font-montserrat">
            Theme
          </span>
          <ThemeToggle className="text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors p-1 bg-transparent border-none flex items-center justify-center cursor-pointer focus:outline-none" />
        </div>
      </div>

      {/* ── Top Bar (3-column grid) ────────────────────────────────────── */}
      <div className="grid grid-cols-3 w-full items-center">

        {/* Left: Hamburger (mobile) | Nav links (desktop) */}
        <div className="flex items-center justify-start gap-6">
          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`md:hidden p-1 focus:outline-none transition-colors ${
              isStorefront
                ? "text-neutral-300 hover:text-white"
                : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            }`}
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
          >
            <Menu className="h-5 w-5 stroke-[1.5]" />
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              end
              className={({ isActive }) => getDesktopLinkClass(isActive && !isWishlistPage)}
            >
              Shop
            </NavLink>

            {user && (
              <NavLink
                to="/profile?tab=wishlist"
                className={({ isActive }) =>
                  `font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 pb-1 flex items-center gap-1.5 ${
                    isStorefront
                      ? isWishlistPage
                        ? "text-white border-b border-white"
                        : "text-neutral-400 hover:text-white"
                      : isWishlistPage
                      ? "text-black dark:text-white border-b border-black dark:border-white"
                      : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                  }`
                }
              >
                <Heart className="h-3.5 w-3.5 stroke-[1.5]" />
                <span>Wishlist</span>
              </NavLink>
            )}

            {user && user.role === "superadmin" && (
              <Link
                to="/developer"
                className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors border border-amber-400/30 px-3 py-1 flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-3 w-3 stroke-[1.5]" />
                <span>Developer</span>
              </Link>
            )}

            {user && user.role === "admin" && (
              <Link
                to="/dashboard"
                className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors border border-amber-400/30 px-3 py-1 flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-3 w-3 stroke-[1.5]" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex justify-center">
          <Link to="/" className={logoClass}>
            SmartStore
          </Link>
        </div>

        {/* Right: Theme Toggle, Cart, Profile/Sign In */}
        <div className="flex items-center gap-3 sm:gap-5 justify-end">
          {/* Theme Toggle — hidden on mobile (moved to drawer footer) */}
          <div className="hidden md:block">
            <ThemeToggle className={themeToggleClass} />
          </div>

          {/* Cart Icon — always visible */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `flex items-center gap-1.5 relative font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 pb-1 ${
                isStorefront
                  ? isActive
                    ? "text-white border-b border-white"
                    : "text-neutral-400 hover:text-white"
                  : isActive
                  ? "text-black dark:text-white border-b border-black dark:border-white"
                  : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`
            }
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <div className="relative">
              <ShoppingCart className="h-4 w-4 stroke-[1.5]" />
              {/* Mobile cart badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 md:hidden bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-montserrat leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
            {/* Desktop count */}
            {cartCount > 0 && (
              <span className="hidden sm:inline text-[10px] font-montserrat font-medium text-amber-600 dark:text-amber-400">
                ({cartCount})
              </span>
            )}
          </NavLink>

          {/* Desktop: Profile + Logout / Sign In */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                <Link to="/profile" className={actionClass}>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="h-4 w-4 object-cover border border-black/10 dark:border-white/10"
                    />
                  ) : (
                    <User className="h-3.5 w-3.5 stroke-[1.5]" />
                  )}
                  <span>{user.name.split(" ")[0]}</span>
                </Link>
                <button onClick={handleLogout} className={logoutClass}>
                  <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className={signInClass}>
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile: Profile icon (if logged in) */}
          {user && (
            <Link
              to="/profile"
              className={`md:hidden p-1 transition-colors ${
                isStorefront
                  ? "text-neutral-300 hover:text-white"
                  : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`}
              aria-label="My Profile"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="h-5 w-5 object-cover border border-black/10 dark:border-white/10"
                />
              ) : (
                <User className="h-4.5 w-4.5 stroke-[1.5]" />
              )}
            </Link>
          )}

          {/* Mobile: Sign In button (if not logged in) */}
          {!user && (
            <Link
              to="/login"
              className={`md:hidden font-montserrat text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 font-semibold transition-colors ${
                isStorefront
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
              }`}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;

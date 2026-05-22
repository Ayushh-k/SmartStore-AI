// frontend/src/components/UserNavbar.jsx

import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, ShoppingCart, LogOut, LayoutDashboard, User, Heart } from "lucide-react";
import api from "../utils/api.js";

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

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

  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-transparent py-8 px-6 sm:px-12 flex items-center justify-between text-white border-b border-white/5">
      <div className="grid grid-cols-3 w-full items-center">
        {/* Left Side: Navigation Links */}
        <div className="flex items-center gap-8 justify-start">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 pb-1 ${
                isActive && !isWishlistPage
                  ? "text-white border-b border-white"
                  : "text-neutral-400 hover:text-white"
              }`
            }
          >
            Shop
          </NavLink>

          {user && (
            <NavLink
              to="/profile?tab=wishlist"
              className={() =>
                `font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 pb-1 flex items-center gap-1.5 ${
                  isWishlistPage
                    ? "text-white border-b border-white"
                    : "text-neutral-400 hover:text-white"
                }`
              }
            >
              <Heart className="h-3.5 w-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Wishlist</span>
            </NavLink>
          )}

          {user && user.role === "admin" && (
            <Link
              to="/dashboard"
              className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-gold hover:text-white transition-colors duration-300 border border-gold/30 px-3 py-1 flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-3 w-3 stroke-[1.5]" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Center: Luxury Serif Brand Logo */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="font-serif text-lg sm:text-2xl tracking-[0.35em] uppercase text-white hover:text-white/80 transition-colors duration-300 font-medium whitespace-nowrap"
          >
            SmartStore
          </Link>
        </div>

        {/* Right Side: Cart, Profile & Actions */}
        <div className="flex items-center gap-8 justify-end">
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 pb-1 flex items-center gap-1.5 ${
                isActive ? "text-white border-b border-white" : "text-neutral-400 hover:text-white"
              }`
            }
          >
            <ShoppingCart className="h-3.5 w-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="text-[10px] font-montserrat font-medium text-gold ml-0.5">
                ({cartCount})
              </span>
            )}
          </NavLink>

          {user ? (
            <div className="flex items-center gap-6">
              <Link
                to="/profile"
                className="font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 stroke-[1.5]" />
                <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="font-montserrat text-[11px] tracking-[0.2em] uppercase text-neutral-400 hover:text-rose-400 transition-colors duration-300 flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
              >
                <LogOut className="h-3.5 w-3.5 stroke-[1.5]" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="font-montserrat text-[11px] tracking-[0.2em] uppercase bg-white text-black px-5 py-2 font-semibold hover:bg-neutral-200 transition-colors duration-300"
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

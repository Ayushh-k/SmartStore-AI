// frontend/src/components/UserNavbar.jsx

import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, ShoppingCart, LogOut, LayoutDashboard, User } from "lucide-react";
import api from "../utils/api.js";

const UserNavbar = () => {
  const navigate = useNavigate();
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

  return (
    <nav className="glass-panel border-x-0 border-t-0 rounded-none sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-slate-950/85">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-primary hover:text-indigo-400 transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            SmartStore Shop
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-6 text-xs font-medium">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive
              ? "text-primary border-b border-primary pb-1"
              : "text-slate-300 hover:text-slate-150 transition-colors"
          }
        >
          Shop
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `relative flex items-center gap-1.5 transition-colors ${
              isActive ? "text-primary border-b border-primary pb-1" : "text-slate-300 hover:text-slate-150"
            }`
          }
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2.5 -right-3 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-lg animate-pulse">
              {cartCount}
            </span>
          )}
        </NavLink>

        {user && user.role === "admin" && (
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 bg-emerald-950/20 rounded px-2.5 py-1 text-[11px]"
          >
            <LayoutDashboard className="h-3 w-3" />
            <span>Admin Dashboard</span>
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-350">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded bg-slate-900 border border-slate-800 px-2 py-1 text-slate-400 hover:text-rose-450 hover:bg-rose-950/25 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="btn-primary text-[11px] px-3.5 py-1.5"
          >
            Login / Signup
          </Link>
        )}
      </div>
    </nav>
  );
};

export default UserNavbar;

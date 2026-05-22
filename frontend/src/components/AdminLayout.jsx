// frontend/src/components/AdminLayout.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  LogOut,
  ShoppingBag,
  Bell,
  Check,
  X
} from "lucide-react";
import api from "../utils/api.js";

/**
  AdminLayout with glassmorphic sidebar, header with notifications, and main content area.
 */
const AdminLayout = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  
  const notificationRef = useRef(null);
  const latestNotificationIdRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("smartstoretoken");
    localStorage.removeItem("smartstoreuser");
    navigate("/login");
  };

  const fetchNotifications = async (isInitial = false) => {
    try {
      const res = await api.get("/api/dashboard/notifications");
      const fetchedList = res.data || [];
      setNotifications(fetchedList);
      
      const unreads = fetchedList.filter((n) => !n.read).length;
      setUnreadCount(unreads);

      if (fetchedList.length > 0) {
        const latest = fetchedList[0];
        
        // Trigger toast on new unread notifications if not initial load
        if (!isInitial && latestNotificationIdRef.current && latest._id !== latestNotificationIdRef.current && !latest.read) {
          setToast({ show: true, message: latest.message });
          
          setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
          }, 4000);
        }
        
        latestNotificationIdRef.current = latest._id;
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications(true);

    // Poll notifications every 8 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications(false);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/api/dashboard/notifications/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark notifications read error:", err);
    }
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/products",
      label: "Products",
      icon: Package,
    },
    {
      to: "/products/new",
      label: "Add Product",
      icon: PackagePlus,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative">
      {/* Toast Alert Popup */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[9999] w-80 rounded-2xl border border-emerald-500/30 bg-slate-950/95 backdrop-blur-md p-4 shadow-2xl flex items-start gap-3 border-l-4 border-l-emerald-500 animate-slideIn">
          <div className="rounded-lg bg-emerald-950/60 p-1.5 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-xs font-bold text-slate-200">New Sale Recorded!</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast({ show: false, message: "" })}
            className="text-slate-505 hover:text-slate-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto flex h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="glass-panel flex w-64 flex-col p-4">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-700/60 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold tracking-tight">
                SmartStore AI
              </div>
              <div className="text-xs text-slate-400">
                AI-Powered Admin Console
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-100",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-4 border-t border-slate-700/60 pt-4 text-xs text-slate-400">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 cursor-pointer"
            >
              <span className="flex items-center gap-2 text-sm">
                <LogOut className="h-4 w-4" />
                Logout
              </span>
              <span className="text-[10px] uppercase tracking-wide">
                Admin
              </span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="glass-panel flex-1 overflow-hidden">
          <header className="flex items-center justify-between border-b border-slate-700/60 px-6 py-4">
            <div className="text-left">
              <h1 className="text-lg font-semibold tracking-tight">
                SmartStore Overview
              </h1>
              <p className="text-xs text-slate-400">
                Monitor performance and generate AI-powered product content.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative rounded-xl border border-slate-800 bg-slate-950/70 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-1 ring-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Popover */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                      <span className="text-xs font-bold text-slate-350 uppercase tracking-wide">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-primary hover:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-900">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-[11px] text-slate-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`px-4 py-3 hover:bg-slate-900/40 transition-colors flex gap-2.5 items-start ${
                              !n.read ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className={`mt-0.5 rounded-lg p-1.5 shrink-0 ${
                              n.type === "purchase" 
                                ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400" 
                                : "bg-slate-900 border border-slate-800 text-slate-400"
                            }`}>
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-[11px] text-slate-300 leading-normal break-words">
                                {n.message}
                              </p>
                              <span className="text-[9px] text-slate-505 mt-1 block">
                                {formatTime(n.createdAt)}
                              </span>
                            </div>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/products/new"
                className="btn-primary inline-flex items-center gap-2 text-xs"
              >
                <PackagePlus className="h-4 w-4" />
                New Product
              </Link>
            </div>
          </header>

          <section className="h-[calc(100%-4rem)] overflow-y-auto px-6 py-5">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

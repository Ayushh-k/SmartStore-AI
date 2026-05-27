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
  X,
  ClipboardList,
  Menu,
  Settings,
  User
} from "lucide-react";
import api from "../utils/api.js";
import ThemeToggle from "./ThemeToggle.jsx";
import SmartStoreLogo from "./SmartStoreLogo.jsx";

/**
  AdminLayout with glassmorphic sidebar, header with notifications, and main content area.
 */
const AdminLayout = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "", storeName: "" });
  
  const notificationRef = useRef(null);
  const latestNotificationIdRef = useRef(null);

  const loadUser = () => {
    const raw = localStorage.getItem("smartstoreuser");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("storeSettingsUpdated", loadUser);
    return () => window.removeEventListener("storeSettingsUpdated", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartstoretoken");
    localStorage.removeItem("smartstoreuser");
    navigate("/login");
  };

  const playNotificationSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
    audio.volume = 0.6; // Muted to a premium comfortable level
    audio.play().catch((error) => {
      console.log("Audio playback prevented by browser autoplay policy until user interaction:", error);
    });
  };

  const fetchNotifications = async (isInitial = false) => {
    try {
      const res = await api.get("/api/dashboard/notifications");
      const fetchedList = res.data || [];
      setNotifications(fetchedList);
      
      const unreads = fetchedList.filter((n) => !n.read && !n.isRead).length;
      setUnreadCount(unreads);

      if (fetchedList.length > 0) {
        const latest = fetchedList[0];
        
        // Trigger toast on new unread notifications if not initial load
        if (!isInitial && latestNotificationIdRef.current && latest._id !== latestNotificationIdRef.current && !latest.read && !latest.isRead) {
          setToast({ show: true, message: latest.message });
          playNotificationSound();
          
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
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark notifications read error:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    setShowDropdown(false);
    
    const isAlreadyRead = notification.isRead || notification.read;
    if (isAlreadyRead) {
      if (notification.link) navigate(notification.link);
      return;
    }

    // 1. Optimistic UI Update: Instantly mark as read in local state to reduce the count badge immediately
    setNotifications((prev) =>
      prev.map((n) => (n._id === notification._id ? { ...n, isRead: true, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      // 2. Background API Call to persist read state in DB
      const token = localStorage.getItem("smartstoretoken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await api.put(`/api/notifications/${notification._id}/read`, {}, config);

      // 3. Dynamic Redirection based on notification metadata
      if (notification.link) {
        navigate(notification.link);
      } else if (notification.type === "ORDER") {
        navigate("/admin/orders");
      } else {
        navigate("/admin/profile"); // Fallback
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
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
      end: true,
    },
    {
      to: "/products/new",
      label: "Add Product",
      icon: PackagePlus,
      end: true,
    },
    {
      to: "/admin/orders",
      label: "Orders",
      icon: ClipboardList,
    },
    {
      to: "/admin/settings",
      label: "Store Settings",
      icon: Settings,
    },
    {
      to: "/admin/profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] text-black dark:text-neutral-100 relative font-sans transition-colors duration-300">
      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Toast Alert Popup */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] w-80 border border-black dark:border-white bg-white dark:bg-black p-4 shadow-2xl flex items-start gap-3 animate-slideIn rounded-none text-black dark:text-white">
          <div className="text-black dark:text-white shrink-0 mt-0.5">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-black dark:text-white">New Sale Recorded</h4>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-normal">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast({ show: false, message: "" })}
            className="text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto flex h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 dark:border-neutral-900 bg-white dark:bg-black flex flex-col p-6 rounded-none transition-transform duration-300 md:static md:translate-x-0 md:flex md:w-64 md:border ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="mb-8 flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
            <div className="flex flex-col gap-1 text-left">
              <Link to="/" className="block hover:opacity-80 transition-opacity">
                <SmartStoreLogo className="w-44 h-auto text-[#0a0a0a] dark:text-white" />
              </Link>
              <div className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5 pl-0.5">
                {user.storeName || "Admin Console"}
              </div>
            </div>
            
            {/* Close button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 text-neutral-500 hover:text-black dark:hover:text-white focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2.5 transition-all text-[10px] uppercase tracking-widest rounded-none",
                      isActive
                        ? "bg-black dark:bg-white text-white dark:text-black font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-4 border-t border-gray-200 dark:border-neutral-900 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between px-2 py-2 text-neutral-650 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer rounded-none animate-none"
            >
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold">
                <LogOut className="h-4 w-4" />
                Logout
              </span>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                Admin
              </span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black flex flex-col overflow-hidden rounded-none text-black dark:text-white transition-colors duration-300">
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 px-6 py-5 bg-white dark:bg-black">
            <div className="flex items-center gap-3">
              {/* Sidebar Menu Trigger Button on Mobile */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none focus:outline-none"
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
              
              <div className="text-left">
                <h1 className="font-serif text-lg tracking-widest uppercase text-black dark:text-white">
                  Admin Portal
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
                  SmartStore AI Engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle className="text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white transition-colors duration-300 p-1 bg-transparent border-none flex items-center justify-center cursor-pointer focus:outline-none" />
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black p-2.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-neutral-700 transition-all cursor-pointer rounded-none"
                  title="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-black dark:bg-white text-[8px] font-bold text-white dark:text-black ring-1 ring-white dark:ring-black">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Popover */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black shadow-2xl z-50 overflow-hidden rounded-none animate-fadeIn text-black dark:text-white">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a]">
                      <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[9px] text-black dark:text-white hover:underline uppercase tracking-widest font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-200 dark:divide-neutral-900">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`px-4 py-3.5 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors flex gap-3 items-start cursor-pointer ${
                              (!n.read && !n.isRead) ? "bg-gray-50 dark:bg-neutral-900/40" : ""
                            }`}
                          >
                            <div className="mt-0.5 text-neutral-500 dark:text-neutral-400 shrink-0">
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-[11px] text-neutral-800 dark:text-neutral-300 leading-normal break-words">
                                {n.message}
                              </p>
                              <span className="text-[9px] text-neutral-500 uppercase tracking-wider mt-1.5 block">
                                {formatTime(n.createdAt)}
                              </span>
                            </div>
                            {(!n.read && !n.isRead) && (
                              <span className="h-1.5 w-1.5 bg-black dark:bg-white shrink-0 mt-1.5" />
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
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 tracking-widest uppercase font-bold py-2.5 px-4 text-[10px] rounded-none transition-colors inline-flex items-center gap-2"
              >
                <PackagePlus className="h-3.5 w-3.5" />
                Add Product
              </Link>
            </div>
          </header>

          <section className="h-[calc(100%-4rem)] overflow-y-auto px-6 py-6 bg-white dark:bg-black">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

// frontend/src/pages/developer/DeveloperLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  ShoppingBag,
  Menu,
  X,
  User
} from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle.jsx";

/**
  DeveloperLayout with minimalist luxury style for the developer dashboard.
 */
const DeveloperLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: "Developer", email: "", role: "" });

  useEffect(() => {
    const rawUser = localStorage.getItem("smartstoreuser");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {
        console.error("Error parsing user context in developer portal:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartstoretoken");
    localStorage.removeItem("smartstoreuser");
    navigate("/login");
  };

  const navItems = [
    {
      to: "/developer",
      label: "Overview",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/developer/stores",
      label: "Store Management",
      icon: Users,
    },
    {
      to: "/developer/users",
      label: "User Management",
      icon: Users,
    },
    {
      to: "/developer/products",
      label: "Global Products",
      icon: Package,
    },
    {
      to: "/developer/profile",
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

      <div className="mx-auto flex h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 dark:border-neutral-900 bg-white dark:bg-black flex flex-col p-6 rounded-none transition-transform duration-300 md:static md:translate-x-0 md:flex md:w-64 md:border ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="mb-8 flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
            <div className="flex items-center gap-3 text-left">
              <div className="text-black dark:text-white shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="font-serif text-sm font-semibold tracking-widest uppercase text-black dark:text-white">
                  SmartStore
                </div>
                <div className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Developer Portal
                </div>
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
          <nav className="flex-1 space-y-1.5 text-left">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsSidebarOpen(false)}
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

          {/* Footer with Active User Display */}
          <div className="mt-4 border-t border-gray-200 dark:border-neutral-900 pt-4 text-left">
            <div className="px-2 pb-3.5 space-y-0.5">
              <div className="text-[10px] font-bold text-black dark:text-white uppercase tracking-wider truncate">
                {user.name}
              </div>
              <div className="text-[8px] font-mono text-neutral-450 dark:text-neutral-500 truncate">
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between px-2 py-2 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer rounded-none border-t border-gray-250 dark:border-neutral-900 pt-2.5"
            >
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold">
                <LogOut className="h-4 w-4" />
                Logout
              </span>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
                Dev
              </span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black flex flex-col overflow-hidden rounded-none text-black dark:text-white transition-colors duration-300">
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 px-6 py-5 bg-white dark:bg-black">
            <div className="flex items-center gap-3 text-left">
              {/* Sidebar Menu Trigger Button on Mobile */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none focus:outline-none"
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>
              
              <div>
                <h1 className="font-serif text-lg tracking-widest uppercase text-black dark:text-white">
                  Developer Console
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Platform Moderation & Metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle className="text-neutral-500 hover:text-black dark:text-neutral-450 dark:hover:text-white transition-colors duration-300 p-1 bg-transparent border-none flex items-center justify-center cursor-pointer focus:outline-none" />
              {/* Active Super Admin info displayed clearly on top header */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                  {user.name}
                </span>
                <span className="text-[8px] font-mono text-neutral-450 dark:text-neutral-500">
                  {user.email}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest border border-black dark:border-white px-2.5 py-1 text-black dark:text-white font-bold font-mono">
                GOD MODE ACTIVE
              </span>
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

export default DeveloperLayout;

// frontend/src/layouts/AccountLayout.jsx

import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { User, ShoppingBag, MapPin, Heart, LogOut, Settings } from "lucide-react";

const AccountLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem("smartstoretoken");
    localStorage.removeItem("smartstoreuser");
    window.dispatchEvent(new Event("cartUpdated")); // force nav refresh
    navigate("/login");
  };

  const navItems = [
    { label: "MY ORDERS", path: "/orders", icon: ShoppingBag },
    { label: "PROFILE INFORMATION", path: "/profile", icon: Settings },
    { label: "MANAGE ADDRESSES", path: "/profile/addresses", icon: MapPin },
    { label: "MY WISHLIST", path: "/profile/wishlist", icon: Heart },
  ];

  const getLinkClass = (path) => {
    const base = "flex items-center gap-3 px-4 py-3.5 text-[10px] tracking-widest font-bold uppercase transition-all duration-200 rounded-none w-full text-left";
    const isActive = location.pathname === path || (path === "/profile" && location.pathname === "/profile" && !location.search.includes("tab=wishlist") && !location.search.includes("tab=addresses"));
    
    if (isActive) {
      return `${base} bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white border-l-2 border-black dark:border-white font-semibold`;
    }
    return `${base} text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[240px_1fr] items-start">
        {/* Sidebar */}
        <aside className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-5 space-y-6 rounded-none">
          {/* Top Info */}
          <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-neutral-400 stroke-[1.2]" />
              )}
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-neutral-400 font-semibold uppercase font-montserrat">Welcome,</p>
              <h3 className="text-sm font-bold text-black dark:text-white leading-tight">
                {user?.name || "Premium User"}
              </h3>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path} className={getLinkClass(item.path)}>
                  <Icon className="h-3.5 w-3.5 shrink-0 stroke-[1.5]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 text-[10px] tracking-widest font-bold uppercase transition-all duration-200 rounded-none w-full text-left text-neutral-500 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer bg-transparent border-none"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0 stroke-[1.5]" />
              <span>LOGOUT</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-6 min-h-[400px] rounded-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;

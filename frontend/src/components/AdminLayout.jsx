// frontend/src/components/AdminLayout.jsx

import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  LogOut,
  ShoppingBag,
} from "lucide-react";

/**
  AdminLayout with glassmorphic sidebar and main content area.
 */
const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("smartstoretoken");
    localStorage.removeItem("smartstoreuser");
    navigate("/login");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto flex h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="glass-panel flex w-64 flex-col p-4">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-700/60 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
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
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
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
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                SmartStore Overview
              </h1>
              <p className="text-xs text-slate-400">
                Monitor performance and generate AI-powered product content.
              </p>
            </div>
            <Link
              to="/products/new"
              className="btn-primary inline-flex items-center gap-2 text-xs"
            >
              <PackagePlus className="h-4 w-4" />
              New Product
            </Link>
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

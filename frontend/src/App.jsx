// frontend/src/App.jsx

import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import UserNavbar from "./components/UserNavbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import Login from "./pages/Login.jsx";
import Storefront from "./pages/Storefront.jsx";
import Cart from "./pages/Cart.jsx";

/**
  Authentication Guard for storefront users (e.g. shopping cart)
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("smartstoretoken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
  Authentication & Authorization Guard for administrative dashboard
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("smartstoretoken");
  const rawUser = localStorage.getItem("smartstoreuser");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(rawUser);
    if (user && user.role === "admin") {
      return children;
    }
  } catch (err) {
    console.error("Admin check parsing error:", err);
  }

  // Not an admin, redirect to user storefront shop
  return <Navigate to="/" replace />;
};

/**
  Layout container for user storefront shopping
 */
const UserLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <UserNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Login / Auth */}
      <Route path="/login" element={<Login />} />

      {/* User / Storefront Layout Routes */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Storefront />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Layout Routes protected by admin role */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/new" element={<AddProduct />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

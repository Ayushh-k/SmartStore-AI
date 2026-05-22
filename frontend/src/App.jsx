// frontend/src/App.jsx

import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import UserNavbar from "./components/UserNavbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Storefront from "./pages/Storefront.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

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
  const location = useLocation();
  const isStorefront = location.pathname === "/";
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-slate-100 transition-colors duration-300 flex flex-col">
      <UserNavbar />
      <main className={`flex-1 ${isStorefront ? "" : "pt-28"}`}>
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
      <Route path="/signup" element={<Signup />} />

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
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProtectedRoute>
              <ProductPage />
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
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

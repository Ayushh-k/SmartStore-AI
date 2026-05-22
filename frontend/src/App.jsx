// frontend/src/App.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import Login from "./pages/Login.jsx";

/*
  Simple auth guard using localStorage token.
  In a real app you'd use context or more robust state.
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("smartstoretoken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<AddProduct />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;


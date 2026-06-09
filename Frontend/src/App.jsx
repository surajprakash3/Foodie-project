import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import styles from "./App.module.css";
import LoadingSpinner from "./components/LoadingSpinner";

// Layouts (eagerly loaded — used on every page)
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";

// Auth Pages (lazy loaded)
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const AdminLogin = React.lazy(() => import("./pages/admin/AdminLogin"));

// User Pages (lazy loaded)
const Home = React.lazy(() => import("./pages/Home"));
const RestaurantMenu = React.lazy(() => import("./pages/RestaurantMenu"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Orders = React.lazy(() => import("./pages/Orders"));

// Admin Pages (lazy loaded)
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRestaurants = React.lazy(() => import("./pages/admin/AdminRestaurants"));
const AdminFoods = React.lazy(() => import("./pages/admin/AdminFoods"));
const AdminFoodsGlobal = React.lazy(() => import("./pages/admin/AdminFoodsGlobal"));
const AdminOrders = React.lazy(() => import("./pages/admin/AdminOrders"));
const DeliveryOrders = React.lazy(() => import("./pages/admin/DeliveryOrders"));

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className={styles["app-loading"]}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className={styles["app-loading"]}>Loading...</div>;
  return user && isAdmin ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <div className={styles["app-root"]}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/register" element={<><Navbar /><Register /></>} />

          {/* User Routes */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/restaurant/:id" element={<><Navbar /><RestaurantMenu /></>} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Navbar />
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Navbar />
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Navbar />
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout><AdminDashboard /></AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <AdminRoute>
                <AdminLayout><AdminRestaurants /></AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/restaurants/:id/foods"
            element={
              <AdminRoute>
                <AdminLayout><AdminFoods /></AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminLayout><AdminOrders /></AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/delivery"
            element={
              <AdminRoute>
                <AdminLayout><DeliveryOrders /></AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/foods"
            element={
              <AdminRoute>
                <AdminLayout><AdminFoodsGlobal /></AdminLayout>
              </AdminRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;

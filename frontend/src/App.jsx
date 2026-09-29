import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import {
  useAuth,
} from "./context/AuthContext.jsx";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import Dashboard from "./pages/user/Dashboard.jsx";
import PizzaCatalog from "./pages/user/PizzaCatalog.jsx";
import PizzaBuilder from "./pages/user/PizzaBuilder.jsx";
import Cart from "./pages/user/Cart.jsx";
import Checkout from "./pages/user/Checkout.jsx";
import Orders from "./pages/user/Orders.jsx";
import OrderTracking from "./pages/user/OrderTracking.jsx";
import Favorites from "./pages/user/Favorites.jsx";
import Profile from "./pages/user/Profile.jsx";
import Settings from "./pages/user/Settings.jsx";
import Offers from "./pages/user/Offers.jsx";
import Help from "./pages/user/Help.jsx";
import Search from "./pages/user/Search.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import InventoryManager from "./pages/admin/InventoryManager.jsx";
import OrdersManager from "./pages/admin/OrdersManager.jsx";

import UserProtectedRoute from "./routes/UserProtectedRoute.jsx";
import AdminProtectedRoute from "./routes/AdminProtectedRoute.jsx";

const authPaths = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

const AppShell = ({
  children,
}) => {
  const location =
    useLocation();

  const {
    isAuthenticated,
  } = useAuth();

  const isAuthPage =
    authPaths.includes(
      location.pathname
    );

  const showNavigation =
    isAuthenticated &&
    !isAuthPage;

  // PREVIOUSLY MISSING: React Router does not reset scroll position on its
  // own — navigating to a new page kept whatever scroll offset the browser
  // was at (e.g. landing at the bottom of Checkout after "Buy Now" was
  // clicked near the bottom of the pizza builder page). This fixes that
  // for every route change across the whole app.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {showNavigation && (
        <Navbar />
      )}

      <main className="app-main">
        {children}
      </main>

      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AppShell>
      <Routes>

        {/* Public Routes */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email"
          element={
            <VerifyEmail />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />

        <Route
          path="/reset-password"
          element={
            <ResetPassword />
          }
        />

        {/* User Protected Routes */}

        <Route
          element={
            <UserProtectedRoute />
          }
        >

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/pizzas"
            element={
              <PizzaCatalog />
            }
          />

          <Route
            path="/pizza-builder"
            element={
              <PizzaBuilder />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart />
            }
          />

          <Route
            path="/checkout"
            element={
              <Checkout />
            }
          />

          <Route
            path="/orders"
            element={
              <Orders />
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <OrderTracking />
            }
          />

          <Route
            path="/favorites"
            element={
              <Favorites />
            }
          />

          <Route
            path="/profile"
            element={
              <Profile />
            }
          />

          <Route
            path="/settings"
            element={
              <Settings />
            }
          />

          <Route
            path="/offers"
            element={
              <Offers />
            }
          />

          <Route
            path="/help"
            element={
              <Help />
            }
          />

          <Route
            path="/search"
            element={
              <Search />
            }
          />

        </Route>

        {/* Admin Routes */}

        <Route
          element={
            <AdminProtectedRoute />
          }
        >

          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />

          <Route
            path="/admin/inventory"
            element={
              <InventoryManager />
            }
          />

          <Route
            path="/admin/orders"
            element={
              <OrdersManager />
            }
          />

        </Route>

        {/* 404 */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </AppShell>
  );
};

export default App;
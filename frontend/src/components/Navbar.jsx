import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "../context/AuthContext.jsx";

const Navbar = () => {
  const {
    isAuthenticated,
    isAdmin,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] =
    useState(0);

  const updateCartCount = () => {
    const cart =
      JSON.parse(
        localStorage.getItem(
          "pizzaCart"
        )
      ) || [];

    const count =
      cart.reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity || 0
          ),
        0
      );

    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener(
      "cartUpdated",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const isHome =
    location.pathname ===
      "/dashboard" ||
    location.pathname ===
      "/admin";

  const handleLogout = () => {
    logout();

    localStorage.removeItem(
      "pizzaCart"
    );

    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        <div className="navbar-left">

          {!isHome && (
            <button
              type="button"
              className="nav-back-button"
              onClick={() =>
                navigate(-1)
              }
              aria-label="Go back"
              title="Go back"
            >
              ←
            </button>
          )}

          <Link
            to={
              isAdmin
                ? "/admin"
                : "/dashboard"
            }
            className="navbar-brand"
          >
            🍕 Pizza Delivery
          </Link>

        </div>

        <nav className="navbar-links">

          {!isAdmin ? (
            <>
              <Link to="/dashboard">
                Home
              </Link>

              <Link to="/pizzas">
                Pizzas
              </Link>

              <Link to="/offers">
                Offers
              </Link>

              <Link to="/search">
                Search
              </Link>

              <Link to="/orders">
                Orders
              </Link>

              <Link to="/help">
                Help
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin">
                Dashboard
              </Link>

              <Link to="/admin/inventory">
                Inventory
              </Link>

              <Link to="/admin/orders">
                Orders
              </Link>
            </>
          )}

        </nav>

        {!isAdmin && (
          <div className="navbar-actions">

            <Link
              to="/favorites"
              className="nav-action"
              title="Favorites"
            >
              ♡
              <span>Favorites</span>
            </Link>

            <Link
              to="/cart"
              className="nav-action cart-action"
              title="Cart"
            >
              🛒
              <span>Cart</span>

              {cartCount > 0 && (
                <b>
                  {cartCount}
                </b>
              )}
            </Link>

            <Link
              to="/profile"
              className="nav-action"
              title="Profile"
            >
              👤
              <span>Profile</span>
            </Link>

            <Link
              to="/settings"
              className="nav-action"
              title="Settings"
            >
              ⚙
              <span>Settings</span>
            </Link>

            <button
              type="button"
              className="logout-button"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>

          </div>
        )}

        {isAdmin && (
          <button
            type="button"
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>
        )}

      </div>
    </header>
  );
};

export default Navbar;
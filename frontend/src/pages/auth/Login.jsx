import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance.js";

import {
  useAuth,
} from "../../context/AuthContext.jsx";

const Login = () => {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const { login } =
    useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [sessionNotice, setSessionNotice] =
    useState("");

  useEffect(() => {
    if (
      searchParams.get(
        "sessionExpired"
      ) === "1"
    ) {
      setSessionNotice(
        "Your session expired or this is a new browser/tab - please log in again to continue."
      );
    }
  }, [searchParams]);

  const submit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.post(
          "/auth/login",
          {
            email:
              email.trim(),
            password,
          }
        );

      const {
        user,
        token,
      } =
        response.data.data;

      login(
        user,
        token
      );

      const returnTo =
        searchParams.get(
          "returnTo"
        );

      // Only ever follow a same-site path we generated ourselves -
      // never redirect somewhere an attacker could smuggle into the
      // URL (open-redirect protection).
      const isSafeReturnTo =
        returnTo &&
        returnTo.startsWith("/") &&
        !returnTo.startsWith("//") &&
        !returnTo.startsWith(
          "/login"
        );

      navigate(
        isSafeReturnTo
          ? returnTo
          : user.role ===
            "admin"
          ? "/admin"
          : "/dashboard"
      );
    } catch (error) {
      setError(
        error.response?.data
          ?.message ||
          "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-modern">

      <div className="auth-visual">

        <div>
          <span>
            FRESH • HOT • FAST
          </span>

          <h1>
            Your next
            <br />
            pizza is waiting 🍕
          </h1>

          <p>
            Login and continue ordering
            your favourite pizzas.
          </p>
        </div>

      </div>

      <div className="auth-form-panel">

        <Link
          to="/login"
          className="auth-brand"
        >
          🍕 Pizza Delivery
        </Link>

        <div className="auth-form-card">

          <span className="section-label">
            WELCOME BACK
          </span>

          <h1>
            Sign in
          </h1>

          <p className="auth-subtitle">
            Login to continue your
            pizza journey.
          </p>

          {sessionNotice && (
            <div className="success-message session-notice">
              {sessionNotice}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={submit}>

            <label className="modern-label">
              Email Address

              <input
                type="email"
                value={email}
                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target
                      .value
                  )
                }
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="modern-label">
              Password

              <div className="password-wrapper">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>
            </label>

            <div className="auth-row">

              <span>
                Secure login
              </span>

              <Link to="/forgot-password">
                Forgot password?
              </Link>

            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

          </form>

          <p className="auth-switch">
            New here?

            <Link to="/register">
              Create an account
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;
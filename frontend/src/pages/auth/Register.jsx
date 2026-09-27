import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance.js";

const Register = () => {
  const navigate =
    useNavigate();

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handlePhone =
    (event) => {
      const value =
        event.target.value.replace(
          /\D/g,
          ""
        );

      if (
        value.length <= 10
      ) {
        updateField(
          "phone",
          value
        );
      }
    };

  const submit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (
      form.phone &&
      form.phone.length !==
        10
    ) {
      setError(
        "Mobile number must contain exactly 10 digits."
      );

      return;
    }

    if (
      form.password.length <
      8
    ) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);

      await axiosInstance.post(
        "/auth/register",
        {
          name:
            form.name.trim(),

          email:
            form.email
              .trim(),

          phone:
            form.phone,

          password:
            form.password,
        }
      );

      navigate(
        "/login",
        {
          state: {
            message:
              "Account created successfully. Please login.",
          },
        }
      );
    } catch (error) {
      setError(
        error.response?.data
          ?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-modern">

      <div className="auth-visual register-visual">

        <div>
          <span>
            JOIN THE PIZZA CLUB
          </span>

          <h1>
            Fresh pizza,
            <br />
            made your way 🍕
          </h1>

          <p>
            Create your account and
            start ordering.
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
            CREATE ACCOUNT
          </span>

          <h1>
            Get started
          </h1>

          <p className="auth-subtitle">
            Create an account to save
            orders, favourites and addresses.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={submit}>

            <label className="modern-label">
              Full Name

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Your name"
                required
              />
            </label>

            <label className="modern-label">
              Email Address

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="modern-label">
              Mobile Number

              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={
                  handlePhone
                }
                placeholder="10 digit mobile number"
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
                  value={
                    form.password
                  }
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value
                    )
                  }
                  placeholder="Minimum 8 characters"
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

            <label className="modern-label">
              Confirm Password

              <div className="password-wrapper">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    form.confirmPassword
                  }
                  onChange={(event) =>
                    updateField(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  placeholder="Re-enter password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>
            </label>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
};

export default Register;
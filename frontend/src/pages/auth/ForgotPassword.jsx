import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.js";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [devResetUrl, setDevResetUrl] =
    useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setDevResetUrl("");

    try {
      setLoading(true);
      const response = await axiosInstance.post("/auth/forgot-password", {
        email: email.trim(),
      });
      setMessage(response.data.message);

      if (response.data.data?.devResetUrl) {
        setDevResetUrl(response.data.data.devResetUrl);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-modern">
      <div className="auth-visual">
        <div>
          <span>FRESH • HOT • FAST</span>
          <h1>
            Forgot your
            <br />
            password? 🔐
          </h1>
          <p>
            No worries — we'll email you a secure link to get back into your
            account.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <Link to="/login" className="auth-brand">
          🍕 Pizza Delivery
        </Link>

        <div className="auth-form-card">
          <span className="section-label">ACCOUNT RECOVERY</span>
          <h1>Forgot Password?</h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you a password reset link.
          </p>

          {message && (
            <div className="success-message">{message}</div>
          )}

          {devResetUrl && (
            <p className="otp-dev-hint">
              DEV MODE: no SMTP is configured, so here's your reset
              link directly —{" "}
              <a href={devResetUrl}>{devResetUrl}</a>
            </p>
          )}

          {error && <div className="error-message">{error}</div>}

          {!message && (
            <form onSubmit={submit}>
              <label className="modern-label">
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="auth-row">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

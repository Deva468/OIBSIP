import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.js";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `/auth/reset-password/${token}`,
        { password }
      );
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "This reset link is invalid or has expired."
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
            Almost there —
            <br />
            new password 🔑
          </h1>
          <p>Choose a strong new password to secure your account.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <Link to="/login" className="auth-brand">
          🍕 Pizza Delivery
        </Link>

        <div className="auth-form-card">
          <span className="section-label">ACCOUNT RECOVERY</span>
          <h1>Reset Password</h1>
          <p className="auth-subtitle">
            Create a new password for your account.
          </p>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {!message && (
            <form onSubmit={submit}>
              <label className="modern-label">
                New Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </label>

              <label className="modern-label">
                Confirm Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </label>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Resetting…" : "Reset Password"}
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

export default ResetPassword;

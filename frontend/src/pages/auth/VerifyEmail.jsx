import { Link } from "react-router-dom";

function VerifyEmail() {
  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          📧
        </div>

        <h1>Verify Your Email</h1>

        <p className="auth-subtitle">
          We have sent a verification link to your email address.
        </p>

        <button className="auth-button">
          Resend Verification Email
        </button>

        <p className="auth-footer">
          <Link to="/login">
            Back to Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default VerifyEmail;
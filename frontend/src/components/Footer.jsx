import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-grid">

        <div className="footer-brand">
          <h2>
            🍕 Pizza Delivery
          </h2>

          <p>
            Freshly made pizza,
            delivered with care.
          </p>

          <div className="footer-socials">
            <a href="/">
              Instagram
            </a>

            <a href="/">
              Facebook
            </a>

            <a href="/">
              LinkedIn
            </a>
          </div>
        </div>

        <div>
          <h3>
            Explore
          </h3>

          <Link to="/pizzas">
            Pizzas
          </Link>

          <Link to="/offers">
            Offers
          </Link>

          <Link to="/orders">
            Orders
          </Link>

          <Link to="/help">
            Help Center
          </Link>
        </div>

        <div>
          <h3>
            Account
          </h3>

          <Link to="/profile">
            Profile
          </Link>

          <Link to="/settings">
            Settings
          </Link>

          <Link to="/cart">
            Cart
          </Link>
        </div>

        <div>
          <h3>
            Contact
          </h3>

          <p>
            Chennai, Tamil Nadu
          </p>

          <p>
            support@pizzadelivery.com
          </p>

          <p>
            +91 90000 00000
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <span>
          © 2026 Pizza Delivery System
        </span>

        <span>
          Fresh food. Simple ordering.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
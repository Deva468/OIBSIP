import { Link } from "react-router-dom";

import StatusBadge from "./StatusBadge";

function OrderCard({ order }) {
  return (
    <div className="order-card">
      <div>
        <h3>
          Order #{order?._id?.slice(-6)}
        </h3>

        <p>
          Total: ₹{order?.totalAmount ?? 0}
        </p>

        <StatusBadge
          status={order?.orderStatus}
        />
      </div>

      {order?._id && (
        <Link
          to={`/orders/${order._id}`}
          className="auth-button"
        >
          Track Order
        </Link>
      )}
    </div>
  );
}

export default OrderCard;
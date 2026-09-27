import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.js";
import useSocket from "../../hooks/useSocket.js";

const STATUS_STEPS = [
  { key: "PLACED", label: "Order Placed", icon: "🧾" },
  { key: "CONFIRMED", label: "Confirmed", icon: "✅" },
  { key: "PREPARING", label: "In the Kitchen", icon: "👨‍🍳" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "🛵" },
  { key: "DELIVERED", label: "Delivered", icon: "🎉" },
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

function OrderTracking() {
  const { orderId } = useParams();
  const socket = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${orderId}`);
        setOrder(response.data.data.order);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load this order"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  // Join the order's Socket.IO room so any status change the admin makes
  // is reflected here immediately, with no page refresh.
  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit("join-order-room", orderId);

    const handleStatusUpdate = (payload) => {
      if (payload.orderId !== orderId) return;
      setOrder((prev) =>
        prev ? { ...prev, orderStatus: payload.orderStatus } : prev
      );
    };

    socket.on("order:status-updated", handleStatusUpdate);

    return () => {
      socket.emit("leave-order-room", orderId);
      socket.off("order:status-updated", handleStatusUpdate);
    };
  }, [socket, orderId]);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Track Your Order 🚴</h1>
        <div className="empty-state">Loading order…</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container">
        <h1>Track Your Order 🚴</h1>
        <div className="error-message">{error || "Order not found"}</div>
        <Link to="/orders" className="secondary-button">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === "CANCELLED";
  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.orderStatus
  );

  return (
    <div className="page-container order-tracking-page">
      <h1>Track Your Order 🚴</h1>
      <p className="page-description">
        Order #{order._id.slice(-6).toUpperCase()} — updates live, no need to
        refresh.
      </p>

      {isCancelled ? (
        <div className="error-message">
          This order was cancelled. If you think this is a mistake, contact
          support from the Help page.
        </div>
      ) : (
        <div className="tracking-stepper">
          {STATUS_STEPS.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.key}
                className={`tracking-step ${isDone ? "tracking-step-done" : ""} ${
                  isCurrent ? "tracking-step-current" : ""
                }`}
              >
                <div className="tracking-step-icon">{step.icon}</div>
                <div className="tracking-step-label">{step.label}</div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className="tracking-step-line" />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="tracking-order-summary">
        <h2>Order Summary</h2>
        <ul className="tracking-item-list">
          {order.items?.map((item, idx) => (
            <li key={idx}>
              <span>
                {item.pizzaName} × {item.quantity}
              </span>
              <span>{formatCurrency(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="tracking-total-row">
          <strong>Total</strong>
          <strong>{formatCurrency(order.totalAmount)}</strong>
        </div>
      </div>

      <div className="tracking-address">
        <h2>Delivering To</h2>
        <p>
          {order.deliveryAddress?.fullName} — {order.deliveryAddress?.phone}
          <br />
          {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city},{" "}
          {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
        </p>
      </div>

      <Link to="/orders" className="secondary-button">
        Back to All Orders
      </Link>
    </div>
  );
}

export default OrderTracking;

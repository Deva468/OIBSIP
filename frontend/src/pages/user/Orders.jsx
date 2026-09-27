import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { openRazorpayCheckout } from "../../utils/razorpay.js";
import useSocket from "../../hooks/useSocket.js";

const Orders = () => {
  const { user } = useAuth();

  const [searchParams] =
    useSearchParams();

  const justPlacedId =
    searchParams.get("justPlaced");

  const [retryingId, setRetryingId] =
    useState("");

  const [retryError, setRetryError] =
    useState("");

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadOrders =
      async () => {
        try {
          const response =
            await axiosInstance.get(
              "/orders"
            );

          setOrders(
            response.data.data.orders ||
              []
          );
        } catch (error) {
          setError(
            error.response?.data
              ?.message ||
              "Unable to load orders"
          );
        } finally {
          setLoading(false);
        }
      };

    loadOrders();
  }, []);

  // Real-time: join this user's personal Socket.IO room once we know who
  // they are, and patch the matching order's status in place whenever the
  // admin changes it — no refresh needed.
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.emit("join-user-room", user.id);

    const handleStatusUpdate = (payload) => {
      setOrders((previous) =>
        previous.map((order) =>
          order._id === payload.orderId
            ? { ...order, orderStatus: payload.orderStatus }
            : order
        )
      );
    };

    socket.on("order:status-updated", handleStatusUpdate);

    return () => {
      socket.emit("leave-user-room", user.id);
      socket.off("order:status-updated", handleStatusUpdate);
    };
  }, [socket, user?.id]);

  const retryPayment = (order) => {
    setRetryError("");
    setRetryingId(order._id);

    openRazorpayCheckout(order, {
      prefill: {
        name:
          order.deliveryAddress
            ?.fullName ||
          user?.name ||
          "",
        contact:
          order.deliveryAddress
            ?.phone ||
          user?.phone ||
          "",
        email: user?.email || "",
      },
      onSuccess: (updatedOrder) => {
        setOrders((previous) =>
          previous.map((item) =>
            item._id ===
            updatedOrder._id
              ? updatedOrder
              : item
          )
        );

        setRetryingId("");
      },
      onError: (message) => {
        setRetryError(message);
        setRetryingId("");
      },
      onDismiss: (message) => {
        setRetryError(message);
        setRetryingId("");
      },
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="orders-page">

      <div className="orders-header">
        <div>
          <span className="section-label">
            ORDER HISTORY
          </span>

          <h1>
            My Orders 📦
          </h1>

          <p>
            View and track your pizza orders.
          </p>
        </div>
      </div>

      {justPlacedId && (
        <div className="order-success-banner">
          🎉 Your order was placed successfully! Order #
          {justPlacedId
            .toString()
            .slice(-6)}{" "}
          is now being prepared.
        </div>
      )}

      {retryError && (
        <div className="error-message">
          {retryError}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-orders-icon">
            🍕
          </div>

          <h2>
            No orders yet
          </h2>

          <p>
            Your next pizza is waiting.
          </p>

          <Link
            to="/pizzas"
            className="primary-button"
          >
            Start Ordering
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(
            (order) => (
              <article
                className="order-card"
                key={
                  order._id
                }
              >

                <div className="order-card-main">

                  <div className="order-title-row">

                    <div>
                      <span className="order-number">
                        ORDER #
                        {order._id.slice(
                          -6
                        )}
                      </span>

                      <h2>
                        {order.items?.length ||
                          0}{" "}
                        item(s)
                      </h2>
                    </div>

                    <span className="status-badge">
                      {order.orderStatus ||
                        "PLACED"}
                    </span>

                  </div>

                  <p className="order-date">
                    {order.createdAt
                      ? new Date(
                          order.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )
                      : ""}
                  </p>

                </div>

                <div className="order-card-right">

                  <strong>
                    ₹
                    {order.totalAmount ||
                      0}
                  </strong>

                  <span>
                    {order.paymentStatus ||
                      "PENDING"}
                  </span>

                  {order.paymentMethod ===
                    "RAZORPAY" &&
                    order.paymentStatus !==
                      "PAID" && (
                      <button
                        type="button"
                        className="secondary-button retry-payment-button"
                        disabled={
                          retryingId ===
                          order._id
                        }
                        onClick={() =>
                          retryPayment(
                            order
                          )
                        }
                      >
                        {retryingId ===
                        order._id
                          ? "Opening..."
                          : "Retry Payment"}
                      </button>
                    )}

                  <Link
                    to={`/orders/${order._id}`}
                    className="primary-button"
                  >
                    Track Order
                  </Link>

                </div>

              </article>
            )
          )}
        </div>
      )}

    </div>
  );
};

export default Orders;
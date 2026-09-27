import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.js";

const STATUS_FLOW = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STATUS_LABELS = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/orders");
      setOrders(response.data.data.orders || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      const response = await axiosInstance.patch(
        `/admin/orders/${orderId}/status`,
        { status }
      );
      const updatedOrder = response.data.data.order;

      // Update locally right away — the customer's own page updates via
      // Socket.IO on the backend's emit, this just keeps the admin table
      // in sync without a full refetch.
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updatedOrder : o))
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const nextStatusFor = (currentStatus) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  const visibleOrders =
    filter === "ALL"
      ? orders
      : orders.filter((o) => o.orderStatus === filter);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Orders Management 🛒</h1>
        <div className="empty-state">Loading orders…</div>
      </div>
    );
  }

  return (
    <div className="page-container orders-manager">
      <h1>Orders Management 🛒</h1>
      <p className="page-description">
        Update order status — customers see the change in real time.
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="order-filter-bar">
        {["ALL", ...STATUS_FLOW, "CANCELLED"].map((s) => (
          <button
            key={s}
            type="button"
            className={`filter-chip ${filter === s ? "filter-chip-active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s === "ALL" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  No orders in this filter.
                </td>
              </tr>
            )}
            {visibleOrders.map((order) => {
              const next = nextStatusFor(order.orderStatus);
              const isCancelled = order.orderStatus === "CANCELLED";
              const isDelivered = order.orderStatus === "DELIVERED";

              return (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>
                    {order.user?.name || "—"}
                    <br />
                    <small>{order.user?.email}</small>
                  </td>
                  <td>{order.items?.length || 0} item(s)</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span
                      className={`status-badge status-order-${order.orderStatus?.toLowerCase()}`}
                    >
                      {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <div className="table-action-group">
                      {!isCancelled && !isDelivered && next && (
                        <button
                          type="button"
                          className="primary-button small-button"
                          disabled={updatingId === order._id}
                          onClick={() => changeStatus(order._id, next)}
                        >
                          {updatingId === order._id
                            ? "Updating…"
                            : `Mark ${STATUS_LABELS[next]}`}
                        </button>
                      )}
                      {!isCancelled && !isDelivered && (
                        <button
                          type="button"
                          className="secondary-button small-button danger-button"
                          disabled={updatingId === order._id}
                          onClick={() => changeStatus(order._id, "CANCELLED")}
                        >
                          Cancel
                        </button>
                      )}
                      {(isCancelled || isDelivered) && (
                        <span className="table-final-note">
                          {isCancelled ? "Order cancelled" : "Order complete"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersManager;

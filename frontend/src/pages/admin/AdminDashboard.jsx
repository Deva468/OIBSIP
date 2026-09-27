import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axiosInstance from "../../api/axiosInstance.js";

const STATUS_OPTIONS = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_LABELS = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const AdminDashboard = () => {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axiosInstance.get(
          "/admin/orders"
        );

      setOrders(
        response.data.data.orders ||
          []
      );
    } catch (fetchError) {
      setError(
        fetchError.response?.data
          ?.message ||
          "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (
    orderId,
    status
  ) => {
    setUpdatingId(orderId);
    setError("");

    try {
      const response =
        await axiosInstance.patch(
          `/admin/orders/${orderId}/status`,
          { status }
        );

      const updatedOrder =
        response.data.data.order;

      setOrders((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? updatedOrder
            : order
        )
      );
    } catch (updateError) {
      setError(
        updateError.response?.data
          ?.message ||
          "Could not update this order"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const cancelOrder = (order) => {
    const confirmed =
      window.confirm(
        `Cancel order #${order._id
          .toString()
          .slice(-6)
          .toUpperCase()} for ${
          order.user?.name ||
          "this customer"
        }? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    changeStatus(
      order._id,
      "CANCELLED"
    );
  };

  const stats = useMemo(() => {
    const totalOrders =
      orders.length;

    const revenue = orders
      .filter(
        (order) =>
          order.paymentStatus ===
          "PAID"
      )
      .reduce(
        (total, order) =>
          total +
          (order.totalAmount ||
            0),
        0
      );

    const pending = orders.filter(
      (order) =>
        !["DELIVERED", "CANCELLED"].includes(
          order.orderStatus
        )
    ).length;

    const cancelled = orders.filter(
      (order) =>
        order.orderStatus ===
        "CANCELLED"
    ).length;

    return {
      totalOrders,
      revenue,
      pending,
      cancelled,
    };
  }, [orders]);

  const visibleOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter(
          (order) =>
            order.orderStatus ===
            statusFilter
        );

  if (loading) {
    return (
      <div className="loading-container">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="page-container admin-dashboard-page">
      <h1>Admin Dashboard 👨‍💼</h1>

      <p>
        Manage customer orders in real
        time - update status or cancel
        an order.
      </p>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>Total Orders</span>
          <strong>
            {stats.totalOrders}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Revenue (Paid)</span>
          <strong>
            ₹{stats.revenue}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>In Progress</span>
          <strong>
            {stats.pending}
          </strong>
        </div>

        <div className="admin-stat-card admin-stat-card-danger">
          <span>Cancelled</span>
          <strong>
            {stats.cancelled}
          </strong>
        </div>
      </div>

      <div className="admin-orders-header">
        <h2>All Orders</h2>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="ALL">
            All statuses
          </option>

          {STATUS_OPTIONS.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {
                  STATUS_LABELS[
                    status
                  ]
                }
              </option>
            )
          )}
        </select>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="empty-orders">
          <p>No orders match this filter.</p>
        </div>
      ) : (
        <div className="admin-orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {visibleOrders.map(
                (order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="admin-order-id">
                        #
                        {order._id
                          .toString()
                          .slice(-6)
                          .toUpperCase()}
                      </span>

                      <small>
                        {new Date(
                          order.createdAt
                        ).toLocaleString()}
                      </small>
                    </td>

                    <td>
                      {order.user
                        ?.name ||
                        "Unknown"}

                      <br />

                      <small>
                        {order.user
                          ?.email ||
                          ""}
                      </small>
                    </td>

                    <td>
                      {order.items
                        ?.length ||
                        0}{" "}
                      item(s)
                    </td>

                    <td>
                      ₹
                      {
                        order.totalAmount
                      }
                    </td>

                    <td>
                      <span
                        className={`admin-payment-badge admin-payment-${(
                          order.paymentStatus ||
                          "pending"
                        ).toLowerCase()}`}
                      >
                        {order.paymentStatus ||
                          "PENDING"}
                      </span>
                    </td>

                    <td>
                      <select
                        value={
                          order.orderStatus
                        }
                        disabled={
                          updatingId ===
                            order._id ||
                          order.orderStatus ===
                            "CANCELLED"
                        }
                        onChange={(
                          event
                        ) =>
                          changeStatus(
                            order._id,
                            event
                              .target
                              .value
                          )
                        }
                        className={`admin-status-select admin-status-${order.orderStatus?.toLowerCase()}`}
                      >
                        {STATUS_OPTIONS.map(
                          (
                            status
                          ) => (
                            <option
                              key={
                                status
                              }
                              value={
                                status
                              }
                            >
                              {
                                STATUS_LABELS[
                                  status
                                ]
                              }
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-cancel-button"
                        disabled={
                          order.orderStatus ===
                            "CANCELLED" ||
                          order.orderStatus ===
                            "DELIVERED" ||
                          updatingId ===
                            order._id
                        }
                        onClick={() =>
                          cancelOrder(
                            order
                          )
                        }
                      >
                        {updatingId ===
                        order._id
                          ? "..."
                          : "Cancel"}
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance.js";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

function InventoryManager() {
  const [pizzas, setPizzas] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalStockValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState(null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/inventory/pizzas");
      setPizzas(response.data.data.pizzas || []);
      setStats(
        response.data.data.stats || {
          totalProducts: 0,
          lowStock: 0,
          outOfStock: 0,
          totalStockValue: 0,
        }
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const getStatus = (pizza) => {
    if (pizza.stock === 0) return { label: "Out of Stock", cls: "status-out" };
    if (pizza.stock <= pizza.lowStockThreshold)
      return { label: "Low Stock", cls: "status-low" };
    return { label: "In Stock", cls: "status-in" };
  };

  const startEdit = (pizza) => {
    setEditingId(pizza._id);
    setEditValue(String(pizza.stock));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (pizzaId) => {
    const stockValue = Number(editValue);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      setError("Enter a valid, non-negative stock number");
      return;
    }

    try {
      setSavingId(pizzaId);
      const response = await axiosInstance.patch(
        `/admin/inventory/pizzas/${pizzaId}`,
        { stock: stockValue }
      );
      const updatedPizza = response.data.data.pizza;

      setPizzas((prev) =>
        prev.map((p) => (p._id === pizzaId ? updatedPizza : p))
      );

      // Recompute stats locally so the cards update instantly without a
      // full refetch.
      setStats((prev) => {
        const next = { ...prev };
        return next;
      });
      await loadInventory();

      cancelEdit();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update stock"
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Inventory Management 📦</h1>
        <div className="empty-state">Loading inventory…</div>
      </div>
    );
  }

  return (
    <div className="page-container inventory-manager">
      <h1>Inventory Management 📦</h1>
      <p className="page-description">
        Track and update stock levels for every pizza on the menu.
      </p>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{stats.totalProducts}</span>
        </div>
        <div className="stat-card stat-card-warning">
          <span className="stat-label">Low Stock</span>
          <span className="stat-value">{stats.lowStock}</span>
        </div>
        <div className="stat-card stat-card-danger">
          <span className="stat-label">Out of Stock</span>
          <span className="stat-value">{stats.outOfStock}</span>
        </div>
        <div className="stat-card stat-card-success">
          <span className="stat-label">Total Stock Value</span>
          <span className="stat-value">
            {formatCurrency(stats.totalStockValue)}
          </span>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pizza Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pizzas.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  No pizzas found. Add pizzas from the catalog setup first.
                </td>
              </tr>
            )}
            {pizzas.map((pizza) => {
              const status = getStatus(pizza);
              const isEditing = editingId === pizza._id;

              return (
                <tr key={pizza._id}>
                  <td>{pizza.name}</td>
                  <td>
                    <span
                      className={
                        pizza.category === "Veg"
                          ? "veg-badge"
                          : "nonveg-badge"
                      }
                    >
                      {pizza.category}
                    </span>
                  </td>
                  <td>{formatCurrency(pizza.price)}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="stock-input"
                        autoFocus
                      />
                    ) : (
                      pizza.stock
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="table-action-group">
                        <button
                          type="button"
                          className="primary-button small-button"
                          disabled={savingId === pizza._id}
                          onClick={() => saveEdit(pizza._id)}
                        >
                          {savingId === pizza._id ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          className="secondary-button small-button"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="secondary-button small-button"
                        onClick={() => startEdit(pizza)}
                      >
                        Edit
                      </button>
                    )}
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

export default InventoryManager;

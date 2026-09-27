import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import logActivity, {
  ACTIVITY_ACTIONS,
} from "../../utils/activityLogger.js";

const FREE_DELIVERY_THRESHOLD = 500;

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] =
    useState([]);

  useEffect(() => {
    const cart =
      JSON.parse(
        localStorage.getItem(
          "pizzaCart"
        )
      ) || [];

    setCartItems(cart);
  }, []);

  const updateCart = (updatedCart) => {
    setCartItems(updatedCart);

    localStorage.setItem(
      "pizzaCart",
      JSON.stringify(
        updatedCart
      )
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const increaseQuantity = (
    index
  ) => {
    const updated = [
      ...cartItems,
    ];

    updated[index].quantity += 1;

    updateCart(updated);
  };

  const decreaseQuantity = (
    index
  ) => {
    const updated = [
      ...cartItems,
    ];

    if (
      updated[index].quantity > 1
    ) {
      updated[index].quantity -= 1;
    } else {
      updated.splice(index, 1);
    }

    updateCart(updated);
  };

  const removeItem = (index) => {
    const removedItem =
      cartItems[index];

    const updated = [
      ...cartItems,
    ];

    updated.splice(index, 1);

    updateCart(updated);

    if (removedItem) {
      logActivity(
        ACTIVITY_ACTIONS.REMOVE_FROM_CART,
        {
          entityType: "Pizza",
          entityId: removedItem.id,
          metadata: {
            name: removedItem.name,
          },
        }
      );
    }
  };

  const subtotal =
    cartItems.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );

  const deliveryFee =
    subtotal === 0
      ? 0
      : subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : 40;

  const amountToFreeDelivery =
    Math.max(
      0,
      FREE_DELIVERY_THRESHOLD -
        subtotal
    );

  const freeDeliveryProgress =
    Math.min(
      100,
      Math.round(
        (subtotal /
          FREE_DELIVERY_THRESHOLD) *
          100
      )
    );

  const total =
    subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h1>
            Your Cart 🛒
          </h1>

          <p>
            Your cart is empty.
            Add some delicious pizzas!
          </p>

          <Link
            to="/pizzas"
            className="primary-button"
          >
            Browse Pizzas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <h1>
            Your Cart 🛒
          </h1>

          <p>
            Review your items before checkout.
          </p>
        </div>

        <Link
          to="/pizzas"
          className="secondary-button"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map(
            (item, index) => (
              <div
                className="cart-item"
                key={item.id}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-image"
                />

                <div className="cart-item-info">
                  <h2>
                    {item.name}
                  </h2>

                  <p>
                    ₹{item.price} each
                  </p>

                  {item.customizations && (
                    <p className="cart-customization">
                      {item.customizations}
                    </p>
                  )}

                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button
                        type="button"
                        className="qty-btn qty-minus"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          decreaseQuantity(
                            index
                          )
                        }
                      >
                        −
                      </button>

                      <span className="qty-value">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        className="qty-btn qty-plus"
                        aria-label="Increase quantity"
                        onClick={() =>
                          increaseQuantity(
                            index
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>

                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-price">
                  ₹
                  {item.price *
                    item.quantity}
                </div>
              </div>
            )
          )}
        </div>

        <div className="cart-summary">
          <h2>
            Order Summary
          </h2>

          {deliveryFee > 0 ? (
            <div className="free-delivery-nudge">
              <p>
                Add{" "}
                <strong>
                  ₹{amountToFreeDelivery}
                </strong>{" "}
                more to unlock{" "}
                <strong>
                  FREE delivery
                </strong>
                !
              </p>

              <div className="free-delivery-bar">
                <div
                  className="free-delivery-bar-fill"
                  style={{
                    width: `${freeDeliveryProgress}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="free-delivery-nudge free-delivery-unlocked">
              🎉 You unlocked FREE delivery!
            </div>
          )}

          <div className="summary-row">
            <span>
              Subtotal
            </span>

            <span>
              ₹{subtotal}
            </span>
          </div>

          <div className="summary-row">
            <span>
              Delivery
            </span>

            <span>
              {deliveryFee === 0
                ? "FREE"
                : `₹${deliveryFee}`}
            </span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>
              Total
            </span>

            <strong>
              ₹{total}
            </strong>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={() =>
              navigate(
                "/checkout"
              )
            }
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
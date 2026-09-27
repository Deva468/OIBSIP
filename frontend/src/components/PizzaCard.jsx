import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import axiosInstance from "../api/axiosInstance.js";
import logActivity, {
  ACTIVITY_ACTIONS,
} from "../utils/activityLogger.js";

const FALLBACK_IMAGE_VEG =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80";

const FALLBACK_IMAGE_NONVEG =
  "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80";

const PizzaCard = ({
  pizza,
}) => {
  const navigate =
    useNavigate();

  const [favorite, setFavorite] =
    useState(false);

  const [favoriteBusy, setFavoriteBusy] =
    useState(false);

  useEffect(() => {
    // Optimistic local cache so the heart icon renders instantly
    // (no flash of "not favourite") while we still treat MongoDB
    // as the real source of truth via the toggle call below.
    const favorites =
      JSON.parse(
        localStorage.getItem(
          "pizzaFavorites"
        )
      ) || [];

    setFavorite(
      favorites.includes(
        pizza._id
      )
    );
  }, [pizza._id]);

  const syncLocalFavoriteCache = (
    isFavorite
  ) => {
    const favorites =
      JSON.parse(
        localStorage.getItem(
          "pizzaFavorites"
        )
      ) || [];

    const updated = isFavorite
      ? [
          ...favorites.filter(
            (id) => id !== pizza._id
          ),
          pizza._id,
        ]
      : favorites.filter(
          (id) => id !== pizza._id
        );

    localStorage.setItem(
      "pizzaFavorites",
      JSON.stringify(updated)
    );
  };

  const toggleFavorite = async () => {
    if (favoriteBusy) {
      return;
    }

    const nextFavorite = !favorite;

    // Optimistic UI update.
    setFavorite(nextFavorite);
    syncLocalFavoriteCache(nextFavorite);
    setFavoriteBusy(true);

    try {
      // The backend both flips User.favorites in MongoDB AND writes
      // the matching "add_favorite" / "remove_favorite" row to the
      // UserActivity collection, so a single call keeps everything
      // in sync.
      const response = await axiosInstance.post(
        `/pizzas/${pizza._id}/favorite`
      );

      const confirmedFavorite =
        response?.data?.data?.isFavorite;

      if (typeof confirmedFavorite === "boolean") {
        setFavorite(confirmedFavorite);
        syncLocalFavoriteCache(confirmedFavorite);
      }
    } catch (error) {
      // Roll back the optimistic update if the request failed.
      setFavorite(!nextFavorite);
      syncLocalFavoriteCache(!nextFavorite);

      console.error(
        "Could not update favourite:",
        error?.response?.data?.message ||
          error.message
      );
    } finally {
      setFavoriteBusy(false);
    }
  };

  const createCartItem = () => ({
    id: pizza._id,
    pizzaId: pizza._id,
    name: pizza.name,
    description:
      pizza.description,
    image: pizza.image,
    price: pizza.price,
    quantity: 1,
    category:
      pizza.category,
    base:
      pizza.base?._id,
    sauce:
      pizza.sauce?._id,
    cheese:
      pizza.cheese?._id,
    vegetables:
      pizza.vegetables?.map(
        (item) => item._id
      ) || [],
  });

  const addToCart = () => {
    const cart =
      JSON.parse(
        localStorage.getItem(
          "pizzaCart"
        )
      ) || [];

    const existingIndex =
      cart.findIndex(
        (item) =>
          item.id ===
          pizza._id
      );

    if (
      existingIndex !== -1
    ) {
      cart[
        existingIndex
      ].quantity += 1;
    } else {
      cart.push(
        createCartItem()
      );
    }

    localStorage.setItem(
      "pizzaCart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    // Cart itself stays client-side (localStorage), but every add
    // is still recorded in MongoDB so "add to cart" shows up in the
    // user's activity history.
    logActivity(
      ACTIVITY_ACTIONS.ADD_TO_CART,
      {
        entityType: "Pizza",
        entityId: pizza._id,
        metadata: {
          name: pizza.name,
          price: pizza.price,
        },
      }
    );
  };

  const buyNow = () => {
    localStorage.setItem(
      "pizzaCart",
      JSON.stringify([
        createCartItem(),
      ])
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    logActivity(
      ACTIVITY_ACTIONS.BUY_NOW,
      {
        entityType: "Pizza",
        entityId: pizza._id,
        metadata: {
          name: pizza.name,
          price: pizza.price,
        },
      }
    );

    navigate("/checkout");
  };

  return (
    <article className="pizza-card">
      <div className="pizza-image-wrapper">
        <Link
          to={`/pizza-builder?template=${pizza._id}`}
          className="pizza-image-link"
          aria-label={`View ${pizza.name}`}
        >
          <img
            src={pizza.image}
            alt={pizza.name}
            className="pizza-card-image"
            onError={(
              event
            ) => {
              event.currentTarget.src =
                pizza.category === "Non-Veg"
                  ? FALLBACK_IMAGE_NONVEG
                  : FALLBACK_IMAGE_VEG;

              event.currentTarget.onerror =
                null;
            }}
          />
        </Link>

        <span
          className={
            pizza.category ===
            "Veg"
              ? "veg-badge"
              : "nonveg-badge"
          }
        >
          {pizza.category ===
          "Veg"
            ? "🥬 Veg"
            : "🍗 Non-Veg"}
        </span>

        <button
          type="button"
          className="favorite-button"
          onClick={
            toggleFavorite
          }
          title="Favourite"
        >
          {favorite
            ? "♥"
            : "♡"}
        </button>

        {pizza.discountPercent >
          0 && (
          <span className="discount-badge">
            {pizza.discountPercent}%
            OFF
          </span>
        )}
      </div>

      <div className="pizza-card-content">
        <div className="pizza-card-title-row">
          <h2>
            {pizza.name}
          </h2>

          {pizza.isPopular && (
            <span className="popular-badge">
              ⭐ Popular
            </span>
          )}
        </div>

        <p className="pizza-description">
          {pizza.description}
        </p>

        <div className="pizza-price-row">
          <strong>
            ₹{pizza.price}
          </strong>

          {pizza.originalPrice >
            pizza.price && (
            <del>
              ₹
              {
                pizza.originalPrice
              }
            </del>
          )}
        </div>

        <div className="pizza-actions">
          <button
            type="button"
            className="add-cart-button"
            onClick={
              addToCart
            }
          >
            Add to Cart
          </button>

          <button
            type="button"
            className="buy-now-button"
            onClick={
              buyNow
            }
          >
            Buy Now
          </button>

          <Link
            to={`/pizza-builder?template=${pizza._id}`}
            className="customize-button"
          >
            Customize
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PizzaCard;
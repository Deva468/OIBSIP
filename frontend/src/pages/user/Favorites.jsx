import {
  useEffect,
  useState,
} from "react";

import axiosInstance from "../../api/axiosInstance.js";
import PizzaCard from "../../components/PizzaCard.jsx";

const Favorites = () => {
  const [pizzas, setPizzas] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadFavorites =
      async () => {
        try {
          setLoading(true);
          setError("");

          // Favourites now live in MongoDB (User.favorites), not
          // localStorage, so every device/browser the user logs
          // into shows the same saved pizzas.
          const response =
            await axiosInstance.get(
              "/pizzas/favorites/mine"
            );

          setPizzas(
            response.data.data.pizzas ||
              []
          );
        } catch (fetchError) {
          setError(
            fetchError.response?.data
              ?.message ||
              "Unable to load your favourites right now."
          );
        } finally {
          setLoading(false);
        }
      };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        Loading favorites...
      </div>
    );
  }

  return (
    <div className="favorites-page">

      <span className="section-label">
        YOUR PICKS
      </span>

      <h1>
        Favourite Pizzas ❤️
      </h1>

      <p className="page-description">
        Your saved pizzas are kept here.
      </p>

      {error && (
        <div className="empty-message">
          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>
        </div>
      )}

      {!error && pizzas.length === 0 ? (
        <div className="empty-message">
          <h2>
            No favourites yet
          </h2>

          <p>
            Tap ♡ on any pizza to save it here.
          </p>
        </div>
      ) : (
        !error && (
          <div className="pizza-grid">
            {pizzas.map(
              (pizza) => (
                <PizzaCard
                  key={
                    pizza._id
                  }
                  pizza={pizza}
                />
              )
            )}
          </div>
        )
      )}

    </div>
  );
};

export default Favorites;

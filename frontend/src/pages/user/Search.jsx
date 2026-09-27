import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import logActivity, {
  ACTIVITY_ACTIONS,
} from "../../utils/activityLogger.js";

const Search = () => {
  const navigate =
    useNavigate();

  const [query, setQuery] =
    useState("");

  const searches = [
    "Margherita",
    "Paneer",
    "Chicken",
    "Cheese",
    "BBQ",
  ];

  const goToResults = (
    value
  ) => {
    logActivity(
      ACTIVITY_ACTIONS.SEARCH,
      {
        entityType: "Pizza",
        metadata: {
          query: value,
        },
      }
    );

    navigate(
      `/pizzas?search=${encodeURIComponent(
        value
      )}`
    );
  };

  const submitSearch = (
    event
  ) => {
    event.preventDefault();

    const value =
      query.trim();

    if (!value) {
      return;
    }

    goToResults(value);
  };

  return (
    <div className="search-page">

      <div className="search-hero">

        <span className="section-label">
          DISCOVER
        </span>

        <h1>
          What are you craving? 🍕
        </h1>

        <p>
          Search pizzas by name or ingredients.
        </p>

        <form
          className="search-form-large"
          onSubmit={
            submitSearch
          }
        >
          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search pizza..."
          />

          <button
            type="submit"
            className="primary-button"
          >
            Search
          </button>
        </form>

      </div>

      <section className="search-suggestions">

        <h2>
          Popular Searches
        </h2>

        <div>
          {searches.map(
            (item) => (
              <button
                type="button"
                key={item}
                onClick={() =>
                  goToResults(
                    item
                  )
                }
              >
                🔎 {item}
              </button>
            )
          )}
        </div>

      </section>

    </div>
  );
};

export default Search;

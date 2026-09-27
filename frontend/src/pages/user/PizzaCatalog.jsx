import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import PizzaCard from "../../components/PizzaCard.jsx";
import useDebounce from "../../hooks/useDebounce.js";
import logActivity, {
  ACTIVITY_ACTIONS,
} from "../../utils/activityLogger.js";

const PizzaCatalog = () => {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [pizzas, setPizzas] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState(
      searchParams.get(
        "search"
      ) || ""
    );

  const [category, setCategory] =
    useState(
      searchParams.get(
        "category"
      ) || "All"
    );

  const [sort, setSort] =
    useState("popular");

  const debouncedSearch =
    useDebounce(search, 600);

  useEffect(() => {
    const value = debouncedSearch.trim();

    if (value) {
      logActivity(
        ACTIVITY_ACTIONS.SEARCH,
        {
          entityType: "Pizza",
          metadata: {
            query: value,
            category,
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const load = async () => {
      try {
        const response =
          await axiosInstance.get(
            "/pizzas/templates"
          );

        setPizzas(
          response.data.data.pizzas ||
            []
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredPizzas =
    useMemo(() => {
      let result =
        pizzas.filter(
          (pizza) => {
            const matchesCategory =
              category === "All" ||
              pizza.category ===
                category;

            const value =
              search
                .trim()
                .toLowerCase();

            const matchesSearch =
              !value ||
              pizza.name
                .toLowerCase()
                .includes(
                  value
                ) ||
              pizza.description
                .toLowerCase()
                .includes(
                  value
                );

            return (
              matchesCategory &&
              matchesSearch
            );
          }
        );

      if (sort === "price-low") {
        result.sort(
          (a, b) =>
            a.price - b.price
        );
      }

      if (sort === "price-high") {
        result.sort(
          (a, b) =>
            b.price - a.price
        );
      }

      if (sort === "popular") {
        result.sort(
          (a, b) =>
            Number(
              b.isPopular
            ) -
            Number(
              a.isPopular
            )
        );
      }

      return result;
    }, [
      pizzas,
      category,
      search,
      sort,
    ]);

  const changeCategory =
    (value) => {
      setCategory(value);

      const params =
        Object.fromEntries(
          searchParams.entries()
        );

      if (
        value === "All"
      ) {
        delete params.category;
      } else {
        params.category =
          value;
      }

      setSearchParams(
        params
      );
    };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="section-label">
            OUR MENU
          </span>

          <h1>
            Choose Your Pizza 🍕
          </h1>

          <p>
            Fresh, customisable and
            delivered hot.
          </p>
        </div>
      </div>

      <div className="catalog-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search pizza..."
        />

        <select
          value={sort}
          onChange={(event) =>
            setSort(
              event.target.value
            )
          }
        >
          <option value="popular">
            Popular
          </option>

          <option value="price-low">
            Price: Low to High
          </option>

          <option value="price-high">
            Price: High to Low
          </option>
        </select>
      </div>

      <div className="category-filter">
        <button
          type="button"
          className={
            category === "All"
              ? "filter-active"
              : ""
          }
          onClick={() =>
            changeCategory(
              "All"
            )
          }
        >
          🍕 All
        </button>

        <button
          type="button"
          className={
            category === "Veg"
              ? "filter-active veg-filter"
              : "veg-filter"
          }
          onClick={() =>
            changeCategory(
              "Veg"
            )
          }
        >
          🥬 Veg
        </button>

        <button
          type="button"
          className={
            category ===
            "Non-Veg"
              ? "filter-active nonveg-filter"
              : "nonveg-filter"
          }
          onClick={() =>
            changeCategory(
              "Non-Veg"
            )
          }
        >
          🍗 Non-Veg
        </button>
      </div>

      <div className="catalog-result-info">
        {filteredPizzas.length} pizzas
        found
      </div>

      {filteredPizzas.length ===
      0 ? (
        <div className="empty-message">
          No pizzas found.
        </div>
      ) : (
        <div className="pizza-grid">
          {filteredPizzas.map(
            (pizza) => (
              <PizzaCard
                key={pizza._id}
                pizza={pizza}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default PizzaCatalog;
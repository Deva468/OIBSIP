import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance.js";

import PizzaCard from "../../components/PizzaCard.jsx";

const banners = [
  {
    title: "Weekend Pizza Feast",
    subtitle:
      "Enjoy special discounts on selected pizzas this weekend.",
    button: "View Weekend Offers",
    link: "/offers?coupon=WEEKEND40",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1800&q=90",
  },

  {
    title: "Welcome Pizza Deal",
    subtitle:
      "Enjoy 20% OFF on your first order.",
    button: "View Welcome Offer",
    link: "/offers?coupon=WELCOME20",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1800&q=90",
  },

  {
    title: "Free Delivery",
    subtitle:
      "Get free delivery on eligible orders above ₹500.",
    button: "View Delivery Offer",
    link: "/offers?coupon=FREESHIP",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1800&q=90",
  },

  {
    title: "Cheesy Favourites",
    subtitle:
      "Discover our most loved cheesy pizzas.",
    button: "Explore Pizzas",
    link: "/pizzas?search=cheese",
    image:
      "https://images.unsplash.com/photo-1552539618-7eec9b4d1796?auto=format&fit=crop&w=1800&q=90",
  },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80";

const Dashboard = () => {
  const navigate = useNavigate();

  const [pizzas, setPizzas] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [bannerIndex, setBannerIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const fetchPizzas = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "Dashboard: fetching pizzas..."
        );

        const response =
          await axiosInstance.get(
            "/pizzas/templates"
          );

        console.log(
          "Dashboard pizza response:",
          response.data
        );

        const pizzaList =
          response?.data?.data?.pizzas;

        if (!Array.isArray(pizzaList)) {
          throw new Error(
            "Pizza API returned invalid data."
          );
        }

        if (mounted) {
          setPizzas(
            pizzaList
          );
        }
      } catch (err) {
        console.error(
          "Dashboard pizza loading error:",
          err
        );

        if (mounted) {
          setError(
            err.response?.data
              ?.message ||
              err.message ||
              "Unable to load pizzas."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPizzas();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer =
      setInterval(() => {
        setBannerIndex(
          (current) =>
            (current + 1) %
            banners.length
        );
      }, 4500);

    return () =>
      clearInterval(timer);
  }, []);

  const filteredPizzas =
    useMemo(() => {
      return pizzas.filter(
        (pizza) => {
          const categoryMatch =
            category === "All" ||
            pizza.category ===
              category;

          const value =
            search
              .trim()
              .toLowerCase();

          const searchMatch =
            !value ||
            pizza.name
              ?.toLowerCase()
              .includes(value) ||
            pizza.description
              ?.toLowerCase()
              .includes(value);

          return (
            categoryMatch &&
            searchMatch
          );
        }
      );
    }, [
      pizzas,
      search,
      category,
    ]);

  const popularPizzas =
    pizzas.filter(
      (pizza) =>
        pizza.isPopular
    );

  const vegPizzas =
    pizzas.filter(
      (pizza) =>
        pizza.category ===
        "Veg"
    );

  const nonVegPizzas =
    pizzas.filter(
      (pizza) =>
        pizza.category ===
        "Non-Veg"
    );

  const currentBanner =
    banners[bannerIndex];

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    const value =
      search.trim();

    if (!value) {
      navigate("/pizzas");
      return;
    }

    navigate(
      `/pizzas?search=${encodeURIComponent(
        value
      )}`
    );
  };

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-loading-card">

          <div className="loading-spinner" />

          <h2>
            Preparing your pizza menu...
          </h2>

          <p>
            Loading fresh pizzas from the server.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* HERO */}

      <section
        className="hero-carousel"
        style={{
          backgroundImage:
            `linear-gradient(90deg, rgba(17,24,39,0.62), rgba(17,24,39,0.08)), url("${currentBanner.image}")`,
        }}
      >

        <div className="hero-carousel-content">

          <span className="hero-tag">
            HOT • FRESH • DELICIOUS
          </span>

          <h1>
            {currentBanner.title}
          </h1>

          <p>
            {currentBanner.subtitle}
          </p>

          <Link
            to={
              currentBanner.link
            }
            className="primary-button"
          >
            {currentBanner.button}
          </Link>

        </div>

        <div className="carousel-controls">

          <button
            type="button"
            onClick={() =>
              setBannerIndex(
                (current) =>
                  (current -
                    1 +
                    banners.length) %
                  banners.length
              )
            }
          >
            ←
          </button>

          <button
            type="button"
            onClick={() =>
              setBannerIndex(
                (current) =>
                  (current +
                    1) %
                  banners.length
              )
            }
          >
            →
          </button>

        </div>

        <div className="carousel-dots">

          {banners.map(
            (_, index) => (
              <button
                type="button"
                key={index}
                className={
                  index ===
                  bannerIndex
                    ? "dot active"
                    : "dot"
                }
                onClick={() =>
                  setBannerIndex(
                    index
                  )
                }
              />
            )
          )}

        </div>

      </section>

      {/* SEARCH */}

      <section className="dashboard-search">

        <div>
          <span className="section-label">
            WHAT ARE YOU CRAVING?
          </span>

          <h2>
            Find your favourite pizza
          </h2>
        </div>

        <form
          onSubmit={
            handleSearch
          }
        >

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search pizza, chicken, paneer, cheese..."
          />

          <button
            type="submit"
            className="primary-button"
          >
            Search
          </button>

        </form>

      </section>

      {/* QUICK CATEGORY */}

      <section className="quick-actions">

        <button
          type="button"
          className={
            category === "All"
              ? "quick-action active"
              : "quick-action"
          }
          onClick={() => {
            setCategory("All");
            navigate("/pizzas");
          }}
        >
          <span
            className="quick-action-icon"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80")',
            }}
          />

          <span className="quick-action-text">
            <strong>
              All Pizzas
            </strong>

            <small>
              {pizzas.length} available
            </small>
          </span>
        </button>

        <button
          type="button"
          className={
            category === "Veg"
              ? "quick-action active"
              : "quick-action"
          }
          onClick={() => {
            setCategory("Veg");
            navigate("/pizzas?category=Veg");
          }}
        >
          <span
            className="quick-action-icon"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=300&q=80")',
            }}
          />

          <span className="quick-action-text">
            <strong>
              Veg Pizzas
            </strong>

            <small>
              {vegPizzas.length} choices
            </small>
          </span>
        </button>

        <button
          type="button"
          className={
            category ===
            "Non-Veg"
              ? "quick-action active"
              : "quick-action"
          }
          onClick={() => {
            setCategory(
              "Non-Veg"
            );
            navigate(
              "/pizzas?category=Non-Veg"
            );
          }}
        >
          <span
            className="quick-action-icon"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1552539618-7eec9b4d1796?auto=format&fit=crop&w=300&q=80")',
            }}
          />

          <span className="quick-action-text">
            <strong>
              Non-Veg Pizzas
            </strong>

            <small>
              {nonVegPizzas.length} choices
            </small>
          </span>
        </button>

        <Link
          to="/offers"
          className="quick-action"
        >
          <span
            className="quick-action-icon"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=300&q=80")',
            }}
          />

          <span className="quick-action-text">
            <strong>
              Special Offers
            </strong>

            <small>
              Save more today
            </small>
          </span>
        </Link>

      </section>

      {/* ERROR */}

      {error && (
        <div className="dashboard-api-error">

          <strong>
            Pizza menu could not be loaded.
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>

        </div>
      )}

      {/* POPULAR */}

      {!error && (
        <section className="dashboard-section">

          <div className="section-heading-row">

            <div>
              <span className="section-label">
                TOP PICKS
              </span>

              <h2>
                Popular Pizzas
              </h2>
            </div>

            <Link to="/pizzas">
              View All →
            </Link>

          </div>

          {popularPizzas.length >
          0 ? (
            <div className="pizza-grid">

              {popularPizzas
                .slice(0, 6)
                .map(
                  (pizza) => (
                    <PizzaCard
                      key={
                        pizza._id
                      }
                      pizza={
                        pizza
                      }
                    />
                  )
                )}

            </div>
          ) : (
            <div className="empty-message">
              No popular pizzas available.
            </div>
          )}

        </section>
      )}

      {/* OFFER STRIP */}

      <section className="offer-strip">

        <div>

          <span className="section-label">
            LIMITED TIME
          </span>

          <h2>
            Weekend 40% OFF 🎉
          </h2>

          <p>
            Explore selected pizzas and save more.
          </p>

        </div>

        <Link
          to="/offers?coupon=WEEKEND40"
          className="primary-button"
        >
          View Weekend Offer
        </Link>

      </section>

      {/* VEG */}

      {!error && (
        <section className="dashboard-section">

          <div className="section-heading-row">

            <div>
              <span className="section-label">
                VEGETARIAN
              </span>

              <h2>
                Veg Favourites 🥬
              </h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() =>
                navigate(
                  "/pizzas?category=Veg"
                )
              }
            >
              View Veg →
            </button>

          </div>

          {vegPizzas.length >
          0 ? (
            <div className="pizza-grid">

              {vegPizzas
                .slice(0, 4)
                .map(
                  (pizza) => (
                    <PizzaCard
                      key={
                        pizza._id
                      }
                      pizza={
                        pizza
                      }
                    />
                  )
                )}

            </div>
          ) : (
            <div className="empty-message">
              No Veg pizzas available.
            </div>
          )}

        </section>
      )}

      {/* NON VEG */}

      {!error && (
        <section className="dashboard-section">

          <div className="section-heading-row">

            <div>
              <span className="section-label">
                NON-VEGETARIAN
              </span>

              <h2>
                Chicken Favourites 🍗
              </h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() =>
                navigate(
                  "/pizzas?category=Non-Veg"
                )
              }
            >
              View Non-Veg →
            </button>

          </div>

          {nonVegPizzas.length >
          0 ? (
            <div className="pizza-grid">

              {nonVegPizzas
                .slice(0, 4)
                .map(
                  (pizza) => (
                    <PizzaCard
                      key={
                        pizza._id
                      }
                      pizza={
                        pizza
                      }
                    />
                  )
                )}

            </div>
          ) : (
            <div className="empty-message">
              No Non-Veg pizzas available.
            </div>
          )}

        </section>
      )}

      {/* FULL MENU */}

      {!error && (
        <section className="dashboard-section">

          <div className="section-heading-row">

            <div>
              <span className="section-label">
                FULL MENU
              </span>

              <h2>
                {category ===
                "All"
                  ? "All Pizzas"
                  : `${category} Pizzas`}
              </h2>
            </div>

            <span>
              {filteredPizzas.length} pizzas
            </span>

          </div>

          <div className="dashboard-filter-row">

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Filter menu..."
            />

            <button
              type="button"
              className={
                category ===
                "All"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setCategory(
                  "All"
                )
              }
            >
              🍕 All
            </button>

            <button
              type="button"
              className={
                category ===
                "Veg"
                  ? "filter-active veg-filter"
                  : "veg-filter"
              }
              onClick={() =>
                setCategory(
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
                setCategory(
                  "Non-Veg"
                )
              }
            >
              🍗 Non-Veg
            </button>

          </div>

          {filteredPizzas.length >
          0 ? (
            <div className="pizza-grid">

              {filteredPizzas.map(
                (pizza) => (
                  <PizzaCard
                    key={
                      pizza._id
                    }
                    pizza={
                      pizza
                    }
                  />
                )
              )}

            </div>
          ) : (
            <div className="empty-message">
              <h3>
                No pizzas found
              </h3>

              <p>
                Try another search or category.
              </p>
            </div>
          )}

        </section>
      )}

    </div>
  );
};

export default Dashboard;
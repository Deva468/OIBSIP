import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import axiosInstance from "../../api/axiosInstance.js";

import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import PizzaCard from "../../components/PizzaCard.jsx";

const offerDetails = {
  WEEKEND40: {
    title:
      "Weekend 40% OFF",
    subtitle:
      "Special weekend savings on selected pizzas.",
    description:
      "Browse our weekend deals and choose your favourite pizza.",
  },

  WELCOME20: {
    title:
      "Welcome 20% OFF",
    subtitle:
      "A special welcome deal for your first order.",
    description:
      "Choose from popular pizzas and enjoy your welcome offer.",
  },

  FREESHIP: {
    title:
      "Free Delivery",
    subtitle:
      "Free delivery on eligible orders above ₹500.",
    description:
      "Build your order and unlock free delivery when the minimum order value is reached.",
  },
};

const Offers = () => {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const activeCoupon =
    searchParams.get(
      "coupon"
    ) || "WEEKEND40";

  const [pizzas, setPizzas] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchPizzas =
      async () => {
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

    fetchPizzas();
  }, []);

  const detail =
    offerDetails[
      activeCoupon
    ] || offerDetails.WEEKEND40;

  const offerPizzas =
    useMemo(() => {
      if (
        activeCoupon ===
        "FREESHIP"
      ) {
        return pizzas.filter(
          (pizza) =>
            pizza.price >= 399
        );
      }

      if (
        activeCoupon ===
        "WELCOME20"
      ) {
        return pizzas
          .filter(
            (pizza) =>
              pizza.isPopular
          )
          .slice(0, 8);
      }

      return pizzas
        .filter(
          (pizza) =>
            pizza.discountPercent >
            0
        )
        .sort(
          (a, b) =>
            b.discountPercent -
            a.discountPercent
        );
    }, [
      pizzas,
      activeCoupon,
    ]);

  const selectOffer = (
    coupon
  ) => {
    localStorage.setItem(
      "selectedPizzaOffer",
      coupon
    );

    setSearchParams({
      coupon,
    });
  };

  // WEEKEND40 / WELCOME20 are percentage coupons - show them with a
  // trailing "%" (e.g. "WEEKEND40%"). FREESHIP has no percentage, so
  // it keeps its own "FREE DELIVERY" label below.
  const formatCouponLabel = (
    coupon
  ) => {
    if (coupon === "FREESHIP") {
      return "FREE DELIVERY";
    }

    return /\d$/.test(coupon)
      ? `${coupon}%`
      : coupon;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="offers-page">
      <section className="offers-hero">
        <span>
          TODAY'S DEALS
        </span>

        <h1>
          {detail.title}
        </h1>

        <p>
          {detail.subtitle}
        </p>

        <div className="offer-active-code">
          Offer selected:
          <strong>
            {" "}
            {formatCouponLabel(
              activeCoupon
            )}
          </strong>
        </div>
      </section>

      <section className="promo-grid">
        <button
          type="button"
          className={
            activeCoupon ===
            "WEEKEND40"
              ? "promo-card promo-active"
              : "promo-card"
          }
          onClick={() =>
            selectOffer(
              "WEEKEND40"
            )
          }
        >
          <span>
            WEEKEND SPECIAL
          </span>

          <h2>
            Weekend 40% OFF
          </h2>

          <p>
            Special weekend savings
            on selected pizzas.
          </p>

          <strong>
            View Weekend Deals →
          </strong>
        </button>

        <button
          type="button"
          className={
            activeCoupon ===
            "WELCOME20"
              ? "promo-card promo-active"
              : "promo-card"
          }
          onClick={() =>
            selectOffer(
              "WELCOME20"
            )
          }
        >
          <span>
            WELCOME OFFER
          </span>

          <h2>
            20% OFF
          </h2>

          <p>
            Special deal for your
            first order.
          </p>

          <strong>
            View Welcome Deals →
          </strong>
        </button>

        <button
          type="button"
          className={
            activeCoupon ===
            "FREESHIP"
              ? "promo-card promo-active"
              : "promo-card"
          }
          onClick={() =>
            selectOffer(
              "FREESHIP"
            )
          }
        >
          <span>
            DELIVERY DEAL
          </span>

          <h2>
            FREE DELIVERY
          </h2>

          <p>
            Unlock free delivery on
            eligible orders.
          </p>

          <strong>
            View Eligible Pizzas →
          </strong>
        </button>
      </section>

      <section className="offers-detail-card">
        <div>
          <span className="section-label">
            SELECTED OFFER
          </span>

          <h2>
            {detail.title}
          </h2>

          <p>
            {detail.description}
          </p>
        </div>

        <Link
          to="/pizzas"
          className="primary-button"
        >
          Browse Full Menu
        </Link>
      </section>

      <section>
        <div className="section-heading-row">
          <div>
            <span className="section-label">
              DEAL PIZZAS
            </span>

            <h2>
              {activeCoupon ===
              "FREESHIP"
                ? "Perfect Pizzas for Free Delivery"
                : "Pizzas Included in This Offer"}
            </h2>
          </div>
        </div>

        <div className="pizza-grid">
          {offerPizzas.map(
            (pizza) => (
              <PizzaCard
                key={pizza._id}
                pizza={pizza}
              />
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default Offers;
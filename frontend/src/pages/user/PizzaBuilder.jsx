import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axiosInstance.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import logActivity, {
  ACTIVITY_ACTIONS,
} from "../../utils/activityLogger.js";

// PREVIOUSLY MISSING: unlike PizzaCard.jsx (which falls back to a stock
// photo if pizza.image fails to load), this page's preview <img> had no
// fallback at all — a broken/missing image URL just showed nothing.
const FALLBACK_IMAGE_VEG =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80";

const FALLBACK_IMAGE_NONVEG =
  "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80";

const PizzaBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const templateId =
    searchParams.get("template");

  const [pizza, setPizza] = useState(null);
  const [options, setOptions] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    vegetables: [],
  });

  const [selectedBase, setSelectedBase] =
    useState(null);

  const [selectedSauce, setSelectedSauce] =
    useState(null);

  const [selectedCheese, setSelectedCheese] =
    useState(null);

  const [selectedVegetables, setSelectedVegetables] =
    useState([]);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          pizzaResponse,
          optionsResponse,
        ] = await Promise.all([
          axiosInstance.get(
            "/pizzas/templates"
          ),
          axiosInstance.get(
            "/pizzas"
          ),
        ]);

        const pizzas =
          pizzaResponse.data.data.pizzas;

        const selectedPizza =
          pizzas.find(
            (item) =>
              item._id === templateId
          );

        if (!selectedPizza) {
          setError(
            "Pizza not found"
          );

          return;
        }

        setPizza(selectedPizza);

        logActivity(
          ACTIVITY_ACTIONS.VIEW_PIZZA,
          {
            entityType: "Pizza",
            entityId: selectedPizza._id,
            metadata: {
              name: selectedPizza.name,
              category: selectedPizza.category,
            },
          }
        );

        const pizzaOptions =
          optionsResponse.data.data;

        setOptions({
          bases:
            pizzaOptions.bases || [],
          sauces:
            pizzaOptions.sauces || [],
          cheeses:
            pizzaOptions.cheeses || [],
          vegetables:
            pizzaOptions.vegetables || [],
        });

        setSelectedBase(
          selectedPizza.base?._id ||
            null
        );

        setSelectedSauce(
          selectedPizza.sauce?._id ||
            null
        );

        setSelectedCheese(
          selectedPizza.cheese?._id ||
            null
        );

        setSelectedVegetables(
          selectedPizza.vegetables?.map(
            (item) => item._id
          ) || []
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load pizza"
        );
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchData();
    } else {
      setError(
        "Pizza template is missing"
      );

      setLoading(false);
    }
  }, [templateId]);

  const selectedBaseData =
    options.bases.find(
      (item) =>
        item._id === selectedBase
    );

  const selectedSauceData =
    options.sauces.find(
      (item) =>
        item._id === selectedSauce
    );

  const selectedCheeseData =
    options.cheeses.find(
      (item) =>
        item._id === selectedCheese
    );

  const selectedVegetableData =
    options.vegetables.filter(
      (item) =>
        selectedVegetables.includes(
          item._id
        )
    );

  const currentPrice = useMemo(() => {
    if (!pizza) {
      return 0;
    }

    let price = pizza.price;

    if (
      selectedBaseData &&
      pizza.base?._id !== selectedBaseData._id
    ) {
      price += selectedBaseData.price;
    }

    if (
      selectedSauceData &&
      pizza.sauce?._id !== selectedSauceData._id
    ) {
      price += selectedSauceData.price;
    }

    if (
      selectedCheeseData &&
      pizza.cheese?._id !== selectedCheeseData._id
    ) {
      price += selectedCheeseData.price;
    }

    selectedVegetableData.forEach(
      (vegetable) => {
        const alreadyIncluded =
          pizza.vegetables?.some(
            (item) =>
              item._id === vegetable._id
          );

        if (!alreadyIncluded) {
          price += vegetable.price;
        }
      }
    );

    return price;
  }, [
    pizza,
    selectedBaseData,
    selectedSauceData,
    selectedCheeseData,
    selectedVegetableData,
  ]);

  const toggleVegetable = (
    vegetableId
  ) => {
    setSelectedVegetables((current) => {
      if (
        current.includes(vegetableId)
      ) {
        return current.filter(
          (id) =>
            id !== vegetableId
        );
      }

      return [
        ...current,
        vegetableId,
      ];
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      current > 1
        ? current - 1
        : 1
    );
  };

  const increaseQuantity = () => {
    setQuantity(
      (current) => current + 1
    );
  };

  const addToCart = (redirectTo = "/cart") => {
    if (!pizza) {
      return;
    }

    const baseName =
      selectedBaseData?.name ||
      pizza.base?.name ||
      "";

    const sauceName =
      selectedSauceData?.name ||
      pizza.sauce?.name ||
      "";

    const cheeseName =
      selectedCheeseData?.name ||
      pizza.cheese?.name ||
      "";

    const vegetableNames =
      selectedVegetableData.map(
        (item) => item.name
      );

    const customizations = [
      `Base: ${baseName}`,
      `Sauce: ${sauceName}`,
      `Cheese: ${cheeseName}`,
      `Vegetables: ${
        vegetableNames.length > 0
          ? vegetableNames.join(", ")
          : "None"
      }`,
    ].join(" | ");

    const cartItem = {
      id: `${pizza._id}-${selectedBase}-${selectedSauce}-${selectedCheese}-${selectedVegetables.join(
        "-"
      )}`,
      pizzaId: pizza._id,
      name: pizza.name,
      image: pizza.image,
      price: currentPrice,
      quantity,
      base: selectedBase,
      sauce: selectedSauce,
      cheese: selectedCheese,
      vegetables:
        selectedVegetables,
      customizations,
    };

    const existingCart =
      JSON.parse(
        localStorage.getItem(
          "pizzaCart"
        )
      ) || [];

    const existingIndex =
      existingCart.findIndex(
        (item) =>
          item.id === cartItem.id
      );

    if (existingIndex !== -1) {
      existingCart[
        existingIndex
      ].quantity += quantity;
    } else {
      existingCart.push(
        cartItem
      );
    }

    localStorage.setItem(
      "pizzaCart",
      JSON.stringify(
        existingCart
      )
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    logActivity(
      ACTIVITY_ACTIONS.ADD_TO_CART,
      {
        entityType: "Pizza",
        entityId: pizza._id,
        metadata: {
          name: pizza.name,
          price: currentPrice,
          customizations,
          action:
            redirectTo === "/checkout"
              ? "customize_buy_now"
              : "customize",
        },
      }
    );

    navigate(redirectTo);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  if (!pizza) {
    return (
      <div className="error-message">
        Pizza not found.
      </div>
    );
  }

  return (
    <div className="builder-page">
      <div className="builder-header">
        <h1>
          Customize Your Pizza 🍕
        </h1>
      </div>

      <div className="builder-layout">
        <div className="builder-preview">
          <img
            src={pizza.image}
            alt={pizza.name}
            className="builder-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                pizza.category === "Non-Veg"
                  ? FALLBACK_IMAGE_NONVEG
                  : FALLBACK_IMAGE_VEG;
            }}
          />

          <h2>{pizza.name}</h2>

          <p>
            {pizza.description}
          </p>

          <div className="builder-price">
            ₹{currentPrice}
          </div>
        </div>

        <div className="builder-options">
          <div className="builder-section">
            <h2>
              1. Choose Your Base
            </h2>

            <div className="option-grid">
              {options.bases.map(
                (base) => (
                  <button
                    type="button"
                    key={base._id}
                    className={
                      selectedBase ===
                      base._id
                        ? "option-card selected"
                        : "option-card"
                    }
                    onClick={() =>
                      setSelectedBase(
                        base._id
                      )
                    }
                  >
                    <strong>
                      {base.name}
                    </strong>

                    <span>
                      ₹{base.price}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="builder-section">
            <h2>
              2. Choose Your Sauce
            </h2>

            <div className="option-grid">
              {options.sauces.map(
                (sauce) => (
                  <button
                    type="button"
                    key={sauce._id}
                    className={
                      selectedSauce ===
                      sauce._id
                        ? "option-card selected"
                        : "option-card"
                    }
                    onClick={() =>
                      setSelectedSauce(
                        sauce._id
                      )
                    }
                  >
                    <strong>
                      {sauce.name}
                    </strong>

                    <span>
                      ₹{sauce.price}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="builder-section">
            <h2>
              3. Choose Your Cheese
            </h2>

            <div className="option-grid">
              {options.cheeses.map(
                (cheese) => (
                  <button
                    type="button"
                    key={cheese._id}
                    className={
                      selectedCheese ===
                      cheese._id
                        ? "option-card selected"
                        : "option-card"
                    }
                    onClick={() =>
                      setSelectedCheese(
                        cheese._id
                      )
                    }
                  >
                    <strong>
                      {cheese.name}
                    </strong>

                    <span>
                      ₹{cheese.price}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="builder-section">
            <h2>
              4. Add Vegetables
            </h2>

            <div className="option-grid">
              {options.vegetables.map(
                (vegetable) => {
                  const selected =
                    selectedVegetables.includes(
                      vegetable._id
                    );

                  return (
                    <button
                      type="button"
                      key={
                        vegetable._id
                      }
                      className={
                        selected
                          ? "option-card selected"
                          : "option-card"
                      }
                      onClick={() =>
                        toggleVegetable(
                          vegetable._id
                        )
                      }
                    >
                      <strong>
                        {vegetable.name}
                      </strong>

                      <span>
                        ₹{vegetable.price}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="builder-section quantity-section">
            <h2>
              Quantity
            </h2>

            <div className="quantity-control">
              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
              >
                -
              </button>

              <span>
                {quantity}
              </span>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="builder-total">
            <div>
              <span>
                Total
              </span>

              <strong>
                ₹
                {currentPrice *
                  quantity}
              </strong>
            </div>

            <div className="builder-action-buttons">
              <button
                type="button"
                className="secondary-button"
                onClick={() => addToCart("/cart")}
              >
                Add to Cart 🛒
              </button>

              <button
                type="button"
                className="checkout-button"
                onClick={() => addToCart("/checkout")}
              >
                Buy Now ⚡
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaBuilder;
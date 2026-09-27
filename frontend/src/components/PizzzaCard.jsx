import { Link, useNavigate } from "react-router-dom";

const PizzaCard = ({ pizza }) => {
  const navigate = useNavigate();

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
          item.id === pizza._id
      );

    if (existingIndex >= 0) {
      cart[
        existingIndex
      ].quantity += 1;
    } else {
      cart.push({
        id: pizza._id,
        pizzaId: pizza._id,
        name: pizza.name,
        description: pizza.description,
        image: pizza.image,
        price: pizza.price,
        quantity: 1,
        category: pizza.category,
        base: pizza.base?._id,
        sauce: pizza.sauce?._id,
        cheese: pizza.cheese?._id,
        vegetables:
          pizza.vegetables?.map(
            (item) => item._id
          ) || [],
      });
    }

    localStorage.setItem(
      "pizzaCart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const buyNow = () => {
    localStorage.setItem(
      "pizzaCart",
      JSON.stringify([
        {
          id: pizza._id,
          pizzaId: pizza._id,
          name: pizza.name,
          description: pizza.description,
          image: pizza.image,
          price: pizza.price,
          quantity: 1,
          category: pizza.category,
          base: pizza.base?._id,
          sauce: pizza.sauce?._id,
          cheese: pizza.cheese?._id,
          vegetables:
            pizza.vegetables?.map(
              (item) => item._id
            ) || [],
        },
      ])
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    navigate("/checkout");
  };

  return (
    <div className="pizza-card">

      <div className="pizza-image-wrapper">

        <img
          src={pizza.image}
          alt={pizza.name}
          className="pizza-card-image"
          onError={(event) => {
            event.currentTarget.src =
              "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80";
          }}
        />

        {pizza.discountPercent > 0 && (
          <span className="discount-badge">
            {pizza.discountPercent}% OFF
          </span>
        )}

      </div>

      <div className="pizza-card-content">

        <div className="pizza-card-title-row">

          <h2>
            {pizza.name}
          </h2>

          <span
            className={
              pizza.category ===
              "Veg"
                ? "veg-badge"
                : "nonveg-badge"
            }
          >
            {pizza.category}
          </span>

        </div>

        {pizza.isPopular && (
          <span className="popular-badge">
            ⭐ Popular
          </span>
        )}

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
              ₹{pizza.originalPrice}
            </del>
          )}
        </div>

        <div className="pizza-actions">

          <button
            type="button"
            className="add-cart-button"
            onClick={addToCart}
          >
            Add to Cart
          </button>

          <button
            type="button"
            className="buy-now-button"
            onClick={buyNow}
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
    </div>
  );
};

export default PizzaCard;
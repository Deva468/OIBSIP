function PizzaOptionCard({
  item,
  selected = false,
  onSelect,
}) {
  return (
    <button
      type="button"
      className={`pizza-option-card ${
        selected ? "selected" : ""
      }`}
      onClick={() =>
        onSelect && onSelect(item)
      }
    >
      <h3>{item?.name}</h3>

      <p>
        {item?.description || ""}
      </p>

      <strong>
        ₹{item?.price ?? 0}
      </strong>
    </button>
  );
}

export default PizzaOptionCard;
const calculateSubtotal = (items) => {
  return items.reduce(
    (total, item) => {
      return total + item.price * item.quantity;
    },
    0
  );
};

const calculateDeliveryFee = (subtotal) => {
  if (subtotal >= 500) {
    return 0;
  }

  return 40;
};

const calculateOrderTotal = (items) => {
  const subtotal =
    calculateSubtotal(items);

  const deliveryFee =
    calculateDeliveryFee(subtotal);

  const totalAmount =
    subtotal + deliveryFee;

  return {
    subtotal,
    deliveryFee,
    totalAmount,
  };
};

export {
  calculateSubtotal,
  calculateDeliveryFee,
  calculateOrderTotal,
};  
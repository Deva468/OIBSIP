const createPaymentOrder = async ({
  amount,
  receipt,
}) => {
  return {
    amount,
    currency: "INR",
    receipt,
  };
};

const verifyPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  return Boolean(
    razorpayOrderId &&
      razorpayPaymentId &&
      razorpaySignature
  );
};

export {
  createPaymentOrder,
  verifyPayment,
};
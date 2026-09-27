import axiosInstance from "../api/axiosInstance.js";

const RAZORPAY_SCRIPT_SRC =
  "https://checkout.razorpay.com/v1/checkout.js";

/*
-----------------------------------------------------------------------
loadRazorpayScript
-----------------------------------------------------------------------
Loads Razorpay's Checkout script exactly once (it's safe to call this
many times - subsequent calls just resolve immediately) and resolves
`true`/`false` depending on whether it succeeded, instead of throwing,
so callers can show a friendly message on a flaky connection.
-----------------------------------------------------------------------
*/

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    if (
      document.querySelector(
        `script[src="${RAZORPAY_SCRIPT_SRC}"]`
      )
    ) {
      resolve(true);
      return;
    }

    const script =
      document.createElement(
        "script"
      );

    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(
      script
    );
  });

/*
-----------------------------------------------------------------------
openRazorpayCheckout
-----------------------------------------------------------------------
Shared flow used both right after placing a new order (Checkout.jsx)
and when retrying payment on an existing PENDING order (Orders.jsx):

  1. Ask the backend to open a matching order on Razorpay's side.
  2. Launch the Razorpay Checkout popup (test mode - no real bank
     involved, Razorpay's own UI simulates cards/UPI/netbanking).
  3. On success, ask the backend to verify the payment signature and
     mark the order PAID.

`order` must be a Mongo order document (or at least have `_id`).
`callbacks` may include onSuccess(order), onError(message) and
onDismiss(message).
-----------------------------------------------------------------------
*/

export const openRazorpayCheckout = async (
  order,
  {
    prefill = {},
    onSuccess = () => {},
    onError = () => {},
    onDismiss = () => {},
  } = {}
) => {
  const scriptLoaded =
    await loadRazorpayScript();

  if (!scriptLoaded) {
    onError(
      "Could not load the Razorpay checkout. Check your internet connection and try again."
    );
    return;
  }

  let razorpayData;

  try {
    const response =
      await axiosInstance.post(
        "/payments/create-order",
        { orderId: order._id }
      );

    razorpayData =
      response.data.data;
  } catch (error) {
    onError(
      error.response?.data
        ?.message ||
        "Could not start the payment. Please try again."
    );
    return;
  }

  const razorpayOptions = {
    key: razorpayData.keyId,
    amount: razorpayData.amount,
    currency: razorpayData.currency,
    name: "Pizza Delivery",
    description: `Order #${order._id
      .toString()
      .slice(-8)
      .toUpperCase()}`,
    order_id:
      razorpayData.razorpayOrderId,
    prefill,
    theme: {
      color: "#e11d48",
    },
    handler: async (response) => {
      try {
        const verifyResponse =
          await axiosInstance.post(
            "/payments/verify",
            {
              orderId: order._id,
              razorpay_order_id:
                response.razorpay_order_id,
              razorpay_payment_id:
                response.razorpay_payment_id,
              razorpay_signature:
                response.razorpay_signature,
            }
          );

        onSuccess(
          verifyResponse.data.data
            .order
        );
      } catch (verifyError) {
        onError(
          verifyError.response
            ?.data?.message ||
            "Payment verification failed. If money was deducted, it will be refunded automatically by Razorpay."
        );
      }
    },
    modal: {
      ondismiss: () => {
        onDismiss(
          "Payment was cancelled. Your order is saved as pending - you can retry anytime."
        );
      },
    },
  };

  const razorpayInstance =
    new window.Razorpay(
      razorpayOptions
    );

  razorpayInstance.on(
    "payment.failed",
    () => {
      onError(
        "Payment failed. Please try again with a different method."
      );
    }
  );

  razorpayInstance.open();
};

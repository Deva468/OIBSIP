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
import { useAuth } from "../../context/AuthContext.jsx";
import logActivity, {
  ACTIVITY_ACTIONS,
} from "../../utils/activityLogger.js";
import { openRazorpayCheckout } from "../../utils/razorpay.js";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartItems, setCartItems] =
    useState([]);

  const [address, setAddress] =
    useState(emptyAddress);

  const [paymentMethod, setPaymentMethod] =
    useState("RAZORPAY");

  const [placing, setPlacing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpValue, setOtpValue] =
    useState("");

  const [otpVerified, setOtpVerified] =
    useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [otpError, setOtpError] =
    useState("");

  const [devOtp, setDevOtp] =
    useState("");

  const [resendCooldown, setResendCooldown] =
    useState(0);

  useEffect(() => {
    const cart =
      JSON.parse(
        localStorage.getItem(
          "pizzaCart"
        )
      ) || [];

    setCartItems(cart);

    // Fire-and-forget: purely for the activity trail, so we can see
    // how many people reach checkout vs. actually complete an order.
    logActivity(
      ACTIVITY_ACTIONS.BEGIN_CHECKOUT,
      {
        entityType: "Cart",
        metadata: {
          itemCount: cart.length,
        },
      }
    );

    // Pre-fill the name/phone we already have on file so the user
    // only has to type the address itself.
    setAddress((previous) => ({
      ...previous,
      fullName: user?.name || "",
      phone: user?.phone || "",
    }));
  }, [user]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          item.price *
            item.quantity,
        0
      ),
    [cartItems]
  );

  const deliveryFee =
    subtotal === 0
      ? 0
      : subtotal >= 500
      ? 0
      : 40;

  const total =
    subtotal + deliveryFee;

  const handleAddressChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Any edit to the phone number invalidates a previous OTP
    // verification - it was only ever proof of ownership of the
    // *old* number.
    if (name === "phone") {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpValue("");
      setOtpError("");
      setDevOtp("");
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown(
        (previous) =>
          Math.max(0, previous - 1)
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [resendCooldown]);

  const isValidIndianMobile = (
    value
  ) => /^[6-9][0-9]{9}$/.test(value);

  const sendOtp = async () => {
    if (
      !isValidIndianMobile(
        address.phone
      )
    ) {
      setOtpError(
        "Enter a valid 10-digit mobile number first"
      );
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    setDevOtp("");

    try {
      const response =
        await axiosInstance.post(
          "/orders/send-otp",
          { phone: address.phone }
        );

      setOtpSent(true);
      setResendCooldown(30);

      // Only ever present in development - see otp.controller.js.
      // Shown here so you can test the full flow without a real SMS
      // provider configured.
      if (
        response.data.data.devOtp
      ) {
        setDevOtp(
          response.data.data.devOtp
        );
      }
    } catch (sendError) {
      setOtpError(
        sendError.response?.data
          ?.message ||
          "Could not send OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpValue.trim()) {
      setOtpError(
        "Enter the OTP sent to your phone"
      );
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      await axiosInstance.post(
        "/orders/verify-otp",
        {
          phone: address.phone,
          otp: otpValue.trim(),
        }
      );

      setOtpVerified(true);
      setDevOtp("");
    } catch (verifyError) {
      setOtpError(
        verifyError.response?.data
          ?.message ||
          "Incorrect OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const buildOrderItems = () =>
    cartItems.map((item) => ({
      pizzaName: item.name,
      base: item.base,
      sauce: item.sauce,
      cheese: item.cheese,
      vegetables:
        item.vegetables || [],
      quantity: item.quantity,
      price: item.price,
      subtotal:
        item.price * item.quantity,
    }));

  const clearCartAndCelebrate = () => {
    localStorage.removeItem(
      "pizzaCart"
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  };

  const payWithRazorpay = (
    order
  ) =>
    openRazorpayCheckout(order, {
      prefill: {
        name: address.fullName,
        contact: address.phone,
        email: user?.email || "",
      },
      onSuccess: () => {
        clearCartAndCelebrate();

        navigate(
          `/orders?justPlaced=${order._id}`
        );

        setPlacing(false);
      },
      onError: (message) => {
        setError(message);
        setPlacing(false);
      },
      onDismiss: (message) => {
        setError(message);
        setPlacing(false);
      },
    });

  const placeOrder = async (
    event
  ) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      return;
    }

    if (!otpVerified) {
      setError(
        "Please verify your phone number with the OTP before placing the order"
      );
      return;
    }

    setError("");
    setPlacing(true);

    try {
      const response =
        await axiosInstance.post(
          "/orders",
          {
            items: buildOrderItems(),
            deliveryAddress: address,
            paymentMethod,
          }
        );

      const order =
        response.data.data.order;

      if (paymentMethod === "RAZORPAY") {
        // Placing is only "done" once payment succeeds - keep the
        // button disabled while the Razorpay popup is open.
        await payWithRazorpay(order);
      } else {
        clearCartAndCelebrate();

        navigate(
          `/orders?justPlaced=${order._id}`
        );

        setPlacing(false);
      }
    } catch (orderError) {
      setError(
        orderError.response?.data
          ?.message ||
          "Could not place your order. Please check your details and try again."
      );

      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <h1>Checkout</h1>

          <p>
            Your cart is empty - add
            some pizzas before checking
            out.
          </p>

          <Link
            to="/pizzas"
            className="primary-button"
          >
            Browse Pizzas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>

        <p>
          Confirm your delivery
          address and payment method.
        </p>
      </div>

      <form
        className="checkout-layout"
        onSubmit={placeOrder}
      >
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h2>Delivery Address</h2>

            <div className="form-grid">
              <label>
                Full Name <span className="required-star">*</span>

                <input
                  type="text"
                  name="fullName"
                  required
                  value={
                    address.fullName
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="Your name"
                />
              </label>

              <label>
                Phone Number <span className="required-star">*</span>

                <input
                  type="tel"
                  name="phone"
                  required
                  pattern="[6-9][0-9]{9}"
                  title="Enter a valid 10-digit Indian mobile number (starts with 6-9)"
                  value={
                    address.phone
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="10-digit mobile number"
                />
              </label>

              <div className="otp-verify-box form-grid-full">
                {otpVerified ? (
                  <div className="otp-verified-badge">
                    ✓ Phone number
                    verified
                  </div>
                ) : (
                  <>
                    <div className="otp-verify-row">
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={
                          otpLoading ||
                          resendCooldown >
                            0 ||
                          !isValidIndianMobile(
                            address.phone
                          )
                        }
                        onClick={
                          sendOtp
                        }
                      >
                        {otpLoading &&
                        !otpSent
                          ? "Sending..."
                          : resendCooldown >
                            0
                          ? `Resend in ${resendCooldown}s`
                          : otpSent
                          ? "Resend OTP"
                          : "Send OTP to verify"}
                      </button>

                      {otpSent && (
                        <>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="6-digit OTP"
                            value={
                              otpValue
                            }
                            onChange={(
                              event
                            ) =>
                              setOtpValue(
                                event.target.value.replace(
                                  /\D/g,
                                  ""
                                )
                              )
                            }
                            className="otp-input"
                          />

                          <button
                            type="button"
                            className="primary-button otp-verify-button"
                            disabled={
                              otpLoading ||
                              otpValue
                                .trim()
                                .length !==
                                6
                            }
                            onClick={
                              verifyOtp
                            }
                          >
                            {otpLoading
                              ? "Verifying..."
                              : "Verify"}
                          </button>
                        </>
                      )}
                    </div>

                    {devOtp && (
                      <p className="otp-dev-hint">
                        DEV MODE: your
                        OTP is{" "}
                        <strong>
                          {devOtp}
                        </strong>{" "}
                        (no SMS
                        provider is
                        configured, so
                        it's shown here
                        instead of
                        being texted)
                      </p>
                    )}

                    {otpError && (
                      <p className="otp-error-hint">
                        {otpError}
                      </p>
                    )}
                  </>
                )}
              </div>

              <label className="form-grid-full">
                Address <span className="required-star">*</span>

                <input
                  type="text"
                  name="addressLine"
                  required
                  minLength={5}
                  value={
                    address.addressLine
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="House no., street, area"
                />
              </label>

              <label>
                City <span className="required-star">*</span>

                <input
                  type="text"
                  name="city"
                  required
                  value={
                    address.city
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="City"
                />
              </label>

              <label>
                State <span className="required-star">*</span>

                <input
                  type="text"
                  name="state"
                  required
                  value={
                    address.state
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="State"
                />
              </label>

              <label>
                Pincode <span className="required-star">*</span>

                <input
                  type="text"
                  name="pincode"
                  required
                  pattern="[1-9][0-9]{5}"
                  title="Enter a valid 6 digit pincode"
                  value={
                    address.pincode
                  }
                  onChange={
                    handleAddressChange
                  }
                  placeholder="6-digit pincode"
                />
              </label>
            </div>

            <p className="checkout-required-hint">
              <span className="required-star">*</span> All fields are required
            </p>
          </div>

          <div className="checkout-card">
            <h2>Payment Method</h2>

            <div className="payment-method-options">
              <label
                className={
                  paymentMethod ===
                  "RAZORPAY"
                    ? "payment-option payment-option-active"
                    : "payment-option"
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={
                    paymentMethod ===
                    "RAZORPAY"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "RAZORPAY"
                    )
                  }
                />

                <span>
                  <strong>
                    Pay Online
                  </strong>

                  <small>
                    Card / UPI / Netbanking via Razorpay (test mode)
                  </small>
                </span>
              </label>

              <label
                className={
                  paymentMethod ===
                  "COD"
                    ? "payment-option payment-option-active"
                    : "payment-option"
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={
                    paymentMethod ===
                    "COD"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "COD"
                    )
                  }
                />

                <span>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <small>
                    Pay when your order arrives
                  </small>
                </span>
              </label>
            </div>

            {paymentMethod ===
              "RAZORPAY" && (
              <p className="checkout-test-note">
                This store is running in Razorpay{" "}
                <strong>test mode</strong>. Use
                test card 4111 1111 1111 1111,
                any future expiry and any 3-digit
                CVV, or any UPI ID ending in
                @razorpay - no real money moves.
              </p>
            )}
          </div>

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}
        </div>

        <div className="cart-summary checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-items-mini">
            {cartItems.map(
              (item) => (
                <div
                  className="checkout-item-mini"
                  key={item.id}
                >
                  <span>
                    {item.name}{" "}
                    <b>
                      × {item.quantity}
                    </b>
                  </span>

                  <span>
                    ₹
                    {item.price *
                      item.quantity}
                  </span>
                </div>
              )
            )}
          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Subtotal</span>

            <span>₹{subtotal}</span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>

            <span>
              {deliveryFee === 0
                ? "FREE"
                : `₹${deliveryFee}`}
            </span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>

            <strong>₹{total}</strong>
          </div>

          <button
            type="submit"
            className="checkout-button"
            disabled={
              placing || !otpVerified
            }
          >
            {placing
              ? "Processing..."
              : !otpVerified
              ? "Verify phone number to continue"
              : paymentMethod ===
                "RAZORPAY"
              ? `Pay ₹${total}`
              : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;

import axiosInstance from "../api/axiosInstance.js";

/*
-----------------------------------------------------------------------
activityLogger
-----------------------------------------------------------------------
Every screen in the app (login, browsing pizzas, adding favourites,
adding to cart, placing an order, searching, etc.) should leave a
trail in MongoDB via the `UserActivity` collection so the admin can
see what users are actually doing.

Some of these actions (login, register, order placed, favourite
toggled) are already logged directly from the backend controllers
because that is the most reliable place to log them - it can never be
skipped just because a click handler didn't fire.

Everything else that only happens on the client (search, add to cart,
buy now, viewing the checkout page, logging out, etc.) is logged from
here, using the existing POST /users/activity endpoint.

This helper is intentionally "fire and forget":
  - it never throws, so a failed/slow activity write can never break
    the feature the user is actually trying to use.
  - it silently does nothing when there is no logged-in user, since
    the backend requires authentication for this endpoint.
-----------------------------------------------------------------------
*/

const hasSession = () =>
  Boolean(localStorage.getItem("pizzaToken"));

const logActivity = async (
  action,
  {
    entityType = "",
    entityId = "",
    metadata = {},
  } = {}
) => {
  if (!action) {
    return;
  }

  if (!hasSession()) {
    // Guests are not authenticated against /users/activity, so
    // there is nothing useful to send yet.
    return;
  }

  try {
    await axiosInstance.post("/users/activity", {
      action,
      entityType,
      entityId,
      metadata,
    });
  } catch (error) {
    // Never let activity tracking break the user's flow.
    console.error(
      "Activity tracking failed:",
      error?.response?.data?.message ||
        error.message
    );
  }
};

export const ACTIVITY_ACTIONS = {
  LOGIN: "login",
  LOGOUT: "logout",
  REGISTER: "register",
  VIEW_PIZZA: "view_pizza",
  SEARCH: "search",
  ADD_FAVORITE: "add_favorite",
  REMOVE_FAVORITE: "remove_favorite",
  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  BUY_NOW: "buy_now",
  BEGIN_CHECKOUT: "begin_checkout",
  ORDER_PLACED: "order_placed",
};

export default logActivity;

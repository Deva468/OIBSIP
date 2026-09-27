import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("pizzaToken");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
-----------------------------------------------------------------------
Response interceptor - expired/invalid session handling
-----------------------------------------------------------------------
If the backend ever returns 401 (token missing, expired, or invalid -
e.g. because the user logged out in another tab, the token simply
timed out, or they opened the site fresh in a new browser), we don't
want every page to show a raw "Invalid or expired authentication
token" error inline. Instead: clear the stale session, remember
where the user was trying to go, and send them to the login page with
a friendly message. After logging back in, they're sent right back
to that same page instead of landing on the dashboard.
-----------------------------------------------------------------------
*/

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status =
      error.response?.status;

    const requestUrl =
      error.config?.url || "";

    // Don't hijack a failed *login/register* attempt itself - that
    // 401 just means "wrong password", not "your session expired".
    const isAuthAttempt =
      requestUrl.includes(
        "/auth/login"
      ) ||
      requestUrl.includes(
        "/auth/register"
      );

    if (
      status === 401 &&
      !isAuthAttempt &&
      localStorage.getItem(
        "pizzaToken"
      )
    ) {
      localStorage.removeItem(
        "pizzaToken"
      );

      localStorage.removeItem(
        "pizzaUser"
      );

      const returnTo =
        window.location.pathname +
        window.location.search;

      if (
        !window.location.pathname.startsWith(
          "/login"
        )
      ) {
        window.location.href = `/login?sessionExpired=1&returnTo=${encodeURIComponent(
          returnTo
        )}`;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
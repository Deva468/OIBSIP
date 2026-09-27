import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import axiosInstance from "../api/axiosInstance.js";
import logActivity, {
  ACTIVITY_ACTIONS,
} from "../utils/activityLogger.js";

const AuthContext =
  createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {
    const restoreSession =
      async () => {
        const token =
          localStorage.getItem(
            "pizzaToken"
          );

        const savedUser =
          localStorage.getItem(
            "pizzaUser"
          );

        /*
        -------------------------------------------------------
        No token = no authenticated session
        -------------------------------------------------------
        */

        if (!token) {
          setUser(null);
          setIsAuthenticated(
            false
          );
          setLoading(false);
          return;
        }

        /*
        -------------------------------------------------------
        Temporary local user state
        -------------------------------------------------------
        */

        if (savedUser) {
          try {
            const parsedUser =
              JSON.parse(
                savedUser
              );

            setUser(
              parsedUser
            );

            setIsAuthenticated(
              true
            );
          } catch {
            localStorage.removeItem(
              "pizzaUser"
            );
          }
        }

        /*
        -------------------------------------------------------
        Verify token with backend
        -------------------------------------------------------
        */

        try {
          const response =
            await axiosInstance.get(
              "/auth/me"
            );

          const currentUser =
            response?.data?.data
              ?.user;

          if (!currentUser) {
            throw new Error(
              "Invalid user response"
            );
          }

          setUser(
            currentUser
          );

          setIsAuthenticated(
            true
          );

          localStorage.setItem(
            "pizzaUser",
            JSON.stringify(
              currentUser
            )
          );
        } catch (error) {
          console.error(
            "Session restore failed:",
            error.message
          );

          localStorage.removeItem(
            "pizzaToken"
          );

          localStorage.removeItem(
            "pizzaUser"
          );

          setUser(null);
          setIsAuthenticated(
            false
          );
        } finally {
          setLoading(false);
        }
      };

    restoreSession();
  }, []);

  /*
  ---------------------------------------------------------
  LOGIN
  ---------------------------------------------------------
  */

  const login = (
    userData,
    token
  ) => {
    if (token) {
      localStorage.setItem(
        "pizzaToken",
        token
      );
    }

    localStorage.setItem(
      "pizzaUser",
      JSON.stringify(
        userData
      )
    );

    setUser(
      userData
    );

    setIsAuthenticated(
      true
    );
  };

  /*
  ---------------------------------------------------------
  UPDATE USER
  ---------------------------------------------------------
  */

  const updateUser = (
    userData
  ) => {
    localStorage.setItem(
      "pizzaUser",
      JSON.stringify(
        userData
      )
    );

    setUser(
      userData
    );

    setIsAuthenticated(
      true
    );
  };

  /*
  ---------------------------------------------------------
  LOGOUT
  ---------------------------------------------------------
  */

  const logout = () => {
    // Must be logged BEFORE the token is removed - the activity
    // endpoint requires a valid Bearer token to know which user
    // logged out.
    logActivity(
      ACTIVITY_ACTIONS.LOGOUT
    );

    localStorage.removeItem(
      "pizzaToken"
    );

    localStorage.removeItem(
      "pizzaUser"
    );

    setUser(null);

    setIsAuthenticated(
      false
    );
  };

  /*
  ---------------------------------------------------------
  CONTEXT VALUE
  ---------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      isAdmin:
        user?.role ===
        "admin",
      login,
      logout,
      updateUser,
    }),
    [
      user,
      loading,
      isAuthenticated,
    ]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
import { useCallback, useState } from "react";

import axiosInstance from "../api/axiosInstance";

const useApi = () => {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const request = useCallback(
    async ({
      method = "get",
      url,
      data = undefined,
      params = undefined,
    }) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axiosInstance({
            method,
            url,
            data,
            params,
          });

        return response.data;
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Something went wrong.";

        setError(message);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    request,
    loading,
    error,
    setError,
  };
};

export default useApi;
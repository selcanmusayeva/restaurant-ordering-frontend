import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("API Request:", config.method?.toUpperCase(), config.url);
  console.log("Token exists:", !!token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Added auth token to request");
  } else {
    console.log("No token found in localStorage");
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("API Response success:", response.config.url);
    return response;
  },
  async (error) => {
    console.error(
      "API Response error:",
      error.config?.url,
      error.response?.status,
      error.message
    );
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Attempting to refresh token");

        const refreshResponse = await axios.post(
          "/auth/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const newToken = refreshResponse.data.token;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

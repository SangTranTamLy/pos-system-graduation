(function attachCinoxApi(global) {
  const TOKEN_KEY = "cinox_token";
  const USER_KEY = "cinox_user";
  const API_BASE_URL = "http://localhost:3000";

  const parseJson = (value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

  const getUser = () => {
    const rawUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return rawUser ? parseJson(rawUser) : null;
  };

  const getSession = () => {
    const token = getToken();
    const user = getUser();
    if (!token || !user) {
      return null;
    }

    return { token, user };
  };

  const saveSession = (token, user, shouldRemember) => {
    const storage = shouldRemember ? localStorage : sessionStorage;
    const mirrorStorage = shouldRemember ? sessionStorage : localStorage;

    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
    mirrorStorage.removeItem(TOKEN_KEY);
    mirrorStorage.removeItem(USER_KEY);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  };

  const request = async (path, options = {}) => {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message = typeof payload === "object" && payload ? payload.message : "Request failed";
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  };

  const requireSession = (fallbackPath = "./index.html") => {
    const session = getSession();
    if (!session) {
      global.location.replace(fallbackPath);
      return null;
    }

    return session;
  };

  const isAdminUser = (user) => (user?.role || "").toUpperCase() === "ADMIN";

  global.CinoxAPI = {
    API_BASE_URL,
    TOKEN_KEY,
    USER_KEY,
    request,
    getToken,
    getUser,
    getSession,
    saveSession,
    clearSession,
    requireSession,
    isAdminUser
  };
})(window);

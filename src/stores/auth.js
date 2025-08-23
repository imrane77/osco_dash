import api from "../axios";
import { ref } from "vue";

// state
const user = ref(null);
const token = ref(localStorage.getItem("token") || null);

// login
const login = async (email, password) => {
  try {
    const response = await api.post("login", { email, password });
    token.value = response.data.token;
    localStorage.setItem("token", token.value);
    await getUser();
    return true;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};

// profile
const getUser = async () => {
  try {
    const response = await api.get("profile", {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    user.value = response.data;
  } catch (error) {
    logout();
  }
};

// logout
const logout = async () => {
  try {
    // Call API logout endpoint if token exists
    if (token.value) {
      await api.post("logout", {}, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout API call failed:", error);
    // Continue with local logout even if API fails
  } finally {
    // Clear local data regardless of API response
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
  }
};

// export
export default {
  user,
  token,
  login,
  getUser,
  logout,
};

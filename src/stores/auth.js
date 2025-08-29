import { ref } from "vue";

// Simple client-side authentication
// Default credentials for demo purposes
const DEFAULT_CREDENTIALS = {
  email: "admin@osco.ma",
  password: "12345678"
};

// state
const user = ref(null);
const isAuthenticated = ref(localStorage.getItem("isAuthenticated") === "true");

// Initialize user if already authenticated
if (isAuthenticated.value) {
  user.value = {
    id: 1,
    name: "Admin User",
    email: DEFAULT_CREDENTIALS.email
  };
}

// login
const login = async (email, password) => {
  // Simple credential check
  if (email === DEFAULT_CREDENTIALS.email && password === DEFAULT_CREDENTIALS.password) {
    user.value = {
      id: 1,
      name: "Admin User",
      email: email
    };
    isAuthenticated.value = true;
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(user.value));
    return true;
  }
  return false;
};

// logout
const logout = async () => {
  user.value = null;
  isAuthenticated.value = false;
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
};

// export
export default {
  user,
  isAuthenticated,
  login,
  logout,
};

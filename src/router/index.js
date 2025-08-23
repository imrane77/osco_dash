import VueRouter from "vue-router";
import routes from "./routes";
import auth from "../stores/auth";

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkExactActiveClass: "active",
  scrollBehavior: (to) => {
    if (to.hash) {
      return { selector: to.hash };
    } else {
      return { x: 0, y: 0 };
    }
  },
});

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = auth.token.value !== null;
  
  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && to.path !== '/login') {
    next('/login');
  }
  // If user is authenticated and trying to access login page, redirect to dashboard
  else if (isAuthenticated && to.path === '/login') {
    next('/dashboard');
  }
  // Otherwise, proceed normally
  else {
    next();
  }
});

export default router;

<template>
  <div class="container-fluid vh-100 d-flex justify-content-center align-items-center" style="margin-top: 10%;">
    <div class="card shadow" style="width: 100%; max-width: 400px;">
      <div class="card-body p-4">
        <h2 class="card-title text-center mb-4">Login</h2>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              :disabled="loading"
              placeholder="Enter your email"
              class="form-control"
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              :disabled="loading"
              placeholder="Enter your password"
              class="form-control"
            />
          </div>

          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-100"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import auth from '../../stores/auth';

export default {
  name: 'Login',
  setup() {
    const email = ref('');
    const password = ref('');
    const loading = ref(false);
    const errorMessage = ref('');

    return {
      email,
      password,
      loading,
      errorMessage
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const success = await auth.login(this.email, this.password);

        if (success) {
          this.$router.push('/dashboard');
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

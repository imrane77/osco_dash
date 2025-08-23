<template>
  <div class="row">
    <div class="col-md-8">
      <edit-profile-form :model="model"> </edit-profile-form>
    </div>
    <div class="col-md-4">
      <user-card :user="user"></user-card>
    </div>
  </div>
</template>
<script>
import EditProfileForm from "./Profile/EditProfileForm";
import UserCard from "./Profile/UserCard";
import auth from "../stores/auth";

export default {
  components: {
    EditProfileForm,
    UserCard,
  },
  data() {
    return {
      model: {
        email: "",
        username: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        country: "",
        about: "",
      },
      user: {
        fullName: "",
        title: "",
        description: "",
      },
    };
  },
  computed: {
    currentUser() {
      return auth.user.value;
    }
  },
  async mounted() {
    await this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      try {
        // Ensure user data is loaded
        if (!auth.user.value && auth.token.value) {
          await auth.getUser();
        }
        
        const userData = auth.user.value;
        if (userData) {
          // Update model for edit form
          this.model = {
            email: userData.email || "",
            username: userData.username || userData.name || "",
            firstName: userData.first_name || userData.name?.split(' ')[0] || "",
            lastName: userData.last_name || userData.name?.split(' ')[1] || "",
            address: userData.email || "",
            city: userData.city || "",
            country: userData.country || "",
            about: userData.about || userData.bio || "",
          };
          
          // Update user card data
          this.user = {
            fullName: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
            title: userData.title || userData.role || "User",
            description: userData.about || userData.bio || "No description available",
          };
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }
  },
};
</script>
<style></style>

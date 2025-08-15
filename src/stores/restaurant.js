// @/stores/restaurant.js
import api from '../axios';
import { ref } from 'vue';

const restaurantInfo = ref(null); // Changed to single object instead of array
const isLoading = ref(false);
const error = ref(null);
const success = ref(false);

// Fetch restaurant information
const getRestaurantInfo = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('restaurant');
    restaurantInfo.value = response.data;
    success.value = true;
  } catch (err) {
    console.error('Error fetching restaurant info:', err);
    restaurantInfo.value = null;
    error.value = err;
  } finally {
    isLoading.value = false;
  }
};

export {
  restaurantInfo,
  isLoading,
  error,
  success,
  getRestaurantInfo
};

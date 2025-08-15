import { ref } from 'vue';
import api from '../axios';

const categories = ref([]);
const isLoading = ref(false);
const error = ref(null);
const success = ref(null);

// Fetch categories with retry logic
const getCategories = async (retryCount = 0) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    const response = await api.get('categories');
    categories.value = response.data;
    success.value = 'Categories fetched successfully';
    console.log('Fetched categories:', categories.value);
  } catch (err) {
    // Retry logic for timeout errors
    if ((err.code === 'ECONNABORTED' || err.message.includes('timeout')) && retryCount < 2) {
      console.log(`Retrying categories fetch... Attempt ${retryCount + 1}/3`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return getCategories(retryCount + 1);
    }

    const errorMessage = err.code === 'ECONNABORTED'
      ? 'Server timeout - please check your connection and try again'
      : err.response?.data?.message || 'Failed to fetch categories';

    error.value = errorMessage;
    console.error('Error fetching categories:', err);
  } finally {
    isLoading.value = false;
  }
};
// delete category
const deleteCategory = async (id) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    await api.delete(`categories/${id}`);
    categories.value = categories.value.filter((category) => category.id !== id);
    success.value = 'Category deleted successfully';
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to delete category';
  } finally {
    isLoading.value = false;
  }
};
// Update category
const updateCategory = async (id, data) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    console.log('Updating category with data:', { id, data });

    // Categories use JSON data, not FormData, so regular PUT works fine
    const response = await api.put(`categories/${id}`, data);

    console.log('Category update response:', response.data);

    const index = categories.value.findIndex((category) => category.id == id);
    if (index !== -1) {
      categories.value[index] = response.data;
      console.log('Updated category in local store:', categories.value[index]);
    } else {
      console.warn('Category not found in local store, refreshing list');
    }

    // Refresh the entire list to ensure consistency
    await getCategories();
    success.value = 'Category updated successfully';

    return response.data;
  } catch (err) {
    console.error('Error updating category:', err);
    console.error('Error response:', err.response?.data);

    const errorMessage = err.response?.data?.message || 'Failed to update category';
    if (err.response?.data?.errors) {
      error.value = Object.values(err.response.data.errors).join(', ');
    } else {
      error.value = errorMessage;
    }
    throw err;
  } finally {
    isLoading.value = false;
  }
};
// Add new category
const addCategory = async (categoryData) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    let config = {};
    // If FormData, set correct headers
    if (categoryData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.post('categories', categoryData, config);
    await getCategories();
    success.value = 'Category added successfully';
    return response.data;
  } catch (err) {
    console.error('Category creation error:', err);
    console.error('Error response:', err.response?.data);
    console.error('Error status:', err.response?.status);

    // Handle validation errors
    if (err.response?.data?.errors) {
      const validationErrors = Object.values(err.response.data.errors).flat();
      error.value = validationErrors.join(', ');
    } else {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to add category';
    }

    // Re-throw the error so the component can handle it
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Reorder categories
const reorderCategories = async (orderedIds) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    console.log('Reordering categories with IDs:', orderedIds);

    const response = await api.post('categories/reorder', {
      ordered_ids: orderedIds
    });

    console.log('Reorder response:', response.data);

    // Refresh categories to get updated order
    await getCategories();
    success.value = 'Categories reordered successfully';

    return response.data;
  } catch (err) {
    console.error('Category reorder error:', err);
    console.error('Error response:', err.response?.data);

    error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to reorder categories';

    // Re-throw the error so the component can handle it
    throw err;
  } finally {
    isLoading.value = false;
  }
};

export { categories, isLoading, error, success, getCategories, deleteCategory, updateCategory, addCategory, reorderCategories };

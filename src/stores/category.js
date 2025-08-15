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

// Delete category
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

    // Log validation errors for debugging
    console.log('Validation check:');
    console.log('- name:', data.name);
    console.log('- description:', data.description);
    console.log('- image_url:', data.image_url);
    console.log('- display_order:', data.display_order);

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
    console.error('Validation errors:', err.response?.data?.errors);

    let errorMessage = 'Failed to update category';
    if (err.response?.data?.errors) {
      const validationErrors = Object.values(err.response.data.errors).flat();
      errorMessage = validationErrors.join(', ');
      error.value = errorMessage;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
      error.value = errorMessage;
    } else {
      error.value = errorMessage;
    }
    
    throw new Error(errorMessage);
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

// Enhanced reorder categories with client-side fallback as primary strategy
const reorderCategories = async (orderedIds) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    console.log('Reordering categories with IDs:', orderedIds);
    console.log('Current categories:', categories.value.map(c => ({ id: c.id, name: c.name?.en, order: c.display_order })));

    // Validate that all IDs exist in current categories
    const existingIds = categories.value.map(c => c.id);
    const invalidIds = orderedIds.filter(id => !existingIds.includes(id));
    
    if (invalidIds.length > 0) {
      throw new Error(`Invalid category IDs: ${invalidIds.join(', ')}`);
    }

    // Validate payload before sending
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new Error('Invalid ordered_ids: must be a non-empty array');
    }

    // Ensure all IDs are integers
    const sanitizedIds = orderedIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (sanitizedIds.length !== orderedIds.length) {
      throw new Error('All category IDs must be valid integers');
    }
    
    // PRIMARY STRATEGY: Use individual updates (most reliable)
    console.log('Using individual updates strategy for reordering...');
    const response = await updateCategoriesIndividually(sanitizedIds);
    
    // Refresh categories to get updated order
    await getCategories();
    success.value = 'Categories reordered successfully';

    return response;
    
  } catch (err) {
    console.error('Category reorder error:', err);
    
    let errorMessage = 'Failed to reorder categories';
    
    if (err.message.includes('All individual updates failed')) {
      errorMessage = 'Unable to update category order. Please check your connection and try again.';
    } else if (err.message.includes('Invalid')) {
      errorMessage = err.message;
    } else if (err.response?.status === 422) {
      errorMessage = 'Invalid category data. Please refresh and try again.';
    } else if (err.response?.data?.errors) {
      errorMessage = Object.values(err.response.data.errors).flat().join(', ');
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }

    error.value = errorMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Fallback function to update categories individually
const updateCategoriesIndividually = async (orderedIds) => {
  console.log('Attempting individual category updates...');
  
  const results = [];
  
  // Update categories one by one to avoid overwhelming the server
  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index];
    const category = categories.value.find(c => c.id === id);
    
    if (!category) {
      console.warn(`Category with ID ${id} not found, skipping...`);
      continue;
    }

    try {
      // Prepare update data with only the necessary fields
      const updateData = {
        name: category.name || { en: category.name?.en || 'Unnamed Category' },
        description: category.description || { en: category.description?.en || '' },
        display_order: index + 1
      };

      // Handle image_url - only include if it's a full URL to avoid validation errors
      if (category.image_url && category.image_url.startsWith('http')) {
        updateData.image_url = category.image_url;
      }
      // Skip relative paths to avoid backend validation errors

      console.log(`Updating category ${id} with order ${index + 1}:`, updateData);
      
      const response = await api.put(`categories/${id}`, updateData);
      results.push(response.data);
      
      // No delay needed for better performance
      
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error.response?.data || error.message);
      // Continue with other updates even if one fails
      continue;
    }
  }
  
  console.log(`Individual updates completed: ${results.length}/${orderedIds.length} successful`);
  
  if (results.length === 0) {
    throw new Error('All individual updates failed');
  }
  
  return { message: `Categories reordered individually (${results.length}/${orderedIds.length} successful)` };
};

// Utility function to check if reorder endpoint exists
const checkReorderEndpoint = async () => {
  try {
    // Try a test request to see if the endpoint exists
    await api.options('categories/reorder');
    return true;
  } catch (err) {
    if (err.response?.status === 405) {
      // Method not allowed means endpoint exists but OPTIONS isn't supported
      return true;
    }
    return false;
  }
};

// Debug function to get API information
const debugApiInfo = async () => {
  try {
    console.log('=== API DEBUG INFO ===');
    console.log('Base URL:', api.defaults.baseURL);
    console.log('Default headers:', api.defaults.headers);
    
    // Check available endpoints
    const endpoints = [
      'categories',
      'categories/reorder', 
      'categories/update-order',
      'categories/sort'
    ];

    for (const endpoint of endpoints) {
      try {
        await api.options(endpoint);
        console.log(`✓ ${endpoint} - Available`);
      } catch (err) {
        const status = err.response?.status;
        if (status === 405) {
          console.log(`✓ ${endpoint} - Exists (OPTIONS not allowed)`);
        } else if (status === 404) {
          console.log(`✗ ${endpoint} - Not found`);
        } else {
          console.log(`? ${endpoint} - Status: ${status}`);
        }
      }
    }
    
    console.log('=== END DEBUG INFO ===');
  } catch (err) {
    console.error('Debug info failed:', err);
  }
};

export { 
  categories, 
  isLoading, 
  error, 
  success, 
  getCategories, 
  deleteCategory, 
  updateCategory, 
  addCategory, 
  reorderCategories,
  checkReorderEndpoint,
  debugApiInfo
};
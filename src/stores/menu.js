import { ref } from 'vue';
import api from '../axios';

const menus = ref([]);
const isLoading = ref(false);
const error = ref(null);
const success = ref(null);

// Fetch menus/items with retry logic
const getMenus = async (retryCount = 0) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    const response = await api.get('items');

    // Handle both array and object responses
    if (Array.isArray(response.data)) {
      menus.value = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      menus.value = response.data.data;
    } else if (response.data.items && Array.isArray(response.data.items)) {
      menus.value = response.data.items;
    } else {
      menus.value = [];
    }

    success.value = 'Menus fetched successfully';
    return menus.value;
  } catch (err) {
    // Retry logic for timeout errors
    if ((err.code === 'ECONNABORTED' || err.message.includes('timeout')) && retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return getMenus(retryCount + 1);
    }

    const errorMessage = err.code === 'ECONNABORTED'
      ? 'Server timeout - please check your connection and try again'
      : err.response?.data?.message || err.response?.data?.error || 'Failed to fetch menus';

    error.value = errorMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Get single menu item
const getMenuItem = async (id) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    const response = await api.get(`items/${id}`);
    success.value = 'Menu item fetched successfully';
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to fetch menu item';
    error.value = errorMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Delete menu
const deleteMenu = async (id) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    await api.delete(`items/${id}`);

    // Remove from local array
    menus.value = menus.value.filter((menu) => menu.id !== id);
    success.value = 'Menu deleted successfully';

    return true;
  } catch (err) {
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to delete menu';
    error.value = errorMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Update menu
const updateMenu = async (id, data) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {

    // Use POST with _method=PUT for proper Laravel FormData handling
    const response = await api.post(`items/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });


    // Update the specific item in menus.value with the response data
    const updatedItem = response.data;
    const index = menus.value.findIndex((menu) => menu.id == id);
    if (index !== -1) {
      // Merge the updated data with existing item
      menus.value.splice(index, 1, { ...menus.value[index], ...updatedItem });
    } else {
    }

    // Refresh the entire list to ensure consistency
    await getMenus();
    success.value = 'Menu updated successfully';

    return updatedItem;
  } catch (err) {

    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to update menu';
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

// Add new menu
const addMenu = async (menuData) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {

    const response = await api.post('items', menuData);

    // Add to local array
    menus.value.push(response.data);
    success.value = 'Menu added successfully';

    return response.data;
  } catch (err) {

    // Handle validation errors
    if (err.response?.data?.errors) {
      const validationErrors = Object.values(err.response.data.errors).flat();
      error.value = validationErrors.join(', ');
    } else {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to add menu';
    }

    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Reorder menus
const reorderMenus = async (orderedIds) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {

    const response = await api.post('items/reorder', {
      ordered_ids: orderedIds
    });


    // Refresh items to get updated order
    await getMenus();
    success.value = 'Items reordered successfully';

    return response.data;
  } catch (err) {

    error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to reorder items';
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Toggle menu item availability
const toggleAvailability = async (id, isAvailable) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    const response = await api.patch(`items/${id}`, {
      is_available: isAvailable
    });

    // Update in local array
    const index = menus.value.findIndex((menu) => menu.id === id);
    if (index !== -1) {
      menus.value[index] = { ...menus.value[index], is_available: isAvailable };
    }

    success.value = `Menu item ${isAvailable ? 'enabled' : 'disabled'} successfully`;
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to update menu availability';
    error.value = errorMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Bulk delete menus
const bulkDeleteMenus = async (ids) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    const response = await api.post('items/bulk-delete', {
      ids: ids
    });

    // Remove from local array
    menus.value = menus.value.filter((menu) => !ids.includes(menu.id));
    success.value = `${ids.length} menu items deleted successfully`;

    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to delete menu items';
    error.value = errorMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Search menus
const searchMenus = async (query, filters = {}) => {
  isLoading.value = true;
  error.value = null;
  success.value = null;

  try {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (filters.category) params.append('category', filters.category);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.is_available !== undefined) params.append('is_available', filters.is_available);

    const response = await api.get(`items?${params.toString()}`);

    // Handle response format
    let items = [];
    if (Array.isArray(response.data)) {
      items = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      items = response.data.data;
    } else if (response.data.items && Array.isArray(response.data.items)) {
      items = response.data.items;
    }

    success.value = 'Search completed successfully';
    return items;
  } catch (err) {
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to search menu items';
    error.value = errorMessage;
    throw err;
  } finally {
    isLoading.value = false;
  }
};

// Get menu categories
const getMenuCategories = async () => {
  try {
    const response = await api.get('menu-categories');

    // Handle response format
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data.categories && Array.isArray(response.data.categories)) {
      return response.data.categories;
    }

    return [];
  } catch (err) {
    return [];
  }
};

// Clear error and success messages
const clearMessages = () => {
  error.value = null;
  success.value = null;
};

// Helper function to format menu item data for display
const formatMenuItemForDisplay = (item) => {
  return {
    ...item,
    displayName: getDisplayText(item.name),
    displayDescription: getDisplayText(item.description),
    formattedPrice: parseFloat(item.base_price || 0).toFixed(2),
    formattedCreatedAt: formatDate(item.created_at),
    formattedUpdatedAt: formatDate(item.updated_at)
  };
};

// Helper function to get display text from multilingual object
const getDisplayText = (textObj, preferredLang = 'en') => {
  if (!textObj) return '';

  if (typeof textObj === 'string') return textObj;

  if (typeof textObj === 'object') {
    return textObj[preferredLang] ||
      textObj.en ||
      textObj.ar ||
      textObj.fr ||
      Object.values(textObj)[0] ||
      '';
  }

  return String(textObj);
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Sample data for testing
const updateData = {
  name: { en: 'English', fr: 'French', ar: 'Arabic' },
  description: { en: '...', fr: '...', ar: '...' },
  base_price: 99.99,
  menu_category_id: 1,
  is_available: true,
  image_url: 'https://example.com/image.jpg'
};

export {
  menus,
  isLoading,
  error,
  success,
  getMenus,
  getMenuItem,
  deleteMenu,
  updateMenu,
  addMenu,
  reorderMenus,
  toggleAvailability,
  bulkDeleteMenus,
  searchMenus,
  getMenuCategories,
  clearMessages,
  formatMenuItemForDisplay,
  getDisplayText,
  formatDate
};

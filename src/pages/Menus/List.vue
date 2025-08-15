<template>
  <div>
    <!-- Page Header -->
    <div class="row">
      <div class="col-12">
        <card class="card-chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6 text-left">
                <h2 class="card-title">Menu Items</h2>
                <p class="card-category">
                  <i class="tim-icons icon-app text-primary"></i>
                  Manage your restaurant menu items
                </p>
              </div>
              <div class="col-sm-6">
                <div class="btn-group-toggle float-right" data-toggle="buttons">
                  <router-link to="/menus/add" class="btn btn-sm btn-primary btn-simple">
                    <i class="tim-icons icon-simple-add"></i>
                    Add New Menu Item
                  </router-link>
                </div>
              </div>
            </div>
          </template>
        </card>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="row">
      <div class="col-12">
        <card>
          <div class="row">
            <div class="col-md-4">
              <base-input
                placeholder="Search menu items..."
                v-model="searchQuery"
                @input="filterMenuItems"
              >
                <template slot="prepend">
                  <span class="input-group-text">
                    <i class="tim-icons icon-zoom-split"></i>
                  </span>
                </template>
              </base-input>
            </div>
            <div class="col-md-3">
              <select
                class="form-control"
                v-model="selectedCategory"
                @change="filterMenuItems"
              >
                <option value="">All Categories</option>
                <option v-for="category in availableCategories" :key="category.id" :value="category.id">
                  {{ getCategoryDisplayName(category) }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <select
                class="form-control"
                v-model="priceRange"
                @change="filterMenuItems"
              >
                <option value="">All Prices</option>
                <option value="0-10">$0 - $10</option>
                <option value="10-20">$10 - $20</option>
                <option value="20-50">$20 - $50</option>
                <option value="50+">$50+</option>
              </select>
            </div>
            <div class="col-md-3">
              <div class="d-flex justify-content-end align-items-center">
                <span class="text-muted mr-2">{{ filteredMenuItems.length }} items found</span>
                <base-button
                  type="info"
                  size="sm"
                  @click="refreshMenuItems"
                  :disabled="loading"
                >
                  <i class="tim-icons icon-refresh-01" :class="{ 'fa-spin': loading }"></i>
                  Refresh
                </base-button>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>

    <!-- Menu Items Table -->
    <div class="row" v-if="!loading">
      <div class="col-12">
        <card>
          <!-- Desktop Table View -->
          <div class="table-responsive d-none d-lg-block">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th style="width: 80px;">Image</th>
                  <th style="width: 180px;">Name</th>
                  <th style="width: 120px;">Category</th>
                  <th style="width: 100px;">Price</th>
                  <th>Description</th>
                  <th style="width: 80px;">Status</th>
                  <th style="width: 120px;">Created</th>
                  <th style="width: 180px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="menuItem in paginatedMenuItems" :key="menuItem.id">
                  <td>
                    <img
                      :src="`https://oscoapi-hjtj1.sevalla.app/storage${menuItem.image_url}`"
                      :alt="getMenuItemName(menuItem)"
                      class="table-image"
                    />
                  </td>
                  <td>
                    <strong>{{ getMenuItemName(menuItem) }}</strong>
                  </td>
                  <td>
                    <span class="badge badge-primary">{{ getCategoryName(menuItem) }}</span>
                  </td>
                  <td>
                    <span class="text-success font-weight-bold">{{ parseFloat(menuItem.base_price || 0).toFixed(2) }} MAD</span>
                  </td>
                  <td>
                    <span class="text-muted">{{ truncateText(getMenuItemDescription(menuItem), 50) }}</span>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="menuItem.is_available ? 'badge-success' : 'badge-danger'"
                    >
                      {{ menuItem.is_available ? 'Available' : 'Unavailable' }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ formatDate(menuItem.created_at) }}
                    </small>
                  </td>
                  <td>
                    <div class="btn-group-vertical btn-group-sm" role="group">
                      <base-button
                        type="info"
                        size="sm"
                        @click="viewDetails(menuItem)"
                        title="View Details"
                        class="mb-1"
                      >
                        <i class="tim-icons icon-zoom-split"></i>
                      </base-button>
                      <base-button
                        type="warning"
                        size="sm"
                        @click="editMenuItem(menuItem)"
                        title="Edit Menu Item"
                        class="mb-1"
                      >
                        <i class="tim-icons icon-pencil"></i>
                      </base-button>
                      <base-button
                        type="danger"
                        size="sm"
                        @click="confirmDelete(menuItem)"
                        title="Delete Menu Item"
                      >
                        <i class="tim-icons icon-simple-remove"></i>
                      </base-button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="d-lg-none">
            <div class="mobile-card" v-for="menuItem in paginatedMenuItems" :key="menuItem.id">
              <div class="row no-gutters">
                <div class="col-4">
                  <img
                    :src="`https://oscoapi-hjtj1.sevalla.app/storage${menuItem.image_url}`"
                    :alt="getMenuItemName(menuItem)"
                    class="mobile-image"
                  />
                </div>
                <div class="col-8">
                  <div class="mobile-card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h6 class="mobile-card-title mb-0">{{ getMenuItemName(menuItem) }}</h6>
                      <span class="text-success font-weight-bold">{{ parseFloat(menuItem.base_price || 0).toFixed(2) }} MAD</span>
                    </div>
                    <div class="mb-2">
                      <span class="badge badge-primary badge-sm mr-2">{{ getCategoryName(menuItem) }}</span>
                      <span
                        class="badge badge-sm"
                        :class="menuItem.is_available ? 'badge-success' : 'badge-danger'"
                      >
                        {{ menuItem.is_available ? 'Available' : 'Unavailable' }}
                      </span>
                    </div>
                    <p class="mobile-card-text">{{ truncateText(getMenuItemDescription(menuItem), 80) }}</p>
                    <div class="mobile-card-meta mb-2">
                      <small class="text-muted">
                        {{ formatDate(menuItem.created_at) }}
                      </small>
                    </div>
                    <div class="mobile-actions">
                      <base-button
                        type="info"
                        size="sm"
                        @click="viewDetails(menuItem)"
                        title="View Details"
                        class="mr-1"
                      >
                        <i class="tim-icons icon-zoom-split"></i>
                      </base-button>
                      <base-button
                        type="warning"
                        size="sm"
                        @click="editMenuItem(menuItem)"
                        title="Edit Menu Item"
                        class="mr-1"
                      >
                        <i class="tim-icons icon-pencil"></i>
                      </base-button>
                      <base-button
                        type="danger"
                        size="sm"
                        @click="confirmDelete(menuItem)"
                        title="Delete Menu Item"
                      >
                        <i class="tim-icons icon-simple-remove"></i>
                      </base-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>

    <!-- Loading State -->
    <div class="row" v-if="loading">
      <div class="col-12">
        <card>
          <div class="text-center py-5">
            <i class="fa fa-spinner fa-spin fa-3x text-primary mb-3"></i>
            <h4>Loading menu items...</h4>
          </div>
        </card>
      </div>
    </div>

    <!-- Empty State -->
    <div class="row" v-if="!loading && filteredMenuItems.length === 0">
      <div class="col-12">
        <card>
          <div class="text-center py-5">
            <i class="tim-icons icon-app fa-3x text-muted mb-3"></i>
            <h4>No menu items found</h4>
            <p class="text-muted">{{ searchQuery || selectedCategory || priceRange ? 'Try adjusting your search criteria' : 'Start by creating your first menu item' }}</p>
            <router-link to="/menus/add" class="btn btn-primary" v-if="!searchQuery && !selectedCategory && !priceRange">
              <i class="tim-icons icon-simple-add"></i>
              Add New Menu Item
            </router-link>
          </div>
        </card>
      </div>
    </div>

    <!-- Error State -->
    <div class="row" v-if="errorMessage && !loading">
      <div class="col-12">
        <card>
          <div class="text-center py-5">
            <i class="tim-icons icon-alert-circle-exc fa-3x text-danger mb-3"></i>
            <h4>Error Loading Menu Items</h4>
            <p class="text-muted">{{ errorMessage }}</p>
            <base-button type="primary" @click="refreshMenuItems">
              <i class="tim-icons icon-refresh-01"></i>
              Try Again
            </base-button>
          </div>
        </card>
      </div>
    </div>

    <!-- Pagination -->
    <div class="row" v-if="totalPages > 1">
      <div class="col-12">
        <card>
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <small class="text-muted">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredMenuItems.length) }} of {{ filteredMenuItems.length }} menu items
              </small>
            </div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" @click="changePage(currentPage - 1)" href="#">
                    <i class="tim-icons icon-double-left"></i>
                  </a>
                </li>
                <li
                  class="page-item"
                  v-for="page in visiblePages"
                  :key="page"
                  :class="{ active: page === currentPage }"
                >
                  <a class="page-link" @click="changePage(page)" href="#">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" @click="changePage(currentPage + 1)" href="#">
                    <i class="tim-icons icon-double-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </card>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <modal :show="showDeleteModal" @close="showDeleteModal = false">
      <template slot="header">
        <h4 class="modal-title text-danger">
          <i class="tim-icons icon-alert-circle-exc"></i>
          Confirm Delete
        </h4>
      </template>
      <div v-if="menuItemToDelete">
        <p>Are you sure you want to delete the menu item <strong>"{{ getMenuItemName(menuItemToDelete) }}"</strong>?</p>
        <p class="text-muted">This action cannot be undone.</p>
      </div>
      <template slot="footer">
        <base-button type="secondary" @click="showDeleteModal = false">Cancel</base-button>
        <base-button
          type="danger"
          @click="deleteMenuItem"
          :disabled="deleting"
        >
          <i class="fa fa-spinner fa-spin" v-if="deleting"></i>
          <i class="tim-icons icon-simple-remove" v-else></i>
          {{ deleting ? 'Deleting...' : 'Delete' }}
        </base-button>
      </template>
    </modal>

    <!-- Menu Item Details Modal -->
    <modal :show="showDetailsModal" @close="showDetailsModal = false" size="lg">
      <template slot="header">
        <h4 class="modal-title">
          <i class="tim-icons icon-zoom-split text-info"></i>
          Menu Item Details
        </h4>
      </template>
      <div v-if="selectedMenuItem" class="menu-item-details">
        <div class="row">
          <div class="col-md-6">
            <img
              :src="`https://oscoapi-hjtj1.sevalla.app/storage${selectedMenuItem.image_url}`"
              :alt="getMenuItemName(selectedMenuItem)"
              class="img-fluid rounded"
            />
          </div>
          <div class="col-md-6">
            <h3>{{ getMenuItemName(selectedMenuItem) }}</h3>
            <p class="text-primary h4">{{ parseFloat(selectedMenuItem.base_price || 0).toFixed(2) }} MAD</p>
            <span class="badge badge-primary mb-3">{{ getCategoryName(selectedMenuItem) }}</span>
            <span
              class="badge mb-3 ml-2"
              :class="selectedMenuItem.is_available ? 'badge-success' : 'badge-danger'"
            >
              {{ selectedMenuItem.is_available ? 'Available' : 'Unavailable' }}
            </span>
            <p class="text-muted">{{ getMenuItemDescription(selectedMenuItem) }}</p>
            <hr>
            <div class="menu-item-info">
              <div class="info-item">
                <strong>Restaurant ID:</strong>
                <span class="ml-2">{{ selectedMenuItem.restaurant_id }}</span>
              </div>
              <div class="info-item">
                <strong>Category ID:</strong>
                <span class="ml-2">{{ selectedMenuItem.menu_category_id }}</span>
              </div>
              <div class="info-item">
                <strong>Created:</strong>
                <span class="ml-2">{{ formatDate(selectedMenuItem.created_at) }}</span>
              </div>
              <div class="info-item">
                <strong>Last Updated:</strong>
                <span class="ml-2">{{ formatDate(selectedMenuItem.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template slot="footer">
        <base-button type="secondary" @click="showDetailsModal = false">Close</base-button>
        <base-button
          type="warning"
          @click="editMenuItem(selectedMenuItem)"
          v-if="selectedMenuItem"
        >
          <i class="tim-icons icon-pencil"></i>
          Edit Menu Item
        </base-button>
      </template>
    </modal>

    <!-- Edit Menu Item Modal -->
    <modal :show="showEditModal" @close="cancelEdit" size="xl">
      <template slot="header">
        <h4 class="modal-title">
          <i class="tim-icons icon-pencil text-warning"></i>
          Edit Menu Item
        </h4>
      </template>
      <div v-if="editingMenuItem" class="edit-menu-form">
        <form @submit.prevent="updateMenuItem">
          <div class="row">
            <!-- Left Column -->
            <div class="col-md-6">
              <!-- Name Fields -->
              <div class="form-group">
                <label class="form-control-label">Name (English) *</label>
                <base-input
                  v-model="editForm.name.en"
                  placeholder="Enter name in English"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-control-label">Name (French)</label>
                <base-input
                  v-model="editForm.name.fr"
                  placeholder="Enter name in French"
                />
              </div>

              <div class="form-group">
                <label class="form-control-label">Name (Arabic)</label>
                <base-input
                  v-model="editForm.name.ar"
                  placeholder="Enter name in Arabic"
                />
              </div>

              <!-- Price and Category -->
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-control-label">Price (MAD) *</label>
                    <base-input
                      v-model="editForm.base_price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-control-label">Category *</label>
                    <select
                      v-model="editForm.menu_category_id"
                      class="form-control"
                      required
                    >
                      <option value="">Select Category</option>
                      <option
                        v-for="category in availableCategories"
                        :key="category.id"
                        :value="category.id"
                      >
                        {{ getCategoryDisplayName(category) }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Image URL -->
              <div class="form-group">
                <label class="form-control-label">Image URL</label>
                <base-input
                  v-model="editForm.image_url"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <!-- Availability -->
              <div class="form-group">
                <div class="custom-control custom-checkbox">
                  <input
                    id="editAvailable"
                    v-model="editForm.is_available"
                    type="checkbox"
                    class="custom-control-input"
                  >
                  <label class="custom-control-label" for="editAvailable">
                    Available for ordering
                  </label>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="col-md-6">
              <!-- Description Fields -->
              <div class="form-group">
                <label class="form-control-label">Description (English)</label>
                <textarea
                  v-model="editForm.description.en"
                  class="form-control"
                  rows="3"
                  placeholder="Enter description in English"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-control-label">Description (French)</label>
                <textarea
                  v-model="editForm.description.fr"
                  class="form-control"
                  rows="3"
                  placeholder="Enter description in French"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-control-label">Description (Arabic)</label>
                <textarea
                  v-model="editForm.description.ar"
                  class="form-control"
                  rows="3"
                  placeholder="Enter description in Arabic"
                ></textarea>
              </div>

              <!-- Image Preview -->
              <div class="form-group" v-if="editForm.image_url">
                <label class="form-control-label">Image Preview</label>
                <div class="image-preview">
                  <img
                    :src="`https://oscoapi-hjtj1.sevalla.app/storage${editForm.image_url}`"
                    :alt="editForm.name.en"
                    class="img-fluid rounded"
                    style="max-height: 200px; width: auto;"
                  />
                </div>
              </div>

              <!-- Image Upload -->
              <div class="form-group">
                <label class="form-control-label">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  @change="onEditImageChange"
                  class="form-control"
                />
                <small class="text-muted">Allowed types: jpeg, png, jpg, gif</small>
              </div>
            </div>
          </div>
        </form>
      </div>
      <template slot="footer">
        <base-button type="secondary" @click="cancelEdit" :disabled="updating">
          Cancel
        </base-button>
        <base-button
          type="warning"
          @click="updateMenuItem"
          :disabled="updating || !editForm.name.en || !editForm.base_price || !editForm.menu_category_id"
        >
          <i class="fa fa-spinner fa-spin" v-if="updating"></i>
          <i class="tim-icons icon-check-2" v-else></i>
          {{ updating ? 'Updating...' : 'Update Menu Item' }}
        </base-button>
      </template>
    </modal>
  </div>
</template>

<script>
import { BaseInput, BaseButton, Card, Modal } from '@/components';
import { menus, isLoading, error, success, getMenus, deleteMenu, updateMenu } from '@/stores/menu';
import { categories, getCategories } from '@/stores/category';

export default {
  name: 'MenusList',
  components: {
    BaseInput,
    BaseButton,
    Card,
    Modal
  },
  data() {
    return {
      filteredMenuItems: [],
      searchQuery: '',
      selectedCategory: '',
      priceRange: '',
      deleting: false,
      showDeleteModal: false,
      showDetailsModal: false,
      showEditModal: false,
      menuItemToDelete: null,
      selectedMenuItem: null,
      editingMenuItem: null,
      updating: false,
      editForm: {
        name: { en: '', fr: '', ar: '' },
        description: { en: '', fr: '', ar: '' },
        base_price: '',
        menu_category_id: '',
        is_available: true,
        image_url: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      errorMessage: null
    }
  },
  computed: {
    menuItems() {
      return menus.value || [];
    },
    loading() {
      return isLoading.value;
    },
    availableCategories() {
      return categories.value || [];
    },
    totalPages() {
      return Math.ceil(this.filteredMenuItems.length / this.itemsPerPage);
    },
    paginatedMenuItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredMenuItems.slice(start, end);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  watch: {
    menuItems: {
      handler(newItems) {
        this.filteredMenuItems = [...newItems];
      },
      immediate: true
    },
    error: {
      handler(newError) {
        this.errorMessage = newError;
      },
      immediate: true
    }
  },
  methods: {
    async loadMenuItems() {
      try {
        await getMenus();
        this.errorMessage = null;
      } catch (err) {
        console.error('Error loading menu items:', err);
        this.errorMessage = 'Failed to load menu items. Please try again.';
      }
    },

    getMenuItemName(menuItem) {
      if (!menuItem || !menuItem.name) return 'Unnamed Item';

      // Handle different language versions
      if (typeof menuItem.name === 'object') {
        return menuItem.name.en || menuItem.name.en || menuItem.name.fr || 'Unnamed Item';
      }

      return menuItem.name;
    },

    getMenuItemDescription(menuItem) {
      if (!menuItem || !menuItem.description) return 'No description available';

      // Handle different language versions
      if (typeof menuItem.description === 'object') {
        return menuItem.description.en || menuItem.description.en || menuItem.description.fr || 'No description available';
      }

      return menuItem.description;
    },

    getCategoryName(menuItem) {
      if (!menuItem.menu_category_id) return 'Uncategorized';

      const category = this.availableCategories.find(cat => cat.id === menuItem.menu_category_id);
      if (category) {
        return this.getCategoryDisplayName(category);
      }

      return `Category ${menuItem.menu_category_id}`;
    },

    getCategoryDisplayName(category) {
      if (!category || !category.name) return 'Unnamed Category';

      // Handle different language versions
      if (typeof category.name === 'object') {
        return category.name.en || category.name.fr || category.name.ar || 'Unnamed Category';
      }

      return category.name;
    },

    async loadCategories() {
      try {
        await getCategories();
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    },

    filterMenuItems() {
      let filtered = [...this.menuItems];

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => {
          const name = this.getMenuItemName(item).toLowerCase();
          const description = this.getMenuItemDescription(item).toLowerCase();
          const category = this.getCategoryName(item).toLowerCase();

          return name.includes(query) ||
                 description.includes(query) ||
                 category.includes(query);
        });
      }

      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(item =>
          item.menu_category_id && item.menu_category_id.toString() === this.selectedCategory.toString()
        );
      }

      // Filter by price range
      if (this.priceRange) {
        filtered = filtered.filter(item => {
          const price = parseFloat(item.base_price || 0);
          switch (this.priceRange) {
            case '0-10':
              return price >= 0 && price <= 10;
            case '10-20':
              return price > 10 && price <= 20;
            case '20-50':
              return price > 20 && price <= 50;
            case '50+':
              return price > 50;
            default:
              return true;
          }
        });
      }

      this.filteredMenuItems = filtered;
      this.currentPage = 1; // Reset to first page when filtering
    },

    refreshMenuItems() {
      this.loadMenuItems();
    },

    viewDetails(menuItem) {
      this.selectedMenuItem = menuItem;
      this.showDetailsModal = true;
    },

    editMenuItem(menuItem) {
      this.editingMenuItem = menuItem;
      this.populateEditForm(menuItem);
      this.showEditModal = true;
    },

    populateEditForm(menuItem) {
      // Handle multilingual name
      if (typeof menuItem.name === 'object') {
        this.editForm.name = {
          en: menuItem.name.en || '',
          fr: menuItem.name.fr || '',
          ar: menuItem.name.ar || ''
        };
      } else {
        this.editForm.name = {
          en: menuItem.name || '',
          fr: '',
          ar: ''
        };
      }

      // Handle multilingual description
      if (typeof menuItem.description === 'object') {
        this.editForm.description = {
          en: menuItem.description.en || '',
          fr: menuItem.description.fr || '',
          ar: menuItem.description.ar || ''
        };
      } else {
        this.editForm.description = {
          en: menuItem.description || '',
          fr: '',
          ar: ''
        };
      }

      this.editForm.base_price = menuItem.base_price || '';
      this.editForm.menu_category_id = menuItem.menu_category_id || '';
      this.editForm.is_available = menuItem.is_available !== false;
      this.editForm.image_url = menuItem.image_url || '';
    },

async updateMenuItem() {
  if (!this.editingMenuItem) return;

  this.updating = true;
  try {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Only if backend requires this
    formData.append('restaurant_id', this.editingMenuItem.restaurant_id || 1); // Ensure this matches your API
    formData.append('menu_category_id', this.editForm.menu_category_id);

    // Add all name fields
    formData.append('name[en]', this.editForm.name.en || '');
    formData.append('name[fr]', this.editForm.name.fr || '');
    if (this.editForm.name.ar) {
      formData.append('name[ar]', this.editForm.name.ar);
    }

    // Add all description fields (this was missing!)
    formData.append('description[en]', this.editForm.description.en || '');
    formData.append('description[fr]', this.editForm.description.fr || '');
    if (this.editForm.description.ar) {
      formData.append('description[ar]', this.editForm.description.ar);
    }

    formData.append('base_price', parseFloat(this.editForm.base_price));
    formData.append('is_available', this.editForm.is_available ? 1 : 0);

    // Handle image upload
    if (this.editForm.image_file) {
      formData.append('image_url', this.editForm.image_file);
    } else if (this.editForm.image_url) {
      formData.append('image_url', this.editForm.image_url);
    }

    console.log('Updating menu item with data:', {
      id: this.editingMenuItem.id,
      formData: Object.fromEntries(formData)
    });

    await updateMenu(this.editingMenuItem.id, formData);
    this.showSuccessNotification('Menu item updated successfully!');
    this.showEditModal = false;
    this.editingMenuItem = null;
    this.resetEditForm(); // Reset form after success
    await this.loadMenuItems(); // Force reload to ensure UI reflects changes
  } catch (error) {
    console.error('Error updating menu item:', error.response?.data);
    let msg = 'Failed to update menu item';
    if (error.response?.data?.errors) {
      msg = Object.values(error.response.data.errors).join(' ');
    } else if (error.response?.data?.message) {
      msg = error.response.data.message;
    }
    this.showErrorNotification(msg);
  } finally {
    this.updating = false;
  }
},
    cancelEdit() {
      this.showEditModal = false;
      this.editingMenuItem = null;
      this.resetEditForm();
    },

    resetEditForm() {
      this.editForm = {
        name: { en: '', fr: '', ar: '' },
        description: { en: '', fr: '', ar: '' },
        base_price: '',
        menu_category_id: '',
        is_available: true,
        image_url: ''
      };
    },

    confirmDelete(menuItem) {
      this.menuItemToDelete = menuItem;
      this.showDeleteModal = true;
    },

    async deleteMenuItem() {
      if (!this.menuItemToDelete) return;

      this.deleting = true;
      try {
        await deleteMenu(this.menuItemToDelete.id);
        this.showSuccessNotification('Menu item deleted successfully!');
        this.showDeleteModal = false;
        this.menuItemToDelete = null;
      } catch (error) {
        console.error('Error deleting menu item:', error);
        this.showErrorNotification('Failed to delete menu item');
      } finally {
        this.deleting = false;
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    showSuccessNotification(message) {
      this.$notify({
        type: 'success',
        icon: 'tim-icons icon-check-2',
        message: message
      });
    },

    showErrorNotification(message) {
      this.$notify({
        type: 'danger',
        icon: 'tim-icons icon-simple-remove',
        message: message
      });
    },

    onEditImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.editForm.image_file = file;
        this.editForm.image_url = URL.createObjectURL(file); // For preview
      }
    }
  },

  async mounted() {
    await Promise.all([
      this.loadMenuItems(),
      this.loadCategories()
    ]);
  }
};
</script>

<style scoped>
.table-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #525f7f;
  background-color: #f8f9fe;
  padding: 1rem 0.75rem;
}

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.btn-group .btn {
  margin-right: 0.25rem;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.btn-group-vertical .btn {
  margin-bottom: 0.25rem;
}

.btn-group-vertical .btn:last-child {
  margin-bottom: 0;
}

/* Mobile Card Styles */
.mobile-card {
  background: #fff;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.mobile-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mobile-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.mobile-card-body {
  padding: 1rem;
}

.mobile-card-title {
  font-weight: 600;
  color: #525f7f;
  font-size: 1rem;
}

.mobile-card-text {
  font-size: 0.875rem;
  color: #8898aa;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.mobile-card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.mobile-actions {
  display: flex;
  gap: 0.25rem;
}

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

@media (max-width: 576px) {
  .mobile-actions {
    flex-direction: column;
  }

  .mobile-actions .btn {
    margin-right: 0 !important;
    margin-bottom: 0.25rem;
  }

  .mobile-actions .btn:last-child {
    margin-bottom: 0;
  }

  .mobile-card-body {
    padding: 0.75rem;
  }
}

.menu-item-details .info-item {
  margin-bottom: 0.5rem;
}

.pagination .page-link {
  color: #1d8cf8;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #1d8cf8;
  border-color: #1d8cf8;
}

.pagination .page-link:hover {
  color: #0c5aa6;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-menu-form .form-group {
  margin-bottom: 1.5rem;
}

.edit-menu-form .form-control-label {
  font-weight: 600;
  color: #525f7f;
  margin-bottom: 0.5rem;
}

.edit-menu-form .custom-control {
  padding-left: 1.5rem;
}

.edit-menu-form .custom-control-label {
  font-weight: 500;
  color: #525f7f;
}

.image-preview {
  text-align: center;
  padding: 1rem;
  border: 2px dashed #e3e3e3;
  border-radius: 8px;
  background-color: #f8f9fe;
}

.image-preview img {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>

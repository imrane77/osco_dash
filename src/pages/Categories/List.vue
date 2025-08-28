<template>
  <div>
    <!-- Page Header -->
    <div class="row">
      <div class="col-12">
        <card class="card-chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6 text-left">
                <h2 class="card-title">Categories</h2>
                <p class="card-category">
                  <i class="tim-icons icon-puzzle-10 text-primary" aria-hidden="true"></i>
                  Manage your item categories
                </p>
              </div>
              <div class="col-sm-6">
                <div class="btn-group-toggle d-flex justify-content-sm-end justify-content-center mt-3 mt-sm-0" data-toggle="buttons">
                  <router-link to="/categories/add" class="btn btn-sm btn-primary btn-simple">
                    <i class="tim-icons icon-simple-add" aria-hidden="true"></i>
                    <span class="d-none d-md-inline ml-1">Add New Category</span>
                    <span class="d-md-none ml-1">Add</span>
                  </router-link>
                </div>
              </div>
            </div>
          </template>
        </card>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="row mb-3">
      <div class="col-lg-6 col-md-8 col-sm-12 mx-auto">
        <base-input
          v-model="searchTerm"
          placeholder="Search categories..."
          icon="tim-icons icon-zoom-split"
          class="w-100"
        />
      </div>
    </div>

    <!-- Refresh Button -->
    <div class="row">
      <div class="col-12">
        <card>
          <div class="d-flex justify-content-end align-items-center">
            <base-button
              type="info"
              size="sm"
              @click="refreshCategories"
              :disabled="isLoading"
              aria-label="Refresh categories"
            >
              <i class="tim-icons icon-refresh-01" :class="{ 'fa-spin': isLoading }" aria-hidden="true"></i>
              Refresh
            </base-button>
          </div>
        </card>
      </div>
    </div>

    <!-- Categories Table/Cards -->
    <div class="row" v-if="!isLoading && filteredCategories.length > 0">
      <div class="col-12">
        <!-- Desktop Table View -->
        <div class="d-none d-lg-block">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>
                    <i class="tim-icons icon-bullet-list-67 mr-1"></i>
                    Image
                  </th>
                  <th>Name</th>
                  <th>Display Order</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(category, index) in paginatedCategories"
                  :key="category.id"
                  :data-id="category.id"
                  :data-index="index"
                  draggable="true"
                  @dragstart="handleDragStart($event, category, index)"
                  @dragover="handleDragOver"
                  @drop="handleDrop($event, index)"
                  @dragend="handleDragEnd"
                  :class="{ 'dragging': draggedItem && draggedItem.id === category.id, 'drag-over': dragOverIndex === index }"
                  class="draggable-row"
                >
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="tim-icons icon-bullet-list-67 drag-handle mr-2 text-muted" title="Drag to reorder"></i>
                      <img
                        :src="getImageUrl(category.image_url)"
                        :alt="category.name.en"
                        class="table-image clickable-image"
                        @error="handleImageError($event, category)"
                        @load="handleImageLoad($event, category)"
                        @click="previewImage(category)"
                        title="Click to preview"
                      />
                    </div>
                  </td>
                  <td>
                    <strong>{{ category.name.en }}</strong>
                  </td>
                  <td class="text-center">
                    <span class="text-muted">{{ category.display_order }}</span>
                  </td>
                  <td>
                    <span class="text-muted">{{ truncateText(category.description.en, 80) }}</span>
                  </td>
                  <td class="text-center">
                    <span class="text-muted">{{ formatDate(category.created_at) }}</span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group" role="group">
                      <base-button
                        type="info"
                        size="sm"
                        @click="viewDetails(category)"
                        aria-label="Show details"
                        class="mr-1"
                      >
                        <i class="tim-icons icon-zoom-split" aria-hidden="true"></i>
                      </base-button>
                      <base-button
                        type="warning"
                        size="sm"
                        @click="editCategory(category)"
                        aria-label="Edit category"
                        class="mr-1"
                      >
                        <i class="tim-icons icon-pencil" aria-hidden="true"></i>
                      </base-button>
                      <base-button
                        type="danger"
                        size="sm"
                        @click="confirmDelete(category)"
                        aria-label="Delete category"
                      >
                        <i class="tim-icons icon-trash-simple" aria-hidden="true"></i>
                      </base-button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Card View -->
        <div class="d-lg-none">
          <div class="row">
            <div
              v-for="(category, index) in paginatedCategories"
              :key="category.id"
              :data-id="category.id"
              :data-index="index"
              :class="{ 'dragging': draggedItem && draggedItem.id === category.id, 'drag-over': dragOverIndex === index }"
              class="col-12 col-md-6 mb-3 mobile-category-card"
            >
              <card class="category-card h-100">
                <div class="card-body p-3">
                  <div class="d-flex align-items-start mb-3">
                    <img
                      :src="getImageUrl(category.image_url)"
                      :alt="category.name.en"
                      class="category-card-image mr-3 clickable-image"
                      @error="handleImageError($event, category)"
                      @load="handleImageLoad($event, category)"
                      @click="previewImage(category)"
                      title="Click to preview"
                    />
                    <div class="flex-grow-1">
                      <h5 class="card-title mb-1">{{ category.name.en }}</h5>
                      <small class="text-muted">Order: {{ category.display_order }}</small>
                    </div>
                    <i 
                      class="tim-icons icon-bullet-list-67 mobile-drag-handle text-muted" 
                      title="Drag to reorder"
                      draggable="true"
                      @dragstart="handleMobileDragStart($event, category, index)"
                      @dragover="handleDragOver"
                      @drop="handleDrop($event, index)"
                      @dragend="handleDragEnd"
                      @touchstart="handleTouchStart($event, category, index)"
                      @touchmove="handleTouchMove"
                      @touchend="handleTouchEnd"
                    ></i>
                  </div>

                  <p class="card-text text-muted mb-2">{{ truncateText(category.description.en, 100) }}</p>

                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">{{ formatDate(category.created_at) }}</small>
                    <div class="btn-group" role="group">
                      <base-button
                        type="info"
                        size="sm"
                        @click="viewDetails(category)"
                        aria-label="Show details"
                        class="mr-1"
                      >
                        <i class="tim-icons icon-zoom-split" aria-hidden="true"></i>
                      </base-button>
                      <base-button
                        type="warning"
                        size="sm"
                        @click="editCategory(category)"
                        aria-label="Edit category"
                        class="mr-1"
                      >
                        <i class="tim-icons icon-pencil" aria-hidden="true"></i>
                      </base-button>
                      <base-button
                        type="danger"
                        size="sm"
                        @click="confirmDelete(category)"
                        aria-label="Delete category"
                      >
                        <i class="tim-icons icon-trash-simple" aria-hidden="true"></i>
                      </base-button>
                    </div>
                  </div>
                </div>
              </card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="row" v-if="isLoading">
      <div class="col-12">
        <card>
          <div class="text-center py-5">
            <i class="fa fa-spinner fa-spin fa-3x text-primary mb-3" aria-hidden="true"></i>
            <h4>Loading categories...</h4>
          </div>
        </card>
      </div>
    </div>

    <!-- Empty State -->
    <div class="row" v-if="!isLoading && categories.length === 0">
      <div class="col-12">
        <card>
          <div class="text-center py-5">
            <i class="tim-icons icon-puzzle-10 fa-3x text-muted mb-3" aria-hidden="true"></i>
            <h4>No categories found</h4>
            <p class="text-muted">Start by creating your first category</p>
            <router-link to="/categories/add" class="btn btn-primary">
              <i class="tim-icons icon-simple-add" aria-hidden="true"></i>
              Add New Category
            </router-link>
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
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredCategories.length) }} of {{ filteredCategories.length }} categories
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
          <i class="tim-icons icon-alert-circle-exc" aria-hidden="true"></i>
          Confirm Delete
        </h4>
      </template>
      <div v-if="categoryToDelete">
        <p>Are you sure you want to delete the category <strong>"{{ categoryToDelete?.name?.en }}"</strong>?</p>
        <p class="text-muted">This action cannot be undone.</p>
      </div>
      <template slot="footer">
        <div class="d-flex flex-column flex-sm-row justify-content-end w-100">
          <base-button type="secondary" @click="showDeleteModal = false" aria-label="Cancel delete" class="mb-2 mb-sm-0 mr-sm-2">
            Cancel
          </base-button>
          <base-button
            type="danger"
            @click="deleteCategoryHandler"
            :disabled="isDeleting"
            aria-label="Confirm delete category"
          >
            <i class="fa fa-spinner fa-spin" v-if="isDeleting" aria-hidden="true"></i>
            <i class="tim-icons icon-simple-remove" v-else aria-hidden="true"></i>
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </base-button>
        </div>
      </template>
    </modal>

    <!-- Category Details Modal -->
    <modal :show="showDetailsModal" @close="showDetailsModal = false" size="lg">
      <template slot="header">
        <h4 class="modal-title">
          <i class="tim-icons icon-zoom-split text-info" aria-hidden="true"></i>
          Category Details
        </h4>
      </template>
      <div v-if="selectedCategory" class="category-details">
        <div class="row">
          <div class="col-md-6 col-12 mb-3 mb-md-0">
            <img
              :src="getImageUrl(selectedCategory.image_url || '/img/placeholder-category.jpg')"
              :alt="selectedCategory.name?.en"
              class="img-fluid rounded w-100"
              style="max-height: 300px; object-fit: cover;"
            />
          </div>
          <div class="col-md-6 col-12">
            <h3>{{ selectedCategory.name?.en }}</h3>
            <p class="text-muted">{{ selectedCategory.description?.en || 'No description available' }}</p>
            <hr>
            <div class="category-info">
              <div class="info-item mb-2">
                <strong>Display Order:</strong>
                <span class="ml-2">{{ selectedCategory.display_order || 0 }}</span>
              </div>
              <div class="info-item">
                <strong>Created:</strong>
                <span class="ml-2">{{ formatDate(selectedCategory.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template slot="footer">
        <div class="d-flex flex-column flex-sm-row justify-content-end w-100">
          <base-button type="secondary" @click="showDetailsModal = false" aria-label="Close details modal" class="mb-2 mb-sm-0 mr-sm-2">
            Close
          </base-button>
          <base-button
            type="warning"
            @click="editCategory(selectedCategory)"
            v-if="selectedCategory"
            aria-label="Edit category"
          >
            <i class="tim-icons icon-pencil" aria-hidden="true"></i>
            <span class="d-none d-sm-inline ml-1">Edit Category</span>
            <span class="d-sm-none ml-1">Edit</span>
          </base-button>
        </div>
      </template>
    </modal>

    <!-- Update Category Modal -->
    <modal :show="showEditModal" @close="closeEditModal" size="lg">
      <template slot="header">
        <h4 class="modal-title">
          <i class="tim-icons icon-pencil text-warning" aria-hidden="true"></i>
          Update Category
        </h4>
      </template>
      <div v-if="selectedCategory">
        <form @submit.prevent="saveCategoryUpdate">
          <div class="form-group">
            <label>Name (EN)</label>
            <input v-model="editForm.name" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Description (EN)</label>
            <textarea v-model="editForm.description" class="form-control" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Display Order</label>
            <input v-model.number="selectedCategory.display_order" type="number" class="form-control" min="1" />
          </div>
          <div class="form-group">
            <label>Category Image</label>
            <div class="image-upload-section">
              <div class="current-image mb-3" v-if="selectedCategory.image_url">
                <img
                  :src="getImageUrl(selectedCategory.image_url)"
                  :alt="selectedCategory.name?.en"
                  class="preview-image clickable-image"
                  @click="previewImage(selectedCategory)"
                  title="Click to preview"
                />
                <div class="image-actions mt-2">
                  <base-button
                    type="danger"
                    size="sm"
                    @click="removeImage"
                    class="mr-2"
                  >
                    <i class="tim-icons icon-trash-simple"></i>
                    Remove
                  </base-button>
                </div>
              </div>
              <div class="upload-options">
                <div class="form-group">
                  <label>Image URL</label>
                  <div class="input-group">
                    <input
                      v-model="selectedCategory.image_url"
                      class="form-control"
                      placeholder="Enter image URL or upload file"
                    />
                    <div class="input-group-append">
                      <base-button
                        type="info"
                        size="sm"
                        @click="triggerFileUpload"
                      >
                        <i class="tim-icons icon-cloud-upload-94"></i>
                        Upload
                      </base-button>
                    </div>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  style="display: none;"
                />
                <small class="text-muted">
                  Supported formats: JPG, PNG, GIF, WebP (Max: 5MB)
                </small>
              </div>
            </div>
          </div>
        </form>
      </div>
      <template slot="footer">
        <div class="d-flex flex-column flex-sm-row justify-content-end w-100">
          <base-button type="secondary" @click="closeEditModal" class="mb-2 mb-sm-0 mr-sm-2">
            Cancel
          </base-button>
          <base-button type="warning" @click="saveCategoryUpdate" :disabled="isSaving">
            <i class="fa fa-spinner fa-spin" v-if="isSaving"></i>
            <i class="tim-icons icon-pencil" v-else></i>
            {{ isSaving ? 'Saving...' : 'Update' }}
          </base-button>
        </div>
      </template>
    </modal>

    <!-- Image Preview Modal -->
    <modal :show="showImageModal" @close="showImageModal = false" size="lg">
      <template slot="header">
        <h4 class="modal-title">
          <i class="tim-icons icon-image-02 text-info" aria-hidden="true"></i>
          Image Preview
        </h4>
      </template>
      <div v-if="previewImageData" class="text-center">
        <img
          :src="getImageUrl(previewImageData.image_url)"
          :alt="previewImageData.name?.en"
          class="img-fluid rounded"
          style="max-height: 500px; max-width: 100%; object-fit: contain;"
        />
        <div class="mt-3">
          <h5>{{ previewImageData.name?.en }}</h5>
          <p class="text-muted">{{ previewImageData.description?.en || 'No description available' }}</p>
        </div>
      </div>
      <template slot="footer">
        <div class="d-flex flex-column flex-sm-row justify-content-end w-100">
          <base-button type="secondary" @click="showImageModal = false" class="mb-2 mb-sm-0 mr-sm-2">
            Close
          </base-button>
          <base-button
            type="warning"
            @click="editImageCategory"
            v-if="previewImageData"
          >
            <i class="tim-icons icon-pencil" aria-hidden="true"></i>
            Edit Category
          </base-button>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import { categories, isLoading, error, success, getCategories, deleteCategory, updateCategory, reorderCategories } from '@/stores/category';
import { BaseInput, BaseButton, Card, Modal } from '@/components';

export default {
  components: {
    BaseInput,
    BaseButton,
    Card,
    Modal,
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      showDetailsModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedCategory: null,
      editForm: {
        name: '',
        description: ''
      },
      // Drag and drop state
      draggedItem: null,
      draggedIndex: null,
      dragOverIndex: null,
      isReordering: false,
      // Touch handling for mobile
      isDragging: false,
      touchStartY: null,
      touchStartX: null,
      isDeleting: false,
      isSaving: false,
      searchTerm: '',
      categoryToDelete: null,
      showImageModal: false,
      previewImageData: null,
      isUploading: false,
    };
  },
  computed: {
    categories() {
      return categories.value;
    },
    sortedCategories() {
      // Sort categories by display_order for consistent drag and drop
      return [...this.categories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    },
    isLoading() {
      return isLoading.value;
    },
    error() {
      return error.value;
    },
    success() {
      return success.value;
    },
    totalPages() {
      return Math.ceil(this.filteredCategories.length / this.itemsPerPage);
    },
    paginatedCategories() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const paginated = this.filteredSortedCategories.slice(start, end);
      return paginated;
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      const startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      const endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    },
    filteredCategories() {
      if (!this.searchTerm.trim()) return this.categories;
      const term = this.searchTerm.trim().toLowerCase();
      return this.categories.filter(cat =>
        (cat.name?.en || '').toLowerCase().includes(term) ||
        (cat.name?.ar || '').toLowerCase().includes(term) ||
        (cat.name?.fr || '').toLowerCase().includes(term) ||
        (cat.description?.en || '').toLowerCase().includes(term) ||
        (cat.description?.ar || '').toLowerCase().includes(term) ||
        (cat.description?.fr || '').toLowerCase().includes(term)
      );
    },
    filteredSortedCategories() {
      // Sort filtered categories by display_order
      return [...this.filteredCategories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    },
  },
  methods: {
    async refreshCategories() {
      await getCategories();
      this.currentPage = 1;
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    },
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
    getImageUrl(imagePath) {

      if (!imagePath) {
        return 'https://via.placeholder.com/300x200/e3e6f0/6c757d?text=No+Image';
      }

      // If it's already a full URL, return as is
      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      // If it's a data URL (base64), return as is
      if (imagePath.startsWith('data:')) {
        return imagePath;
      }

      // If it's a relative path, prepend the base URL
      // Ensure there's a leading slash on the imagePath
      const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
      const fullUrl = `https://oscoapi-hjtj1.sevalla.app/storage${cleanPath}`;
      return fullUrl;
    },
    handleImageError(event, category) {
      console.error('Image failed to load for category:', category.name?.en, 'URL:', event.target.src);
      // Set a placeholder image on error
      event.target.src = 'https://via.placeholder.com/300x200/e3e6f0/6c757d?text=No+Image';
    },
    handleImageLoad(event, category) {
    },
    previewImage(category) {
      this.previewImageData = category;
      this.showImageModal = true;
    },
    editImageCategory() {
      if (this.previewImageData) {
        this.showImageModal = false;
        this.editCategory(this.previewImageData);
      }
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        if (this.$notify) {
          this.$notify({
            type: 'danger',
            icon: 'tim-icons icon-simple-remove',
            message: 'File size must be less than 5MB'
          });
        }
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        if (this.$notify) {
          this.$notify({
            type: 'danger',
            icon: 'tim-icons icon-simple-remove',
            message: 'Please select a valid image file (JPG, PNG, GIF, WebP)'
          });
        }
        return;
      }

      this.isUploading = true;

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'category');

        // Upload to your API endpoint
        const response = await fetch('https://oscoapi-hjtj1.sevalla.app/api/upload-image', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();

        // Update the image URL
        if (result.url) {
          this.selectedCategory.image_url = result.url;

          if (this.$notify) {
            this.$notify({
              type: 'success',
              icon: 'tim-icons icon-check-2',
              message: 'Image uploaded successfully!'
            });
          }
        }

      } catch (error) {
        console.error('Upload error:', error);

        // Fallback: Create a data URL for preview (temporary)
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedCategory.image_url = e.target.result;
        };
        reader.readAsDataURL(file);

        if (this.$notify) {
          this.$notify({
            type: 'warning',
            icon: 'tim-icons icon-alert-circle-exc',
            message: 'Upload service unavailable. Image set as preview only.'
          });
        }
      } finally {
        this.isUploading = false;
        // Clear the file input
        event.target.value = '';
      }
    },
    removeImage() {
      this.selectedCategory.image_url = '';

      if (this.$notify) {
        this.$notify({
          type: 'info',
          icon: 'tim-icons icon-check-2',
          message: 'Image removed'
        });
      }
    },
    viewDetails(category) {
      this.selectedCategory = category;
      this.showDetailsModal = true;
    },
    editCategory(category) {
      this.selectedCategory = { ...category }; // Create a copy to avoid direct mutation

      // Safely populate form fields with fallbacks
      this.editForm.name = category.name?.en || category.name || '';
      this.editForm.description = category.description?.en || category.description || '';
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editForm = {
        name: '',
        description: ''
      };
    },
    confirmDelete(category) {
      this.categoryToDelete = category;
      this.showDeleteModal = true;
    },
    async deleteCategoryHandler() {
      if (this.categoryToDelete) {
        this.isDeleting = true;
        await deleteCategory(this.categoryToDelete.id);
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.categoryToDelete = null;
      }
    },
    async saveCategoryUpdate() {
      if (this.selectedCategory) {
        this.isSaving = true;
        try {
          // Prepare update data with proper validation
          const updateData = {
            name: { en: this.editForm.name },
            description: { en: this.editForm.description },
            display_order: this.selectedCategory.display_order
          };

          // Only include image_url if it's a valid URL or remove it entirely
          if (this.selectedCategory.image_url && this.selectedCategory.image_url.startsWith('http')) {
            updateData.image_url = this.selectedCategory.image_url;
          }
          await updateCategory(this.selectedCategory.id, updateData);

          this.showEditModal = false;
          this.refreshCategories();

          // Show success notification
          if (this.$notify) {
            this.$notify({
              type: 'success',
              icon: 'tim-icons icon-check-2',
              message: 'Category updated successfully!'
            });
          }
        } catch (error) {
          console.error('Error updating category:', error);

          // Show error notification
          if (this.$notify) {
            this.$notify({
              type: 'danger',
              icon: 'tim-icons icon-simple-remove',
              message: error.message || 'Failed to update category. Please try again.'
            });
          }
        } finally {
          this.isSaving = false;
        }
      }
    },
    handleDragStart(event, category, index) {
      this.draggedItem = category;
      this.draggedIndex = index;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', event.target.outerHTML);

      // Add visual feedback
      event.target.style.opacity = '0.5';
    },

    handleMobileDragStart(event, category, index) {
      // Only allow drag from the drag handle itself
      if (!event.target.classList.contains('mobile-drag-handle')) {
        event.preventDefault();
        return;
      }
      this.handleDragStart(event, category, index);
    },

    handleTouchStart(event, category, index) {
      // Prevent default to avoid scrolling interference
      event.preventDefault();
      this.draggedItem = category;
      this.draggedIndex = index;
      
      // Store initial touch position
      this.touchStartY = event.touches[0].clientY;
      this.touchStartX = event.touches[0].clientX;
      this.isDragging = false;
    },

    handleTouchMove(event) {
      if (!this.draggedItem) return;
      
      const touch = event.touches[0];
      const deltaY = Math.abs(touch.clientY - this.touchStartY);
      const deltaX = Math.abs(touch.clientX - this.touchStartX);
      
      // Only start dragging if moved more than 10px
      if (deltaY > 10 || deltaX > 10) {
        this.isDragging = true;
        event.preventDefault();
        
        // Find the element under the touch point
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const cardElement = elementBelow?.closest('.mobile-category-card');
        
        if (cardElement && cardElement.dataset.index !== undefined) {
          const index = parseInt(cardElement.dataset.index);
          this.dragOverIndex = index;
        }
      }
    },

    handleTouchEnd(event) {
      if (this.isDragging && this.dragOverIndex !== null && this.draggedIndex !== this.dragOverIndex) {
        // Calculate actual indices in the full filtered list
        const actualFromIndex = (this.currentPage - 1) * this.itemsPerPage + this.draggedIndex;
        const actualToIndex = (this.currentPage - 1) * this.itemsPerPage + this.dragOverIndex;
        
        this.reorderItems(actualFromIndex, actualToIndex);
      }
      
      this.resetDragState();
      this.isDragging = false;
      this.touchStartY = null;
      this.touchStartX = null;
    },

    handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      // Get the index of the element being dragged over (works for both table rows and cards)
      const element = event.target.closest('tr') || event.target.closest('.draggable-card');
      if (element && element.dataset.index !== undefined) {
        const index = parseInt(element.dataset.index);
        this.dragOverIndex = index;
      }
    },

    handleDrop(event, dropIndex) {
      event.preventDefault();

      if (this.draggedIndex === null || this.draggedIndex === dropIndex || this.isReordering) {
        this.resetDragState();
        return;
      }

      // Calculate actual indices in the full filtered list
      const actualFromIndex = (this.currentPage - 1) * this.itemsPerPage + this.draggedIndex;
      const actualToIndex = (this.currentPage - 1) * this.itemsPerPage + dropIndex;

      this.reorderItems(actualFromIndex, actualToIndex);
      this.resetDragState();
    },

    handleDragEnd(event) {
      // Reset visual feedback
      event.target.style.opacity = '1';
      this.resetDragState();
    },

    resetDragState() {
      this.draggedItem = null;
      this.draggedIndex = null;
      this.dragOverIndex = null;
    },

    // Replace your existing reorderItems method in the Vue component with this simplified version

async reorderItems(fromIndex, toIndex) {
  if (this.isReordering || fromIndex === toIndex) return;

  this.isReordering = true;
  try {
    // Work with the complete sorted categories list
    const items = [...this.sortedCategories];

    // Validate indices
    if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
      throw new Error(`Invalid drag indices: from ${fromIndex}, to ${toIndex}, total ${items.length}`);
    }

    // Create a new array with the item moved to the new position
    const reorderedItems = [...items];
    const [movedItem] = reorderedItems.splice(fromIndex, 1);
    reorderedItems.splice(toIndex, 0, movedItem);
    // Update display_order for all affected items
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      display_order: index + 1
    }));

    // Get the IDs in the new order
    const orderedIds = updatedItems.map(item => item.id);
    // Update categories using individual API calls
    await this.updateCategoriesIndividually(updatedItems);

    // Show success notification
    if (this.$notify) {
      this.$notify({
        type: 'success',
        icon: 'tim-icons icon-check-2',
        message: 'Categories reordered successfully!'
      });
    }

    // Refresh categories to ensure consistency
    await this.refreshCategories();

  } catch (error) {
    console.error('Error reordering categories:', error);

    // Show error notification
    if (this.$notify) {
      this.$notify({
        type: 'danger',
        icon: 'tim-icons icon-simple-remove',
        message: error.message || 'Failed to reorder categories. Please try again.'
      });
    }

    // Refresh categories to revert any local changes
    await this.refreshCategories();
  } finally {
    this.isReordering = false;
  }
},

// Optimized method to handle concurrent category updates
async updateCategoriesIndividually(updatedItems) {
  const { updateCategory } = await import('@/stores/category');

  // Create all update promises concurrently for better performance
  const updatePromises = updatedItems.map(async (item) => {
    try {
      // Prepare clean update data
      const updateData = {
        name: item.name || { en: 'Unnamed Category' },
        description: item.description || { en: '' },
        display_order: item.display_order
      };

      // Handle image_url - skip it if it's a relative path to avoid validation errors
      if (item.image_url && item.image_url.startsWith('http')) {
        updateData.image_url = item.image_url;
      }

      await updateCategory(item.id, updateData);
      return { success: true, id: item.id };

    } catch (error) {
      console.error(`Failed to update category ${item.id}:`, error.message);
      return { success: false, id: item.id, error: error.message };
    }
  });

  // Wait for all updates to complete
  const results = await Promise.all(updatePromises);
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  if (successCount === 0) {
    throw new Error('All category updates failed');
  } else if (errorCount > 0) {
    console.warn(`Some updates failed, but ${successCount} succeeded`);
  }
},
  },
  mounted() {
    getCategories();
  },
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

.category-card-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.category-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e3e6f0;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.clickable-image {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-image:hover {
  opacity: 0.8;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e3e6f0;
}

.image-upload-section {
  border: 1px solid #e3e6f0;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
}

.upload-options {
  margin-top: 1rem;
}

.input-group-append .btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.mobile-category-card {
  transition: all 0.2s ease;
}

.mobile-category-card.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.mobile-category-card.drag-over {
  border: 2px dashed #1d8cf8;
  background-color: rgba(29, 140, 248, 0.05);
}

.mobile-drag-handle {
  cursor: grab;
  font-size: 1.5rem;
  padding: 0.5rem;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.mobile-drag-handle:active {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .btn-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .btn-group .btn {
    flex: 1;
    min-width: 40px;
  }

  .category-card-image {
    width: 60px;
    height: 60px;
  }

  .card-title {
    font-size: 1rem;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .pagination .page-item {
    margin: 0.1rem;
  }

  .mobile-category-card {
    touch-action: auto;
  }
}

/* Drag and Drop Styles */
.draggable-row {
  cursor: move;
  transition: all 0.2s ease;
}

.draggable-row:hover {
  background-color: #f8f9fa;
}

.draggable-row.dragging {
  opacity: 0.5;
  background-color: #e3f2fd;
}

.draggable-row.drag-over {
  background-color: #fff3e0;
  border-top: 2px solid #1d8cf8;
}

.drag-handle {
  cursor: grab;
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.drag-handle:hover {
  color: #1d8cf8 !important;
}

.drag-handle:active {
  cursor: grabbing;
}

.draggable-row td {
  vertical-align: middle;
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
</style>

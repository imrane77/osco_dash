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
                <div class="btn-group-toggle float-right" data-toggle="buttons">
                  <router-link to="/categories/add" class="btn btn-sm btn-primary btn-simple">
                    <i class="tim-icons icon-simple-add" aria-hidden="true"></i>
                    Add New Category
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

    <!-- Categories Table -->
    <div class="row" v-if="!isLoading && filteredCategories.length > 0">
      <div class="col-12">
        <table class="table table-responsive">
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
              v-for="(category, index) in filteredSortedCategories"
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
                    :src="`https://oscoapi-hjtj1.sevalla.app/storage${category.image_url}`"
                    :alt="category.name.en"
                    class="table-image"
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
              </td>
            </tr>
          </tbody>
        </table>
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
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, categories.length) }} of {{ categories.length }} categories
              </small>
            </div>
            <nav aria-label="Category pagination">
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" @click.prevent="changePage(currentPage - 1)" href="#" aria-label="Previous page">
                    <i class="tim-icons icon-double-left" aria-hidden="true"></i>
                  </a>
                </li>
                <li
                  class="page-item"
                  v-for="page in visiblePages"
                  :key="page"
                  :class="{ active: page === currentPage }"
                >
                  <a class="page-link" @click.prevent="changePage(page)" href="#">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" @click.prevent="changePage(currentPage + 1)" href="#" aria-label="Next page">
                    <i class="tim-icons icon-double-right" aria-hidden="true"></i>
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
        <base-button type="secondary" @click="showDeleteModal = false" aria-label="Cancel delete">Cancel</base-button>
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
          <div class="col-md-6">
            <img
              :src="selectedCategory.image_url || '/img/placeholder-category.jpg'"
              :alt="selectedCategory.name?.en"
              class="img-fluid rounded"
            />
          </div>
          <div class="col-md-6">
            <h3>{{ selectedCategory.name?.en }}</h3>
            <p class="text-muted">{{ selectedCategory.description?.en || 'No description available' }}</p>
            <hr>
            <div class="category-info">
              <div class="info-item">
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
        <base-button type="secondary" @click="showDetailsModal = false" aria-label="Close details modal">Close</base-button>
        <base-button
          type="warning"
          @click="editCategory(selectedCategory)"
          v-if="selectedCategory"
          aria-label="Edit category"
        >
          <i class="tim-icons icon-pencil" aria-hidden="true"></i>
          Edit Category
        </base-button>
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
            <label>Image URL</label>
            <input v-model="selectedCategory.image_url" class="form-control" />
          </div>
        </form>
      </div>
      <template slot="footer">
        <base-button type="secondary" @click="closeEditModal">Cancel</base-button>
        <base-button type="warning" @click="saveCategoryUpdate" :disabled="isSaving">
          <i class="fa fa-spinner fa-spin" v-if="isSaving"></i>
          <i class="tim-icons icon-pencil" v-else></i>
          {{ isSaving ? 'Saving...' : 'Update' }}
        </base-button>
      </template>
    </modal>
  </div>
</template>

<script>
import { categories, isLoading, error, success, getCategories, deleteCategory, updateCategory, reorderCategories } from '@/stores/category';
import { BaseInput, BaseButton, Card, Modal } from '@/components';

export default {
  components: {
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
      isDeleting: false,
      isSaving: false,
      searchTerm: '',
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
      return Math.ceil(this.categories.length / this.itemsPerPage);
    },
    paginatedCategories() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.categories.slice(start, end);
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
    viewDetails(category) {
      this.selectedCategory = category;
      this.showDetailsModal = true;
    },
    editCategory(category) {
      this.selectedCategory = { ...category }; // Create a copy to avoid direct mutation

      // Safely populate form fields with fallbacks
      this.editForm.name = category.name?.en || category.name || '';
      this.editForm.description = category.description?.en || category.description || '';

      console.log('Editing category:', category);
      console.log('Edit form populated:', this.editForm);

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
        await updateCategory(this.selectedCategory.id, {
          name: { en: this.editForm.name },
          description: { en: this.editForm.description },
          display_order: this.selectedCategory.display_order,
          image_url: this.selectedCategory.image_url
        });
        this.isSaving = false;
        this.showEditModal = false;
        this.refreshCategories();
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

    handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      // Get the index of the row being dragged over
      const row = event.target.closest('tr');
      if (row) {
        const index = parseInt(row.dataset.index);
        this.dragOverIndex = index;
      }
    },

    handleDrop(event, dropIndex) {
      event.preventDefault();

      if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
        this.resetDragState();
        return;
      }

      this.reorderItems(this.draggedIndex, dropIndex);
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

    async reorderItems(fromIndex, toIndex) {
      if (this.isReordering) return;

      this.isReordering = true;

      try {
        // Create a copy of the sorted categories array
        const items = [...this.sortedCategories];

        // Move the item from fromIndex to toIndex
        const [movedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, movedItem);

        // Extract the IDs in the new order
        const orderedIds = items.map(item => item.id);

        console.log('Reordering from index', fromIndex, 'to index', toIndex);
        console.log('New order:', orderedIds);

        // Call the API to update the order
        await reorderCategories(orderedIds);

        this.$notify({
          type: 'success',
          icon: 'tim-icons icon-check-2',
          message: 'Categories reordered successfully!'
        });

      } catch (error) {
        console.error('Error reordering categories:', error);
        this.$notify({
          type: 'danger',
          icon: 'tim-icons icon-simple-remove',
          message: 'Failed to reorder categories. Please try again.'
        });
      } finally {
        this.isReordering = false;
      }
    }
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

.pagination {
  justify-content: center;
  margin-top: 20px;
}

.pagination .page-item .page-link {
  color: #1d8cf8;
  border-color: #1d8cf8;
  background-color: transparent;
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

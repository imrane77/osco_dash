<template>
  <div>
    <!-- Page Header -->
    <div class="row">
      <div class="col-12">
        <card class="card-chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6 text-left">
                <h2 class="card-title">Add New Menu Item</h2>
                <p class="card-category">
                  <i class="tim-icons icon-app text-primary"></i>
                  Create a new menu item for your restaurant
                </p>
              </div>
              <div class="col-sm-6">
                <div class="btn-group-toggle float-right" data-toggle="buttons">
                  <router-link to="/menus/list" class="btn btn-sm btn-primary btn-simple">
                    <i class="tim-icons icon-bullet-list-67"></i>
                    View Menu Items
                  </router-link>
                </div>
              </div>
            </div>
          </template>
        </card>
      </div>
    </div>

    <!-- Menu Item Form -->
    <div class="row">
      <div class="col-lg-8 col-md-10 col-sm-12 mx-auto">
        <card>
          <template slot="header">
            <h4 class="card-title">
              <i class="tim-icons icon-simple-add text-success"></i>
              Menu Item Information
            </h4>
            <p class="card-category">Fill in the details for the new menu item</p>
          </template>

          <form @submit.prevent="submitMenuItem">
            <!-- Language Selector -->
            <div class="row">
              <div class="col-md-12">
                <label class="form-control-label">Language *</label>
                <div class="language-selector mb-3">
                  <div class="btn-group btn-group-toggle" data-toggle="buttons">
                    <label 
                      v-for="lang in availableLanguages" 
                      :key="lang.code"
                      :class="['btn', 'btn-outline-primary', { 'active': selectedLanguage === lang.code }]"
                      @click="selectedLanguage = lang.code"
                    >
                      <input type="radio" :value="lang.code" v-model="selectedLanguage" autocomplete="off">
                      <i :class="lang.icon" class="mr-1"></i>
                      {{ lang.name }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category Selection -->
            <div class="row">
              <div class="col-md-12">
                <div class="form-group">
                  <label>Category *</label>
                  <select 
                    v-model="menuItem.categoryId" 
                    class="form-control"
                    :class="{ 'has-danger': errors.categoryId }"
                    :disabled="isLoadingCategories"
                    required
                  >
                    <option value="" v-if="isLoadingCategories">Loading categories...</option>
                    <option value="" v-else-if="availableCategories.length === 0">No categories available</option>
                    <option value="" v-else>Select a category</option>
                    <option v-for="category in availableCategories" :key="category.id" :value="category.id">
                      {{ category.name?.en || category.name || `Category ${category.id}` }}
                    </option>
                  </select>
                  <small v-if="errors.categoryId" class="text-danger">{{ errors.categoryId }}</small>
                  <small v-if="isLoadingCategories" class="text-info">
                    <i class="fa fa-spinner fa-spin"></i> Loading categories...
                  </small>
                  <small v-else-if="availableCategories.length === 0" class="text-warning">
                    No categories found. <router-link to="/categories/add">Create a category first</router-link>.
                  </small>
                </div>
              </div>
            </div>

            <!-- Menu Item Name -->
            <div class="row">
              <div class="col-md-12">
                <base-input
                  :label="`Item Name (${getLanguageName(selectedLanguage)}) *`"
                  :placeholder="`Enter menu item name in ${getLanguageName(selectedLanguage)}`"
                  v-model="menuItem.name[selectedLanguage]"
                  :class="{ 'has-danger': errors.name }"
                  required
                >
                  <small v-if="errors.name" class="text-danger">{{ errors.name }}</small>
                </base-input>
              </div>
            </div>

            <!-- Price -->
            <div class="row">
              <div class="col-md-12">
                <base-input
                  label="Price *"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Enter price"
                  v-model="menuItem.price"
                  :class="{ 'has-danger': errors.price }"
                  required
                >
                  <template slot="prepend">
                    <span class="input-group-text">$</span>
                  </template>
                  <small v-if="errors.price" class="text-danger">{{ errors.price }}</small>
                </base-input>
              </div>
            </div>

            <!-- Description -->
            <div class="row">
              <div class="col-md-12">
                <div class="form-group">
                  <label>Description ({{ getLanguageName(selectedLanguage) }}) *</label>
                  <textarea
                    rows="4"
                    class="form-control"
                    :placeholder="`Describe the menu item in ${getLanguageName(selectedLanguage)}`"
                    v-model="menuItem.description[selectedLanguage]"
                    :class="{ 'has-danger': errors.description }"
                    required
                  ></textarea>
                  <small v-if="errors.description" class="text-danger">{{ errors.description }}</small>
                </div>
              </div>
            </div>

            <!-- Menu Item Image -->
            <div class="row">
              <div class="col-md-12">
                <label class="form-control-label">Menu Item Image *</label>
                <div
                  class="image-upload-container"
                  :class="{ 'has-image': menuItem.imagePreview, 'has-error': errors.image }"
                  @dragover.prevent
                  @dragenter.prevent
                  @drop.prevent="handleImageDrop"
                  @click="triggerFileInput"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    style="display: none;"
                  />

                  <div v-if="!menuItem.imagePreview" class="upload-placeholder">
                    <i class="tim-icons icon-cloud-upload-94 upload-icon"></i>
                    <h4>Upload Menu Item Image</h4>
                    <p>Drag and drop an image here, or click to browse</p>
                    <small class="text-muted">Supported formats: JPG, PNG, GIF (Max 5MB)</small>
                  </div>

                  <div v-else class="image-preview-container">
                    <img :src="menuItem.imagePreview" alt="Menu Item Image Preview" class="preview-image" />
                    <div class="image-overlay">
                      <button type="button" class="btn btn-sm btn-danger" @click.stop="removeImage">
                        <i class="tim-icons icon-simple-remove"></i>
                        Remove
                      </button>
                      <button type="button" class="btn btn-sm btn-primary ml-2" @click.stop="triggerFileInput">
                        <i class="tim-icons icon-image-02"></i>
                        Change
                      </button>
                    </div>
                  </div>
                </div>
                <small v-if="errors.image" class="text-danger d-block mt-2">
                  <i class="tim-icons icon-alert-circle-exc"></i>
                  {{ errors.image }}
                </small>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="row">
              <div class="col-md-12">
                <div class="form-actions text-center">
                  <base-button
                    type="primary"
                    size="lg"
                    :disabled="isSubmitting"
                    @click="submitMenuItem"
                  >
                    <i class="tim-icons icon-check-2" v-if="!isSubmitting"></i>
                    <i class="fa fa-spinner fa-spin" v-if="isSubmitting"></i>
                    {{ isSubmitting ? 'Creating...' : 'Create Menu Item' }}
                  </base-button>

                  <base-button
                    type="secondary"
                    size="lg"
                    @click="resetForm"
                    :disabled="isSubmitting"
                    class="ml-2"
                  >
                    <i class="tim-icons icon-refresh-01"></i>
                    Reset
                  </base-button>

                  <router-link to="/menus/list" class="btn btn-link btn-lg ml-2">
                    <i class="tim-icons icon-minimal-left"></i>
                    Back to List
                  </router-link>
                </div>
              </div>
            </div>
          </form>
        </card>
      </div>
    </div>
  </div>
</template>

<script>
import { BaseInput, BaseButton, Card } from '@/components';

export default {
  name: 'AddMenuItem',
  components: {
    BaseInput,
    BaseButton,
    Card
  },
  data() {
    return {
      selectedLanguage: 'en', // Default language
      availableLanguages: [
        { code: 'en', name: 'English', icon: 'tim-icons icon-world' },
        { code: 'fr', name: 'Français', icon: 'tim-icons icon-world' },
        { code: 'ar', name: 'العربية', icon: 'tim-icons icon-world' }
      ],
      menuItem: {
        categoryId: '',
        name: {
          en: '',
          fr: '',
          ar: ''
        },
        price: '',
        description: {
          en: '',
          fr: '',
          ar: ''
        },
        image: null
      },
      availableCategories: [],
      errors: {},
      isSubmitting: false,
      isLoadingCategories: false
    };
  },
  methods: {
    validateForm() {
      this.errors = {};
      let isValid = true;

      // Category validation
      if (!this.menuItem.categoryId) {
        this.errors.categoryId = 'Category selection is required';
        isValid = false;
      }

      // Name validation - English is always required, others are optional
      if (!this.menuItem.name.en || !this.menuItem.name.en.trim()) {
        this.errors.name = 'Item name (English) is required';
        isValid = false;
      } else if (this.menuItem.name.en.length < 3) {
        this.errors.name = 'Item name must be at least 3 characters long';
        isValid = false;
      }
      
      // If current language is not English and has content, validate it too
      if (this.selectedLanguage !== 'en' && this.menuItem.name[this.selectedLanguage] && this.menuItem.name[this.selectedLanguage].trim()) {
        if (this.menuItem.name[this.selectedLanguage].length < 3) {
          this.errors.name = `Item name (${this.getLanguageName(this.selectedLanguage)}) must be at least 3 characters long`;
          isValid = false;
        }
      }

      // Price validation
      if (!this.menuItem.price) {
        this.errors.price = 'Price is required';
        isValid = false;
      } else if (parseFloat(this.menuItem.price) <= 0) {
        this.errors.price = 'Price must be greater than 0';
        isValid = false;
      }

      // Description validation (for current selected language)
      if (!this.menuItem.description[this.selectedLanguage] || !this.menuItem.description[this.selectedLanguage].trim()) {
        this.errors.description = `Description (${this.getLanguageName(this.selectedLanguage)}) is required`;
        isValid = false;
      }

      // Image validation
      if (!this.menuItem.image) {
        this.errors.image = 'Please upload an image';
        isValid = false;
      }

      return isValid;
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      this.processImageFile(file);
    },

    handleImageDrop(event) {
      const file = event.dataTransfer.files[0];
      this.processImageFile(file);
    },

    processImageFile(file) {
      if (!file) return;

      // Clear previous errors
      delete this.errors.image;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.errors.image = 'Please upload a valid image file';
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errors.image = 'Image size must be less than 5MB';
        return;
      }

      this.menuItem.image = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.menuItem.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    removeImage() {
      this.menuItem.image = null;
      this.menuItem.imagePreview = null;
      this.$refs.fileInput.value = '';
      delete this.errors.image;
    },

    async submitMenuItem() {
      if (!this.validateForm()) {
        this.showErrorNotification('Please fix the errors in the form');
        return;
      }

      this.isSubmitting = true;

      try {
        // Create FormData for proper API submission
        const formData = new FormData();
        formData.append('restaurant_id', 1); // Default restaurant ID
        formData.append('menu_category_id', this.menuItem.categoryId || 1); // Category ID
        
        // Add multilingual name fields
        formData.append('name[en]', this.menuItem.name.en || '');
        formData.append('name[fr]', this.menuItem.name.fr || '');
        formData.append('name[ar]', this.menuItem.name.ar || '');
        
        // Add multilingual description fields
        formData.append('description[en]', this.menuItem.description.en || '');
        formData.append('description[fr]', this.menuItem.description.fr || '');
        formData.append('description[ar]', this.menuItem.description.ar || '');
        
        formData.append('base_price', parseFloat(this.menuItem.price) || 0);
        formData.append('is_available', 1); // Default to available
        
        // Add image if provided
        if (this.menuItem.image) {
          formData.append('image_url', this.menuItem.image);
        }

        console.log('Creating menu item with data:', Object.fromEntries(formData));

        await this.createMenuItem(formData);

        this.showSuccessNotification('Menu item created successfully!');

        // Reset form after successful submission
        this.resetForm();

        // Redirect to menu items list
        setTimeout(() => {
          this.$router.push('/menus/list');
        }, 1500);

      } catch (error) {
        console.error('Error creating menu item:', error);
        let errorMessage = 'Failed to create menu item. Please try again.';
        
        if (error.response?.data?.errors) {
          errorMessage = Object.values(error.response.data.errors).join(' ');
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        this.showErrorNotification(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },

    async loadCategories() {
      this.isLoadingCategories = true;
      try {
        console.log('Starting to load categories...');
        
        // Import the category store functions
        const { getCategories, categories } = await import('@/stores/category');
        
        console.log('Category store imported, calling getCategories...');
        await getCategories();
        
        // Get categories from the reactive reference
        this.availableCategories = categories.value || [];
        
        console.log('Categories loaded:', this.availableCategories);
        console.log('Number of categories:', this.availableCategories.length);
        
        if (this.availableCategories.length === 0) {
          console.warn('No categories found - check if categories exist in database');
          this.showErrorNotification('No categories found. Please create categories first.');
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        console.error('Error details:', error.response?.data);
        this.showErrorNotification('Failed to load categories: ' + (error.message || 'Unknown error'));
      } finally {
        this.isLoadingCategories = false;
      }
    },

    async createMenuItem(formData) {
      // Import and use the actual addMenu function from the store
      const { addMenu } = await import('@/stores/menu');
      return await addMenu(formData);
    },

    resetForm() {
      this.menuItem = {
        categoryId: '',
        name: {
          en: '',
          fr: '',
          ar: ''
        },
        price: '',
        description: {
          en: '',
          fr: '',
          ar: ''
        },
        image: null
      };
      this.errors = {};
      this.selectedLanguage = 'en';
    },

    getLanguageName(code) {
      const lang = this.availableLanguages.find(l => l.code === code);
      return lang ? lang.name : code;
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
    }
  },

  async mounted() {
    // Load categories when component mounts
    await this.loadCategories();
    
    // Focus on the category select when component mounts
    this.$nextTick(() => {
      const categorySelect = this.$el.querySelector('select');
      if (categorySelect) {
        categorySelect.focus();
      }
    });
  }
};
</script>

<style scoped>
.image-upload-container {
  border: 2px dashed #e3e3e3;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-container:hover {
  border-color: #1d8cf8;
  background-color: #f0f8ff;
}

.image-upload-container.has-error {
  border-color: #fd5d93;
  background-color: #fdf2f5;
}

.image-upload-container.has-image {
  padding: 0;
  border: none;
  background: none;
  min-height: auto;
}

.upload-placeholder {
  color: #999;
}

.upload-icon {
  font-size: 3rem;
  color: #1d8cf8;
  margin-bottom: 1rem;
}

.image-preview-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.preview-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e3e3e3;
}

.has-danger .form-control {
  border-color: #fd5d93;
}

.text-danger {
  color: #fd5d93 !important;
}

.input-group-text {
  background-color: #1d8cf8;
  color: white;
  border-color: #1d8cf8;
}
</style>

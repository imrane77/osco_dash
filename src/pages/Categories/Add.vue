<template>
  <div>
    <!-- Page Header -->
    <div class="row">
      <div class="col-12">
        <card class="card-chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6 text-left">
                <h2 class="card-title">Add New Category</h2>
                <p class="card-category">
                  <i class="tim-icons icon-puzzle-10 text-primary"></i>
                  Create a new category for your items
                </p>
              </div>
              <div class="col-sm-6">
                <div class="btn-group-toggle float-right" data-toggle="buttons">
                  <router-link to="/categories/list" class="btn btn-sm btn-primary btn-simple">
                    <i class="tim-icons icon-bullet-list-67"></i>
                    View Categories
                  </router-link>
                </div>
              </div>
            </div>
          </template>
        </card>
      </div>
    </div>

    <!-- Category Form -->
    <div class="row">
      <div class="col-lg-8 col-md-10 col-sm-12 mx-auto">
        <card>
          <template slot="header">
            <h4 class="card-title">
              <i class="tim-icons icon-simple-add text-success"></i>
              Category Information
            </h4>
            <p class="card-category">Fill in the details for the new category</p>
          </template>

          <form @submit.prevent="submitCategory">
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

            <!-- Category Name -->
            <div class="row">
              <div class="col-md-12">
                <base-input
                  :label="`Category Name (${getLanguageName(selectedLanguage)}) *`"
                  :placeholder="`Enter category name in ${getLanguageName(selectedLanguage)}`"
                  v-model="category.name[selectedLanguage]"
                  :class="{ 'has-danger': errors.name }"
                  required
                >
                  <small v-if="errors.name" class="text-danger">{{ errors.name }}</small>
                </base-input>
              </div>
            </div>

            <!-- Category Description -->
            <div class="row">
              <div class="col-md-12">
                <base-input>
                  <label>Description ({{ getLanguageName(selectedLanguage) }})</label>
                  <textarea
                    rows="4"
                    class="form-control"
                    :placeholder="`Describe what this category is for in ${getLanguageName(selectedLanguage)} (optional)`"
                    v-model="category.description[selectedLanguage]"
                    :class="{ 'has-danger': errors.description }"
                  ></textarea>
                  <small v-if="errors.description" class="text-danger">{{ errors.description }}</small>
                </base-input>
              </div>
            </div>

            <!-- Category Image -->
            <div class="row">
              <div class="col-md-12">
                <label class="form-control-label">Category Image *</label>
                <div
                  class="image-upload-container"
                  :class="{ 'has-image': category.imagePreview, 'has-error': errors.image }"
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

                  <div v-if="!category.imagePreview" class="upload-placeholder">
                    <i class="tim-icons icon-cloud-upload-94 upload-icon"></i>
                    <h4>Upload Category Image</h4>
                    <p>Drag and drop an image here, or click to browse</p>
                    <small class="text-muted">Supported formats: JPG, PNG, GIF (Max 5MB)</small>
                  </div>

                  <div v-else class="image-preview-container">
                    <img :src="category.imagePreview" alt="Category Image Preview" class="preview-image" />
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
                    @click="submitCategory"
                  >
                    <i class="tim-icons icon-check-2" v-if="!isSubmitting"></i>
                    <i class="fa fa-spinner fa-spin" v-if="isSubmitting"></i>
                    {{ isSubmitting ? 'Creating...' : 'Create Category' }}
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

                  <router-link to="/categories/list" class="btn btn-link btn-lg ml-2">
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
import { addCategory, error, success, isLoading } from '@/stores/category';
import { BaseInput, BaseButton, Card } from '@/components';


export default {
  name: 'AddCategory',
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
        { code: 'ar', name: 'العربية', icon: 'tim-icons icon-world' },
        { code: 'fr', name: 'Français', icon: 'tim-icons icon-world' }
      ],
      category: {
        name: {
          en: '',
          ar: '',
          fr: ''
        },
        description: {
          en: '',
          ar: '',
          fr: ''
        },
        image: null,
        imagePreview: null,
      },
      errors: {},
      isSubmitting: false
    }
  },
  methods: {
  validateForm() {
  this.errors = {};
  let isValid = true;

  // Validate category name for selected language
  const currentName = this.category.name[this.selectedLanguage];
  if (!currentName || currentName.trim().length < 2) {
    this.errors.name = `Category name in ${this.getLanguageName(this.selectedLanguage)} must be at least 2 characters long`;
    isValid = false;
  } else if (currentName.length > 50) {
    this.errors.name = `Category name in ${this.getLanguageName(this.selectedLanguage)} must be less than 50 characters`;
    isValid = false;
  }

  // Additional validation: Check if at least one language has a name
  const hasAnyName = Object.values(this.category.name).some(name => name && name.trim().length > 0);
  if (!hasAnyName) {
    this.errors.name = 'Category name must be provided in at least one language';
    isValid = false;
  }

  // Validate description length for selected language
  const currentDescription = this.category.description[this.selectedLanguage];
  if (currentDescription && currentDescription.length > 500) {
    this.errors.description = `Description in ${this.getLanguageName(this.selectedLanguage)} must be less than 500 characters`;
    isValid = false;
  }

  // Validate image
  if (!this.category.image) {
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
      console.log('Processing image file:', file);
      if (!file) {
        console.log('No file provided');
        return;
      }

      // Clear previous errors
      delete this.errors.image;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        this.errors.image = 'Please upload a valid image file';
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size);
        this.errors.image = 'Image size must be less than 5MB';
        return;
      }

      console.log('File validation passed, setting image and creating preview');
      this.category.image = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('FileReader loaded, setting preview');
        this.category.imagePreview = e.target.result;
        console.log('Preview set:', this.category.imagePreview ? 'Success' : 'Failed');
      };
      reader.onerror = (e) => {
        console.error('FileReader error:', e);
      };
      reader.readAsDataURL(file);
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    removeImage() {
      this.category.image = null;
      this.category.imagePreview = null;
      this.$refs.fileInput.value = '';
      delete this.errors.image;
    },

async submitCategory() {
  if (!this.validateForm()) {
    this.showErrorNotification('Please fix the errors in the form');
    return;
  }

  this.isSubmitting = true;

  try {
    // Ensure all languages have at least the current language's value
    const processedName = { ...this.category.name };
    const processedDescription = { ...this.category.description };

    // If other languages are empty, use the current language's value as fallback
    // or use empty strings if that's what your API expects
    this.availableLanguages.forEach(lang => {
      if (!processedName[lang.code] || processedName[lang.code].trim() === '') {
        // Option 1: Use current language value as fallback
        processedName[lang.code] = this.category.name[this.selectedLanguage] || '';

        // Option 2: Use empty string (uncomment if your API accepts empty strings)
        // processedName[lang.code] = '';
      }

      if (!processedDescription[lang.code]) {
        // For description, empty string is usually fine
        processedDescription[lang.code] = this.category.description[this.selectedLanguage] || '';
      }
    });

    // Prepare FormData for API
    const formData = new FormData();
    formData.append('restaurant_id', 1);

    // Send as individual language fields (try this first)
    Object.keys(processedName).forEach(lang => {
      formData.append(`name[${lang}]`, processedName[lang]);
      formData.append(`description[${lang}]`, processedDescription[lang]);
    });

    // Alternative: If your API expects JSON strings, uncomment these instead:
    // formData.append('name', JSON.stringify(processedName));
    // formData.append('description', JSON.stringify(processedDescription));

    // Handle image upload - the backend will store it and return the path
    formData.append('image_url', this.category.image);

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Call addCategory with FormData
    await addCategory(formData);

    if (error.value) {
      this.showErrorNotification(error.value);
      return;
    }

    this.showSuccessNotification('Category created successfully!');
    this.resetForm();

    setTimeout(() => {
      this.$router.push('/categories/list');
    }, 1500);

  } catch (err) {
    console.error('Error creating category:', err);
    console.error('Full error response:', err.response);

    const errorMessage = err.response?.data?.message || err.message || 'Failed to create category. Please try again.';
    this.showErrorNotification(errorMessage);
  } finally {
    this.isSubmitting = false;
  }
},

    resetForm() {
      this.category = {
        name: {
          en: '',
          ar: '',
          fr: ''
        },
        description: {
          en: '',
          ar: '',
          fr: ''
        },
        image: null,
        imagePreview: null,
      };
      this.errors = {};
      this.selectedLanguage = 'en'; // Reset to default language
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

    async uploadImage(file) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        // You might need to create an image upload endpoint
        // For now, we'll create a temporary URL or use a placeholder
        // In a real app, you'd upload to your server or cloud storage

        // Create a temporary blob URL for now
        // TODO: Replace with actual image upload endpoint
        const imageUrl = URL.createObjectURL(file);

        // For demo purposes, return a placeholder URL
        // In production, you'd upload to your server and return the actual URL
        const displayName = this.category.name[this.selectedLanguage] || this.category.name.en || 'Category';
        return `https://via.placeholder.com/300x200?text=${encodeURIComponent(displayName)}`;

      } catch (error) {
        console.error('Error uploading image:', error);
        return null;
      }
    },

    showErrorNotification(message) {
      this.$notify({
        type: 'danger',
        icon: 'tim-icons icon-simple-remove',
        message: message
      });
    }
  },

  mounted() {
    // Focus on the name input when component mounts
    this.$nextTick(() => {
      const nameInput = this.$el.querySelector('input[placeholder*="category name"]');
      if (nameInput) {
        nameInput.focus();
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

/* Language Selector Styles */
.language-selector .btn-group {
  width: 100%;
}

.language-selector .btn {
  flex: 1;
  border-radius: 6px;
  margin: 0 2px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.language-selector .btn:first-child {
  margin-left: 0;
}

.language-selector .btn:last-child {
  margin-right: 0;
}

.language-selector .btn-outline-primary {
  border-color: #1d8cf8;
  color: #1d8cf8;
  background-color: transparent;
}

.language-selector .btn-outline-primary:hover,
.language-selector .btn-outline-primary.active {
  background-color: #1d8cf8;
  border-color: #1d8cf8;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(29, 140, 248, 0.3);
}

.language-selector .btn-outline-primary.active {
  font-weight: 600;
}

.language-selector input[type="radio"] {
  display: none;
}

@media (max-width: 768px) {
  .language-selector .btn {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }
}
</style>

```vue
<template>
  <div>
    <!-- Page Header -->
    <div class="row">
      <div class="col-12">
        <card class="card-chart">
          <template slot="header">
            <div class="row">
              <div class="col-sm-6 text-left">
                <h2 class="card-title">Restaurant Information</h2>
                <p class="card-category">
                  <i class="tim-icons icon-settings-gear-63 text-primary"></i>
                  Manage your restaurant's basic details
                </p>
              </div>
              <div class="col-sm-6">
                <div class="btn-group-toggle float-right" data-toggle="buttons">
                  <router-link to="/dashboard" class="btn btn-sm btn-primary btn-simple">
                    <i class="tim-icons icon-minimal-left"></i>
                    Back to Dashboard
                  </router-link>
                </div>
              </div>
            </div>
          </template>
        </card>
      </div>
    </div>

    <!-- Unified Restaurant Information Form -->
    <div class="row">
      <div class="col-lg-10 col-md-12 col-sm-12 mx-auto">
        <card>
          <template slot="header">
            <h4 class="card-title">
              <i class="tim-icons icon-settings text-primary"></i>
              Restaurant Information Management
            </h4>
            <p class="card-category">Complete restaurant profile - Basic info, contact details, and settings</p>
          </template>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner">
              <i class="fa fa-spinner fa-spin fa-3x text-primary"></i>
            </div>
            <p class="text-center text-muted mt-3">Loading restaurant information...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-container">
            <div class="alert alert-danger text-center">
              <i class="tim-icons icon-alert-circle-exc"></i>
              Failed to load restaurant information. Please try again.
              <br>
              <base-button
                type="primary"
                size="sm"
                @click="getRestaurantInfo"
                class="mt-3"
              >
                <i class="tim-icons icon-refresh-01"></i>
                Retry
              </base-button>
            </div>
          </div>

          <!-- Unified Form -->
          <form v-else @submit.prevent="submitAllInfo">
            <!-- Success Message -->
            <div v-if="showSuccessMessage" class="alert alert-success alert-dismissible fade show">
              <span class="alert-inner--icon">
                <i class="tim-icons icon-check-2"></i>
              </span>
              <span class="alert-inner--text">
                <strong>Success!</strong> All restaurant information updated successfully!
              </span>
              <button type="button" class="close" @click="showSuccessMessage = false">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <!-- Basic Information Section -->
            <div class="form-section">
              <h5 class="section-title">
                <i class="tim-icons icon-shop text-primary"></i>
                Basic Information
              </h5>
              <hr class="section-divider">

              <!-- Restaurant Name -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Restaurant Name *"
                    placeholder="Enter your restaurant name (e.g., The Golden Spoon)"
                    v-model="info.name"
                    :class="{ 'has-danger': errors.name }"
                    required
                    @input="clearFieldError('name')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-shop text-primary"></i>
                      </span>
                    </template>
                    <small v-if="errors.name" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ errors.name }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Restaurant Headline -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Restaurant Headline *"
                    placeholder="Enter a catchy headline for your restaurant"
                    v-model="info.headline"
                    :class="{ 'has-danger': errors.headline }"
                    required
                    @input="clearFieldError('headline')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-bullet-list-67 text-primary"></i>
                      </span>
                    </template>
                    <small v-if="errors.headline" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ errors.headline }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Restaurant Description -->
              <div class="row">
                <div class="col-md-12">
                  <base-input>
                    <label>Restaurant Description *</label>
                    <textarea
                      rows="5"
                      class="form-control"
                      placeholder="Describe your restaurant, cuisine type, atmosphere, and what makes it special..."
                      v-model="info.description"
                      :class="{ 'has-danger': errors.description }"
                      required
                      @input="clearFieldError('description')"
                    ></textarea>
                    <small v-if="errors.description" class="text-danger d-block mt-2">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ errors.description }}
                    </small>
                    <small class="text-muted d-block mt-1">
                      {{ info.description.length }} / 500 characters
                      <span v-if="info.description.length < 20" class="text-warning">
                        (Minimum 20 characters required)
                      </span>
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Currency -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Currency *"
                    placeholder="e.g., USD, EUR, GBP"
                    v-model="info.currency"
                    :class="{ 'has-danger': errors.currency }"
                    required
                    @input="clearFieldError('currency')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-money-coins text-primary"></i>
                      </span>
                    </template>
                    <small v-if="errors.currency" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ errors.currency }}
                    </small>
                  </base-input>
                </div>
              </div>
            </div>

            <!-- Contact Information Section -->
            <div class="form-section mt-4">
              <h5 class="section-title">
                <i class="tim-icons icon-square-pin text-info"></i>
                Contact Information
              </h5>
              <hr class="section-divider">

              <!-- Address -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Restaurant Address *"
                    placeholder="Enter your complete restaurant address"
                    v-model="contact.address"
                    :class="{ 'has-danger': contactErrors.address }"
                    required
                    @input="clearContactFieldError('address')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-square-pin text-info"></i>
                      </span>
                    </template>
                    <small v-if="contactErrors.address" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ contactErrors.address }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Phone Numbers Row -->
              <div class="row">
                <div class="col-md-6">
                  <base-input
                    label="Mobile Phone *"
                    placeholder="+32 2 123 45 67"
                    v-model="contact.phone_number"
                    :class="{ 'has-danger': contactErrors.phone_number }"
                    required
                    @input="clearContactFieldError('phone_number')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-mobile text-info"></i>
                      </span>
                    </template>
                    <small v-if="contactErrors.phone_number" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ contactErrors.phone_number }}
                    </small>
                  </base-input>
                </div>
                <div class="col-md-6">
                  <base-input
                    label="Fixed Phone"
                    placeholder="+32 2 987 65 43"
                    v-model="contact.phone_fix"
                    :class="{ 'has-danger': contactErrors.phone_fix }"
                    @input="clearContactFieldError('phone_fix')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-phone-2 text-info"></i>
                      </span>
                    </template>
                    <small v-if="contactErrors.phone_fix" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ contactErrors.phone_fix }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Email -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Email Address *"
                    type="email"
                    placeholder="contact@yourrestaurant.com"
                    v-model="contact.gmail"
                    :class="{ 'has-danger': contactErrors.gmail }"
                    required
                    @input="clearContactFieldError('gmail')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-email-85 text-info"></i>
                      </span>
                    </template>
                    <small v-if="contactErrors.gmail" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ contactErrors.gmail }}
                    </small>
                  </base-input>
                </div>
              </div>
            </div>

            <!-- Branding and Social Media Section -->
            <div class="form-section mt-4">
              <h5 class="section-title">
                <i class="tim-icons icon-world text-success"></i>
                Branding and Social Media
              </h5>
              <hr class="section-divider">

              <!-- Logo Light Theme URL -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Logo Light Theme URL"
                    placeholder="https://example.com/logo-light.png"
                    v-model="branding.logo_light_theme_url"
                    :class="{ 'has-danger': brandingErrors.logo_light_theme_url }"
                    @input="clearBrandingFieldError('logo_light_theme_url')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-image-02 text-success"></i>
                      </span>
                    </template>
                    <small v-if="brandingErrors.logo_light_theme_url" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ brandingErrors.logo_light_theme_url }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Cover Image URL -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Cover Image URL"
                    placeholder="https://example.com/cover-image.jpg"
                    v-model="branding.cover_image_url"
                    :class="{ 'has-danger': brandingErrors.cover_image_url }"
                    @input="clearBrandingFieldError('cover_image_url')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-image-02 text-success"></i>
                      </span>
                    </template>
                    <small v-if="brandingErrors.cover_image_url" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ brandingErrors.cover_image_url }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Google Maps Link -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Google Maps Link"
                    placeholder="https://maps.google.com/..."
                    v-model="branding.google_maps_link"
                    :class="{ 'has-danger': brandingErrors.google_maps_link }"
                    @input="clearBrandingFieldError('google_maps_link')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-map-big text-success"></i>
                      </span>
                    </template>
                    <small v-if="brandingErrors.google_maps_link" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ brandingErrors.google_maps_link }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Facebook -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Facebook"
                    placeholder="https://facebook.com/yourpage"
                    v-model="branding.facebook"
                    :class="{ 'has-danger': brandingErrors.facebook }"
                    @input="clearBrandingFieldError('facebook')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-single-02 text-success"></i>
                      </span>
                    </template>
                    <small v-if="brandingErrors.facebook" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ brandingErrors.facebook }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Instagram -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Instagram"
                    placeholder="https://instagram.com/yourpage"
                    v-model="branding.instagram"
                    :class="{ 'has-danger': brandingErrors.instagram }"
                    @input="clearBrandingFieldError('instagram')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-single-02 text-success"></i>
                      </span>
                    </template>
                    <small v-if="brandingErrors.instagram" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ brandingErrors.instagram }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- YouTube -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="YouTube"
                    placeholder="https://youtube.com/channel/yourchannel"
                    v-model="branding.youtube"
                    :class="{ 'has-danger': brandingErrors.youtube }"
                    @input="clearBrandingFieldError('youtube')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-single-02 text-success"></i>
                      </span>
                    </template>
                    <small v-if="brandingErrors.youtube" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ brandingErrors.youtube }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- Snapchat -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="Snapchat"
                    placeholder="https://snapchat.com/add/yourusername"
                    v-model="branding.snapchat"
                    :class="{ 'has-danger': brandingErrors.snapchat }"
                    @input="clearBrandingFieldError('snapchat')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-single-02 text-success"></i>
                      </span>
                    </template>
                    <small v-if="brandingErrors.snapchat" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ brandingErrors.snapchat }}
                    </small>
                  </base-input>
                </div>
              </div>

              <!-- TikTok -->
              <div class="row">
                <div class="col-md-12">
                  <base-input
                    label="TikTok"
                    placeholder="https://tiktok.com/@yourusername"
                    v-model="branding.tiktok"
                    :class="{ 'has-danger': brandingErrors.tiktok }"
                    @input="clearBrandingFieldError('tiktok')"
                  >
                    <template slot="prepend">
                      <span class="input-group-text">
                        <i class="tim-icons icon-single-02 text-success"></i>
                      </span>
                    </template>
                    <small v-if="brandingErrors.tiktok" class="text-danger">
                      <i class="tim-icons icon-alert-circle-exc"></i>
                      {{ brandingErrors.tiktok }}
                    </small>
                  </base-input>
                </div>
              </div>
            </div>

            <!-- Unified Form Actions -->
            <div class="row mt-5">
              <div class="col-md-12">
                <div class="form-actions text-center">
                  <base-button
                    type="primary"
                    size="lg"
                    :disabled="!isAllFormValid || !hasAnyChanges || isSubmitting"
                    @click="submitAllInfo"
                    class="btn-update-all"
                  >
                    <i class="tim-icons icon-check-2" v-if="!isSubmitting"></i>
                    <i class="fa fa-spinner fa-spin" v-if="isSubmitting"></i>
                    {{ isSubmitting ? 'Updating All Information...' : 'Update All Information' }}
                  </base-button>

                  <base-button
                    type="secondary"
                    size="lg"
                    @click="resetAllForms"
                    :disabled="!hasAnyChanges || isSubmitting"
                    class="ml-3"
                  >
                    <i class="tim-icons icon-refresh-01"></i>
                    Reset All Changes
                  </base-button>

                  <router-link to="/dashboard" class="btn btn-link btn-lg ml-3">
                    <i class="tim-icons icon-minimal-left"></i>
                    Cancel
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Unified Form Status Indicator -->
            <div class="row mt-3" v-if="hasAnyChanges">
              <div class="col-md-12">
                <div class="alert alert-info alert-sm text-center">
                  <i class="tim-icons icon-bell-55"></i>
                  You have unsaved changes in your restaurant information
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
import { restaurantInfo, getRestaurantInfo, isLoading, error } from '@/stores/restaurant';
import api from '@/axios';

export default {
  name: 'EditRestaurantInfo',
  components: {
    BaseInput,
    BaseButton,
    Card
  },
  data() {
    return {
      info: {
        name: '',
        headline: '',
        description: '',
        currency: ''
      },
      originalInfo: {
        name: '',
        headline: '',
        description: '',
        currency: ''
      },
      contact: {
        address: '',
        phone_number: '',
        phone_fix: '',
        gmail: ''
      },
      originalContact: {
        address: '',
        phone_number: '',
        phone_fix: '',
        gmail: ''
      },
      branding: {
        logo_light_theme_url: '',
        cover_image_url: '',
        google_maps_link: '',
        facebook: '',
        instagram: '',
        youtube: '',
        snapchat: '',
        tiktok: ''
      },
      originalBranding: {
        logo_light_theme_url: '',
        cover_image_url: '',
        google_maps_link: '',
        facebook: '',
        instagram: '',
        youtube: '',
        snapchat: '',
        tiktok: ''
      },
      errors: {},
      contactErrors: {},
      brandingErrors: {},
      isSubmitting: false,
      showSuccessMessage: false
    }
  },
  computed: {
    isLoading() {
      return isLoading.value;
    },
    error() {
      return error.value;
    },
    hasChanges() {
      return JSON.stringify(this.info) !== JSON.stringify(this.originalInfo);
    },
    hasContactChanges() {
      return JSON.stringify(this.contact) !== JSON.stringify(this.originalContact);
    },
    hasBrandingChanges() {
      return JSON.stringify(this.branding) !== JSON.stringify(this.originalBranding);
    },
    hasAnyChanges() {
      return this.hasChanges || this.hasContactChanges || this.hasBrandingChanges;
    },
    isFormValid() {
      return this.info.name.trim().length >= 2 &&
             this.info.name.trim().length <= 100 &&
             this.info.headline.trim().length >= 5 &&
             this.info.headline.trim().length <= 150 &&
             this.info.description.trim().length >= 20 &&
             this.info.description.trim().length <= 500 &&
             this.info.currency.trim().length >= 3;
    },
    isContactFormValid() {
      return this.contact.address.trim().length >= 5 &&
             this.contact.phone_number.trim().length >= 8 &&
             this.isValidEmail(this.contact.gmail);
    },
    isBrandingFormValid() {
      // Validate URLs only if fields are non-empty - without side effects
      const urlFields = [
        'logo_light_theme_url',
        'cover_image_url',
        'google_maps_link',
        'facebook',
        'instagram',
        'youtube',
        'snapchat',
        'tiktok'
      ];

      return urlFields.every(field => {
        const value = this.branding[field];
        return !value || this.isValidUrl(value);
      });
    },
    isAllFormValid() {
      return this.isFormValid && this.isContactFormValid && this.isBrandingFormValid;
    }
  },
  watch: {
    restaurantInfo: {
      handler(newVal) {
        if (newVal) {
          this.loadRestaurantData();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async getRestaurantInfo() {
      try {
        await getRestaurantInfo();
        this.loadRestaurantData();
      } catch (err) {
        console.error('Error fetching restaurant info:', err);
        this.showErrorNotification('Failed to load restaurant information');
      }
    },
    loadRestaurantData() {
      if (!restaurantInfo.value) return;

      this.info = {
        name: restaurantInfo.value.name || '',
        headline: restaurantInfo.value.headline || '',
        description: restaurantInfo.value.description || '',
        currency: restaurantInfo.value.currency || ''
      };
      this.originalInfo = { ...this.info };

      this.contact = {
        address: restaurantInfo.value.address || '',
        phone_number: restaurantInfo.value.phone_number || '',
        phone_fix: restaurantInfo.value.phone_fix || '',
        gmail: restaurantInfo.value.gmail || ''
      };
      this.originalContact = { ...this.contact };

      this.branding = {
        logo_light_theme_url: restaurantInfo.value.logo_light_theme_url || '',
        cover_image_url: restaurantInfo.value.cover_image_url || '',
        google_maps_link: restaurantInfo.value.google_maps_link || '',
        facebook: restaurantInfo.value.facebook || '',
        instagram: restaurantInfo.value.instagram || '',
        youtube: restaurantInfo.value.youtube || '',
        snapchat: restaurantInfo.value.snapchat || '',
        tiktok: restaurantInfo.value.tiktok || ''
      };
      this.originalBranding = { ...this.branding };
    },
    validateForm() {
      this.errors = {};
      let isValid = true;

      if (!this.info.name || this.info.name.trim().length < 2) {
        this.errors.name = 'Restaurant name must be at least 2 characters long';
        isValid = false;
      } else if (this.info.name.length > 100) {
        this.errors.name = 'Restaurant name must be less than 100 characters';
        isValid = false;
      }

      if (!this.info.headline || this.info.headline.trim().length < 5) {
        this.errors.headline = 'Headline must be at least 5 characters long';
        isValid = false;
      } else if (this.info.headline.length > 150) {
        this.errors.headline = 'Headline must be less than 150 characters';
        isValid = false;
      }

      if (!this.info.description || this.info.description.trim().length < 20) {
        this.errors.description = 'Description must be at least 20 characters long';
        isValid = false;
      } else if (this.info.description.length > 500) {
        this.errors.description = 'Description must be less than 500 characters';
        isValid = false;
      }

      if (!this.info.currency || this.info.currency.trim().length < 3) {
        this.errors.currency = 'Currency must be at least 3 characters long (e.g., USD)';
        isValid = false;
      }

      return isValid;
    },
    validateContactForm() {
      this.contactErrors = {};
      let isValid = true;

      if (!this.contact.address || this.contact.address.trim().length < 5) {
        this.contactErrors.address = 'Address must be at least 5 characters long';
        isValid = false;
      }

      if (!this.contact.phone_number || this.contact.phone_number.trim().length < 8) {
        this.contactErrors.phone_number = 'Mobile phone must be at least 8 characters long';
        isValid = false;
      }

      if (this.contact.phone_fix && this.contact.phone_fix.trim().length < 8) {
        this.contactErrors.phone_fix = 'Fixed phone must be at least 8 characters long';
        isValid = false;
      }

      if (!this.contact.gmail || !this.isValidEmail(this.contact.gmail)) {
        this.contactErrors.gmail = 'Please enter a valid email address';
        isValid = false;
      }

      return isValid;
    },
    validateBrandingForm() {
      this.brandingErrors = {};
      let isValid = true;

      // Validate URLs only if fields are non-empty
      if (this.branding.logo_light_theme_url && !this.isValidUrl(this.branding.logo_light_theme_url)) {
        this.brandingErrors.logo_light_theme_url = 'Please enter a valid URL';
        isValid = false;
      }
      if (this.branding.cover_image_url && !this.isValidUrl(this.branding.cover_image_url)) {
        this.brandingErrors.cover_image_url = 'Please enter a valid URL';
        isValid = false;
      }
      if (this.branding.google_maps_link && !this.isValidUrl(this.branding.google_maps_link)) {
        this.brandingErrors.google_maps_link = 'Please enter a valid Google Maps URL';
        isValid = false;
      }
      if (this.branding.facebook && !this.isValidUrl(this.branding.facebook)) {
        this.brandingErrors.facebook = 'Please enter a valid Facebook URL';
        isValid = false;
      }
      if (this.branding.instagram && !this.isValidUrl(this.branding.instagram)) {
        this.brandingErrors.instagram = 'Please enter a valid Instagram URL';
        isValid = false;
      }
      if (this.branding.youtube && !this.isValidUrl(this.branding.youtube)) {
        this.brandingErrors.youtube = 'Please enter a valid YouTube URL';
        isValid = false;
      }
      if (this.branding.snapchat && !this.isValidUrl(this.branding.snapchat)) {
        this.brandingErrors.snapchat = 'Please enter a valid Snapchat URL';
        isValid = false;
      }
      if (this.branding.tiktok && !this.isValidUrl(this.branding.tiktok)) {
        this.brandingErrors.tiktok = 'Please enter a valid TikTok URL';
        isValid = false;
      }

      return isValid;
    },
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    isValidUrl(url) {
      // Enhanced regex to handle complex URLs including TikTok and Google Maps
      // Supports: protocols, subdomains, domains, ports, paths, query params, fragments
      const urlRegex = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)*\.[\w\-]{2,}|localhost)(:\d+)?(\/[^\s]*)?$/i;
      return url === '' || urlRegex.test(url);
    },
    clearFieldError(field) {
      if (this.errors[field]) delete this.errors[field];
    },
    clearContactFieldError(field) {
      if (this.contactErrors[field]) delete this.contactErrors[field];
    },
    clearBrandingFieldError(field) {
      if (this.brandingErrors[field]) delete this.brandingErrors[field];
    },
    async submitAllInfo() {
      if (!this.validateForm() || !this.validateContactForm() || !this.validateBrandingForm()) {
        this.showErrorNotification('Please fix the errors in the form');
        return;
      }

      this.isSubmitting = true;
      this.showSuccessMessage = false;

      try {
        const payload = {
          name: this.info.name.trim(),
          headline: this.info.headline.trim(),
          description: this.info.description.trim(),
          currency: this.info.currency.trim(),
          address: this.contact.address.trim(),
          phone_number: this.contact.phone_number.trim(),
          phone_fix: this.contact.phone_fix.trim(),
          gmail: this.contact.gmail.trim(),
          logo_light_theme_url: this.branding.logo_light_theme_url.trim(),
          cover_image_url: this.branding.cover_image_url.trim(),
          google_maps_link: this.branding.google_maps_link.trim(),
          facebook: this.branding.facebook.trim(),
          instagram: this.branding.instagram.trim(),
          youtube: this.branding.youtube.trim(),
          snapchat: this.branding.snapchat.trim(),
          tiktok: this.branding.tiktok.trim()
        };
        const response = await api.put('restaurant', payload);
        restaurantInfo.value = response.data;

        this.originalInfo = { ...this.info };
        this.originalContact = { ...this.contact };
        this.originalBranding = { ...this.branding };

        this.showSuccessMessage = true;
        this.showSuccessNotification('All restaurant information updated successfully!');

        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 5000);
      } catch (err) {
        console.error('Error updating restaurant info:', err.response || err);
        if (err.response && err.response.status === 422) {
          const serverErrors = err.response.data.errors;
          this.errors = { ...this.errors, ...serverErrors };
          this.contactErrors = { ...this.contactErrors, ...serverErrors };
          this.brandingErrors = { ...this.brandingErrors, ...serverErrors };
          this.showErrorNotification('Please fix the form errors');
        } else {
          this.showErrorNotification('Failed to update restaurant information. Please try again.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    resetAllForms() {
      this.info = { ...this.originalInfo };
      this.errors = {};

      this.contact = { ...this.originalContact };
      this.contactErrors = {};

      this.branding = { ...this.originalBranding };
      this.brandingErrors = {};

      this.showSuccessMessage = false;
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
    await this.getRestaurantInfo();

    this.$nextTick(() => {
      const nameInput = this.$el.querySelector('input[placeholder*="restaurant name"]');
      if (nameInput) nameInput.focus();
    });
  }
};
</script>

<style scoped>
.loading-container {
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.error-container {
  padding: 2rem;
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

.alert-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.alert-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.alert-info {
  background-color: #cce7ff;
  border-color: #1d8cf8;
  color: #0c5aa6;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.75rem 1.25rem;
  color: inherit;
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  opacity: 0.5;
  cursor: pointer;
}

.close:hover {
  opacity: 0.75;
}

.btn-link {
  color: #1d8cf8;
  text-decoration: none;
}

.btn-link:hover {
  color: #0c5aa6;
  text-decoration: underline;
}

textarea + small {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

textarea.form-control:focus {
  border-color: #1d8cf8;
  box-shadow: 0 0 0 0.2rem rgba(29, 140, 248, 0.25);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-actions .btn {
    display: block;
    width: 100%;
    margin: 0.5rem 0;
  }

  .form-actions .btn-link {
    display: inline-block;
    width: auto;
    margin: 1rem 0 0 0;
  }
}
</style>
